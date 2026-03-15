import { auth } from "@clerk/nextjs/server"
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

export async function POST(req: Request) {
  const { userId } = await auth()

  if (!userId) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const { messages, role } = await req.json()

  if (!messages || !Array.isArray(messages)) {
    return Response.json(
      { error: "Missing or invalid messages" },
      { status: 400 }
    )
  }

  const systemPrompt = role === 'recruiter'
    ? "You are NextHire's AI assistant helping recruiters. You help hiring managers understand their applicant pipeline, AI ranking scores, and recruitment metrics. Be professional, data-driven, and concise."
    : "You are NextHire's AI assistant helping job seekers. You help candidates find relevant jobs, improve their resumes, understand their AI match scores, and track their applications. Be friendly, concise, and encouraging. You have access to the NextHire platform."

  try {
    const client = getGroqClient()

    const stream = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      stream: true,
    })

    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || ""
          if (content) {
            controller.enqueue(encoder.encode(content))
          }
        }
        controller.close()
      },
    })

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    })
  } catch (error: any) {
    console.error("Chat API error:", error)
    return Response.json(
      { error: "AI chat failed" },
      { status: 500 }
    )
  }
}
