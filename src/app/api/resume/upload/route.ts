import { auth, currentUser } from "@clerk/nextjs/server"
import { db } from "@/drizzle/db"
import { UserResumeTable, UserTable } from "@/drizzle/schema"
import { eq, desc } from "drizzle-orm"
import { upsertResumeEmbedding } from "@/lib/vectorSync"

async function extractTextFromPDF(fileBytes: ArrayBuffer): Promise<string> {
  const { extractText } = await import("unpdf")
  const result = await extractText(new Uint8Array(fileBytes))
  const text = Array.isArray(result.text) ? result.text.join("\n") : result.text
  return text || ""
}

export async function POST(req: Request) {
  const user = await currentUser()

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = user.id

  try {
    // Ensure the user exists in the DB before resume insert (safeguard against webhook delay)
    await db.insert(UserTable).values({
      id: user.id,
      name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'User',
      email: user.emailAddresses[0]?.emailAddress ?? '',
      imageUrl: user.imageUrl ?? '',
    }).onConflictDoUpdate({
      target: UserTable.id,
      set: {
        name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'User',
        email: user.emailAddresses[0]?.emailAddress ?? '',
        imageUrl: user.imageUrl ?? '',
        updatedAt: new Date(),
      }
    })

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

    // Log the exact schema field names being used to confirm they match
    console.log("Database schema check - Table: user_resumes", {
      fields: ["id", "userId", "resumeUrl", "resumeText", "createdAt", "updatedAt"]
    })

    const fileName = String(file.name || "resume.pdf")

    // Use an upsert based on userId
    const [resume] = await db
      .insert(UserResumeTable)
      .values({
        id: crypto.randomUUID(),
        userId,
        resumeUrl: fileName,
        resumeText,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: UserResumeTable.userId,
        set: {
          resumeUrl: fileName,
          resumeText,
          updatedAt: new Date(),
        },
      })
      .returning({ id: UserResumeTable.id })

    const resumeId = resume.id

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
