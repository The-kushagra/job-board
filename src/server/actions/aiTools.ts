"use server"

import { auth } from "@clerk/nextjs/server"
import { 
  generateJobDescription as aiGenerate,
  generateCandidateSummary as aiSummarize
} from "../ai/jobDescription"

export async function generateJobDescriptionAction(title: string, requirements?: string) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  if (!title || title.length < 3) {
    return { error: "Please provide a valid job title (min 3 chars)." }
  }

  return await aiGenerate(title, requirements)
}

export async function generateCandidateSummaryAction(resumeText: string, jobDescription: string) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  return await aiSummarize(resumeText, jobDescription)
}
