import { getPineconeIndex } from "./pinecone"
import { generateEmbedding } from "./embeddings"

/**
 * Upsert a resume embedding into the Pinecone "resumes" namespace.
 */
export async function upsertResumeEmbedding(
  userId: string,
  resumeText: string
) {
  const embedding = await generateEmbedding(resumeText)
  const index = getPineconeIndex()

  await index.namespace("resumes").upsert({
    records: [
      {
        id: userId,
        values: embedding,
        metadata: { userId },
      },
    ],
  })
}

/**
 * Upsert a job listing embedding into the Pinecone "jobs" namespace.
 */
export async function upsertJobEmbedding(jobId: string, jobText: string) {
  const embedding = await generateEmbedding(jobText)
  const index = getPineconeIndex()

  await index.namespace("jobs").upsert({
    records: [
      {
        id: jobId,
        values: embedding,
        metadata: { jobId },
      },
    ],
  })
}

/**
 * Find the most relevant jobs for a given resume text using vector similarity.
 * Returns an array of { jobId, score } sorted by score descending.
 */
export async function findMatchingJobs(
  resumeText: string,
  topK: number = 10
): Promise<{ jobId: string; score: number }[]> {
  const embedding = await generateEmbedding(resumeText)
  const index = getPineconeIndex()

  const results = await index.namespace("jobs").query({
    vector: embedding,
    topK,
    includeMetadata: true,
  })

  return (results.matches ?? [])
    .filter((m) => m.score !== undefined)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .map((m) => ({
      jobId: (m.metadata?.jobId as string) ?? m.id,
      score: m.score ?? 0,
    }))
}

/**
 * Find the most relevant candidates for a given job text using vector similarity.
 * Returns an array of { userId, score } sorted by score descending.
 */
export async function findMatchingCandidates(
  jobText: string,
  topK: number = 20
): Promise<{ userId: string; score: number }[]> {
  const embedding = await generateEmbedding(jobText)
  const index = getPineconeIndex()

  const results = await index.namespace("resumes").query({
    vector: embedding,
    topK,
    includeMetadata: true,
  })

  return (results.matches ?? [])
    .filter((m) => m.score !== undefined)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .map((m) => ({
      userId: (m.metadata?.userId as string) ?? m.id,
      score: m.score ?? 0,
    }))
}
