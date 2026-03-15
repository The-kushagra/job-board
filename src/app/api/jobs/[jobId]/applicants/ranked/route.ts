import { auth } from "@clerk/nextjs/server"
import { db } from "@/drizzle/db"
import {
  JobListingTable,
  JobListingApplicationTable,
  UserTable,
} from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import OpenAI from "openai"

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY?.trim()
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing or empty")
  }
  return new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
  })
}

async function scoreWithAI(
  jobTitle: string,
  jobDescription: string,
  resumeText: string
): Promise<{ score: number; reason: string }> {
  const client = getGroqClient()

  const prompt = `Given this job description: "${jobTitle} — ${jobDescription}", and this candidate resume: "${resumeText}", give a match score from 0-100 and a one sentence reason. Respond only in JSON: {"score": number, "reason": string}`

  const result = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
  })

  const text = result.choices[0]?.message?.content || ""
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text)

  return {
    score: parsed.score ?? 0,
    reason: parsed.reason ?? "No reason provided.",
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { jobId } = await params

  // Fetch the job listing
  const job = await db.query.JobListingTable.findFirst({
    where: eq(JobListingTable.id, jobId),
  })

  if (!job) {
    return Response.json({ error: "Job not found" }, { status: 404 })
  }

  // Fetch all applications for this job with user data
  const applications = await db
    .select({
      id: JobListingApplicationTable.id,
      status: JobListingApplicationTable.status,
      aiScore: JobListingApplicationTable.aiScore,
      aiFeedback: JobListingApplicationTable.aiFeedback,
      resumeText: JobListingApplicationTable.resumeText,
      createdAt: JobListingApplicationTable.createdAt,
      userName: UserTable.name,
      userEmail: UserTable.email,
      userImage: UserTable.imageUrl,
    })
    .from(JobListingApplicationTable)
    .innerJoin(UserTable, eq(JobListingApplicationTable.userId, UserTable.id))
    .where(eq(JobListingApplicationTable.jobListingId, jobId))

  // Process each application — use existing score or call AI
  const rankedApplicants = await Promise.all(
    applications.map(async (app) => {
      let score = parseInt(app.aiScore || "0")
      let reason = app.aiFeedback || ""

      // If no saved score yet and we have resume text, call AI
      if (!app.aiScore && app.resumeText) {
        try {
          const aiResult = await scoreWithAI(
            job.title,
            job.description,
            app.resumeText
          )
          score = aiResult.score
          reason = aiResult.reason

          // Save the score back to the database
          await db
            .update(JobListingApplicationTable)
            .set({
              aiScore: score.toString(),
              aiFeedback: reason,
            })
            .where(eq(JobListingApplicationTable.id, app.id))
        } catch (error) {
          console.error(`AI scoring failed for application ${app.id}:`, error)
          score = 0
          reason = "AI scoring unavailable."
        }
      }

      return {
        id: app.id,
        name: app.userName,
        email: app.userEmail,
        imageUrl: app.userImage,
        status: app.status,
        score,
        reason,
        appliedAt: app.createdAt,
      }
    })
  )

  // Sort by score descending
  rankedApplicants.sort((a, b) => b.score - a.score)

  return Response.json({ applicants: rankedApplicants })
}
