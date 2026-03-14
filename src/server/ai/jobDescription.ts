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

export async function generateJobDescription(title: string, requirements?: string) {
  try {
    const client = getClient()
    const prompt = `
      You are an expert technical writer and recruiter. Draft a professional, engaging job description for the following role:
      
      Job Title: ${title}
      ${requirements ? `Additional Requirements/Context: ${requirements}` : ""}
      
      The description should include:
      1. A brief, exciting overview of the role.
      2. Key Responsibilities (bullet points).
      3. Required Skills & Qualifications (bullet points).
      4. Why Join Us section.
      
      Keep the tone professional yet inviting. Return ONLY the markdown content for the description.
    `

    const result = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
    })

    const text = result.choices[0]?.message?.content
    
    if (!text) {
      throw new Error("Empty response from Groq")
    }

    return { success: true, description: text }
  } catch (error: any) {
    console.error("AI Generation failed DETAILED:", error)
    
    let errorMessage = "AI Generation failed"
    if (error?.message) {
      errorMessage = error.message
    }

    return { 
      success: false, 
      error: `AI Error: ${errorMessage}. Check if your API key is valid.` 
    }
  }
}

export async function generateCandidateSummary(resumeText: string, jobDescription: string) {
  try {
    const client = getClient()
    const prompt = `
      You are an expert recruiter. Summarize the following candidate's suitability for this role.
      
      Job Description:
      ${jobDescription}
      
      Candidate Resume:
      ${resumeText}
      
      Provide a concise summary in markdown format focusing on:
      1. Key Strengths (3 bullet points max)
      2. Potential Concerns or Missing Skills (2 bullet points max)
      3. Overall "Fit" Recommendation.
      
      Keep it professional and objective.
    `

    const result = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
    })

    const text = result.choices[0]?.message?.content

    if (!text) {
      throw new Error("Empty response from Groq")
    }

    return { success: true, summary: text }
  } catch (error: any) {
    console.error("AI Candidate Summary failed DETAILED:", error)
    return { 
      success: false, 
      error: `AI Error: ${error?.message || "Unknown error"}. Check if your API key is valid.` 
    }
  }
}
