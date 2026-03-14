import { pgTable, text, varchar, uuid } from "drizzle-orm/pg-core"
import { createdAt, id, updatedAt } from "../schemaHelpers"
import { JobListingTable } from "./jobListing"
import { UserTable } from "./user"

export const JobListingApplicationTable = pgTable("job_listing_applications", {
    id,
    jobListingId: uuid()
        .references(() => JobListingTable.id, { onDelete: "cascade" })
        .notNull(),
    userId: varchar()
        .references(() => UserTable.id, { onDelete: "cascade" })
        .notNull(),
    status: varchar().notNull().default("applied"),
    resumeUrl: varchar().notNull(),
    resumeText: text(),
    aiScore: varchar(),
    aiFeedback: text(),
    matchingSkills: text(), 
    missingSkills: text(),
    createdAt,
    updatedAt,
})

import { relations } from "drizzle-orm"

export const jobListingApplicationRelations = relations(
    JobListingApplicationTable,
    ({ one }) => ({
        jobListing: one(JobListingTable, {
            fields: [JobListingApplicationTable.jobListingId],
            references: [JobListingTable.id],
        }),
        user: one(UserTable, {
            fields: [JobListingApplicationTable.userId],
            references: [UserTable.id],
        }),
    })
)
