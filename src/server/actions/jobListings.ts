"use server"

import { db } from "@/drizzle/db"
import { JobListingTable, OrganizationUserSettingsTable } from "@/drizzle/schema"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { z } from "zod"
import { jobListingSchema } from "../schemas/jobListings"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { upsertJobEmbedding } from "@/lib/vectorSync"

export async function createJobListing(formData: z.infer<typeof jobListingSchema>) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  // Verify the user belongs to the organization and is an admin
  const userSettings = await db.query.OrganizationUserSettingsTable.findFirst({
    where: and(
      eq(OrganizationUserSettingsTable.userId, userId),
      eq(OrganizationUserSettingsTable.organizationId, formData.organizationId),
      eq(OrganizationUserSettingsTable.role, "admin")
    )
  })

  if (!userSettings) {
    throw new Error("You do not have permission to post for this organization")
  }

  const validatedFields = jobListingSchema.safeParse(formData)

  if (!validatedFields.success) {
    return {
      error: "Invalid fields",
    }
  }

  try {
    const [job] = await db
      .insert(JobListingTable)
      .values({
        ...validatedFields.data,
        id: crypto.randomUUID(),
        status: "published", // Default to published for now
        postedAt: new Date(),
      })
      .returning()

    // Upsert job embedding to Pinecone (non-blocking)
    const jobText = `${job.title} ${job.description}`
    upsertJobEmbedding(job.id, jobText).catch((err) =>
      console.error("Pinecone job embedding upsert failed:", err)
    )

    revalidatePath("/jobs")
    revalidatePath(`/organizations/${formData.organizationId}`)
  } catch (error) {
    console.error("Failed to create job:", error)
    return {
      error: "Failed to create job listing",
    }
  }

  redirect(`/organizations/${formData.organizationId}`)
}

