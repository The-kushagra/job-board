import { auth } from "@clerk/nextjs/server"
import { db } from "@/drizzle/db"
import { UserResumeTable, JobListingTable } from "@/drizzle/schema"
import { eq, desc, inArray } from "drizzle-orm"
import OpenAI from "openai"
import { findMatchingJobs } from "@/lib/vectorSync"

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

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  // Fetch the user's most recent resume
  const resume = await db.query.UserResumeTable.findFirst({
    where: eq(UserResumeTable.userId, userId),
    orderBy: desc(UserResumeTable.createdAt),
  })

  if (!resume?.resumeText) {
    return Response.json(
      { error: "no_resume", message: "No resume found for this user." },
      { status: 404 }
    )
  }

  // --- Strategy 1: Try Pinecone vector matching first ---
  try {
    const vectorMatches = await findMatchingJobs(resume.resumeText, 10)

    if (vectorMatches.length > 0) {
      const matchedJobIds = vectorMatches.map((m) => m.jobId)
      const scoreMap = new Map(
        vectorMatches.map((m) => [m.jobId, m.score])
      )

      const matchedJobs = await db.query.JobListingTable.findMany({
        where: inArray(JobListingTable.id, matchedJobIds),
        with: { organization: true },
      })

      const recommendations = matchedJobs
        .map((job) => {
          const vectorScore = scoreMap.get(job.id) ?? 0
          return {
            id: job.id,
            title: job.title,
            company: job.organization?.name ?? "Unknown",
            location:
              job.city && job.stateAbbreviation
                ? `${job.city}, ${job.stateAbbreviation}`
                : job.locationRequirement,
            type: job.type,
            matchScore: Math.round(vectorScore * 100),
            reason: `Vector similarity match (${Math.round(vectorScore * 100)}% relevance)`,
          }
        })
        .sort((a, b) => b.matchScore - a.matchScore)

      if (recommendations.length > 0) {
        return Response.json({ recommendations, source: "pinecone" })
      }
    }
  } catch (error) {
    console.error("Pinecone matching failed, falling back to Groq AI:", error)
  }

  // --- Strategy 2: Fall back to Groq AI ranking ---
  const jobs = await db.query.JobListingTable.findMany({
    where: eq(JobListingTable.status, "published"),
    with: {
      organization: true,
    },
  })

  if (jobs.length === 0) {
    return Response.json({ recommendations: [] })
  }

  // Build a condensed job list for the AI prompt
  const jobSummaries = jobs.map((job) => ({
    id: job.id,
    title: job.title,
    company: job.organization?.name ?? "Unknown",
    description: job.description.substring(0, 500),
  }))

  try {
    const client = getGroqClient()

    const prompt = `Given this candidate resume:
${resume.resumeText}

Rank these job listings from most to least relevant and return a JSON array of objects, each with:
- "id": the job ID (string)
- "match_score": a number from 0 to 100
- "reason": a one-sentence explanation of the match

Jobs:
${JSON.stringify(jobSummaries, null, 2)}

Response MUST be a valid JSON array only, no markdown formatting, no surrounding text.`

    const result = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
    })

    const text = result.choices[0]?.message?.content || "[]"

    // Extract JSON array from potential markdown formatting
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    const rankings: { id: string; match_score: number; reason: string }[] = JSON.parse(
      jsonMatch ? jsonMatch[0] : text
    )

    // Enrich rankings with full job data
    const recommendations = rankings
      .sort((a, b) => b.match_score - a.match_score)
      .map((rank) => {
        const job = jobs.find((j) => j.id === rank.id)
        if (!job) return null
        return {
          id: job.id,
          title: job.title,
          company: job.organization?.name ?? "Unknown",
          location: job.city && job.stateAbbreviation
            ? `${job.city}, ${job.stateAbbreviation}`
            : job.locationRequirement,
          type: job.type,
          matchScore: rank.match_score,
          reason: rank.reason,
        }
      })
      .filter(Boolean)

    return Response.json({ recommendations, source: "groq" })
  } catch (error: any) {
    console.error("Recommended jobs AI call failed:", error)
    return Response.json(
      { error: "ai_failed", message: `AI ranking failed: ${error?.message || "Internal error"}` },
      { status: 500 }
    )
  }
}
