import { pgTable, text, varchar } from "drizzle-orm/pg-core"
import { createdAt, id, updatedAt } from "../schemaHelpers"
import { UserTable } from "./user"

export const UserResumeTable = pgTable("user_resumes", {
    id,
    userId: varchar()
        .references(() => UserTable.id, { onDelete: "cascade" })
        .notNull(),
    resumeUrl: varchar().notNull(),
    resumeText: text(),
    createdAt,
    updatedAt,
})
