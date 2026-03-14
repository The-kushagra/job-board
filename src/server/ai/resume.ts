import OpenAI from "openai"

function getClient() {
  const apiKey = process.env.GROQ_API_KEY?.trim()
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing or empty")
  }
  return new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
  })
}

export async function analyzeResume(resumeText: string, jobDescription: string) {
  try {
    const client = getClient()
    const prompt = `
      You are an expert technical recruiter. Analyze the following resume against the job description.
      
      Job Description:
      ${jobDescription}
      
      Resume:
      ${resumeText}
      
      Provide a JSON response with:
      1. "score": A number from 0-100 indicating how well the candidate matches.
      2. "feedback": A 2-3 sentence summary of the match.
      3. "matchingSkills": An array of skills from the resume that match the job.
      4. "missingSkills": An array of important skills from the job description missing in the resume.
      
      Response MUST be valid JSON only, no markdown formatting.
    `

    const result = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
    })

    const text = result.choices[0]?.message?.content || ""
    
    // Extract JSON from potential markdown formatting
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const parsedData = JSON.parse(jsonMatch ? jsonMatch[0] : text)
    
    return {
      score: parsedData.score ?? 0,
      feedback: parsedData.feedback ?? "Analytical feedback unavailable.",
      matchingSkills: parsedData.matchingSkills ?? [],
      missingSkills: parsedData.missingSkills ?? [],
    }
  } catch (error: any) {
    console.error("AI Analysis failed DETAILED:", error)
    return {
      score: 0,
      feedback: `AI Analysis failed: ${error?.message || "Internal error"}.`,
      matchingSkills: [],
      missingSkills: [],
    }
  }
}
