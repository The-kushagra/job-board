"use server"

import { db } from "@/drizzle/db"
import { JobListingApplicationTable, JobListingTable, OrganizationUserSettingsTable } from "@/drizzle/schema"
import { auth } from "@clerk/nextjs/server"
import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { analyzeResume } from "../ai/resume"

async function extractTextFromPDF(fileBytes: ArrayBuffer): Promise<string> {
  const { extractText } = await import("unpdf")
  const result = await extractText(new Uint8Array(fileBytes))
  const text = Array.isArray(result.text) ? result.text.join("\n") : result.text
  return text || ""
}


export async function applyToJob(formData: FormData) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  const jobListingId = formData.get("jobListingId") as string
  const file = formData.get("resume") as File
  const manualText = formData.get("resumeText") as string

  console.log("APPLY_TO_JOB: Start", { jobListingId, fileName: file?.name, fileSize: file?.size, hasManualText: !!manualText })

  if (!jobListingId) {
    return { error: "Missing Job ID" }
  }

  let resumeText = manualText

  if (file && file.size > 0) {
    console.log("APPLY_TO_JOB: Extracting text from PDF via Gemini...")
    try {
      const bytes = await file.arrayBuffer()
      resumeText = await extractTextFromPDF(bytes)
      console.log("APPLY_TO_JOB: PDF Text Extracted Successfully", { textLength: resumeText?.length })
    } catch (error) {
      console.error("APPLY_TO_JOB: PDF extraction failed:", error)
      return { error: `Failed to read PDF resume: ${error instanceof Error ? error.message : "Internal Error"}` }
    }
  }

  if (!resumeText || resumeText.length < 10) {
    return { error: "Resume content is too short or missing." }
  }

  // Fetch job description for AI analysis
  const job = await db.query.JobListingTable.findFirst({
    where: eq(JobListingTable.id, jobListingId),
  })

  if (!job) {
    throw new Error("Job not found")
  }

  try {
    // Perform AI Analysis
    const aiResult = await analyzeResume(resumeText, job.description)

    const [application] = await db
      .insert(JobListingApplicationTable)
      .values({
        id: crypto.randomUUID(),
        jobListingId,
        userId,
        resumeUrl: "uploaded-via-form",
        resumeText,
        aiScore: aiResult.score.toString(),
        aiFeedback: aiResult.feedback,
        matchingSkills: aiResult.matchingSkills?.join(", "),
        missingSkills: aiResult.missingSkills?.join(", "),
        status: "applied",
      })
      .returning()

    revalidatePath("/dashboard")
    revalidatePath(`/jobs/${jobListingId}`)
    revalidatePath(`/organizations/${job.organizationId}`)

    return { success: true, applicationId: application.id }
  } catch (error) {
    console.error("Failed to submit application:", error)
    return {
      error: "Failed to submit application. Please try again.",
    }
  }
}

export async function updateApplicationStatus(applicationId: string, status: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const application = await db.query.JobListingApplicationTable.findFirst({
    where: eq(JobListingApplicationTable.id, applicationId),
    with: {
      jobListing: true,
    },
  })

  if (!application) {
    return { error: "Application not found" }
  }

  const adminCheck = await db.query.OrganizationUserSettingsTable.findFirst({
    where: and(
      eq(OrganizationUserSettingsTable.userId, userId),
      eq(OrganizationUserSettingsTable.organizationId, application.jobListing.organizationId),
      eq(OrganizationUserSettingsTable.role, "admin")
    ),
  })

  if (!adminCheck) {
    return { error: "You don't have permission to manage this application." }
  }

  try {
    await db
      .update(JobListingApplicationTable)
      .set({ status })
      .where(eq(JobListingApplicationTable.id, applicationId))

    revalidatePath(`/organizations/${application.jobListing.organizationId}/jobs/${application.jobListingId}/applicants/${applicationId}`)
    
    return { success: true }
  } catch (error) {
    console.error("Failed to update application status:", error)
    return { error: "Failed to update status. Please try again." }
  }
}
