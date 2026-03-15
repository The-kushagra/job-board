import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
    server: {
        DATABASE_URL: z.string().min(1),
        CLERK_SECRET_KEY: z.string().min(1),
        CLERK_WEBHOOK_SECRET: z.string().min(1),
        GEMINI_API_KEY: z.string().optional(),
        GROQ_API_KEY: z.string().optional(),
        PINECONE_API_KEY: z.string().min(1),
        SERVER_URL: z.string().min(1).optional(),
    },
    emptyStringAsUndefined: true,
    experimental__runtimeEnv: process.env,
})
