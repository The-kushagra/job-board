import { auth } from "@clerk/nextjs/server"
import { db } from "@/drizzle/db"
import { UserResumeTable } from "@/drizzle/schema"
import { eq, desc } from "drizzle-orm"
import { upsertResumeEmbedding } from "@/lib/vectorSync"

async function extractTextFromPDF(fileBytes: ArrayBuffer): Promise<string> {
  const { extractText } = await import("unpdf")
  const result = await extractText(new Uint8Array(fileBytes))
  const text = Array.isArray(result.text) ? result.text.join("\n") : result.text
  return text || ""
}

export async function POST(req: Request) {
  const { userId } = await auth()

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("resume") as File

    if (!file || file.size === 0) {
      return Response.json(
        { error: "No file provided." },
        { status: 400 }
      )
    }

    if (file.type !== "application/pdf") {
      return Response.json(
        { error: "Only PDF files are accepted." },
        { status: 400 }
      )
    }

    // Extract text from the PDF
    const bytes = await file.arrayBuffer()
    const resumeText = await extractTextFromPDF(bytes)

    if (!resumeText || resumeText.length < 10) {
      return Response.json(
        { error: "Could not extract text from the PDF. Please ensure the file is not scanned/image-only." },
        { status: 422 }
      )
    }

    // Check if a resume already exists for the user
    const existingResume = await db.query.UserResumeTable.findFirst({
      where: eq(UserResumeTable.userId, userId),
      orderBy: desc(UserResumeTable.createdAt),
    })

    let resumeId: string

    if (existingResume) {
      // Update the existing resume
      const [updated] = await db
        .update(UserResumeTable)
        .set({
          resumeUrl: file.name,
          resumeText,
          updatedAt: new Date(),
        })
        .where(eq(UserResumeTable.id, existingResume.id))
        .returning({ id: UserResumeTable.id })

      resumeId = updated.id
    } else {
      // Insert a new resume
      const [inserted] = await db
        .insert(UserResumeTable)
        .values({
          userId,
          resumeUrl: file.name,
          resumeText,
        })
        .returning({ id: UserResumeTable.id })

      resumeId = inserted.id
    }

    // Upsert resume embedding to Pinecone (non-blocking)
    upsertResumeEmbedding(userId, resumeText).catch((err) =>
      console.error("Pinecone resume embedding upsert failed:", err)
    )

    return Response.json({
      success: true,
      resumeId,
      message: "Resume uploaded successfully.",
    })

  } catch (error: any) {
    console.error("Resume upload failed:", error)
    return Response.json(
      { error: `Upload failed: ${error?.message || "Internal error"}` },
      { status: 500 }
    )
  }
}
