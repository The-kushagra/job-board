import { env } from "@/data/env/server"
import { drizzle } from "drizzle-orm/node-postgres"
import * as schema from "@/drizzle/schema"
import { Pool } from "pg"

const pool = new Pool({
    connectionString: env.DATABASE_URL,
})

export const db = drizzle(pool, { schema })
