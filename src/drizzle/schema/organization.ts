import { pgTable, varchar } from "drizzle-orm/pg-core"
import { createdAt, updatedAt } from "../schemaHelpers"

export const OrganizationTable = pgTable("organizations", {
    id: varchar().primaryKey(),
    name: varchar().notNull(),
    imageUrl: varchar().notNull(),
    createdAt,
    updatedAt,
})
import { relations } from "drizzle-orm"
import { JobListingTable } from "./jobListing"
import { OrganizationUserSettingsTable } from "./organizationUserSettings"

export const organizationRelations = relations(OrganizationTable, ({ many }) => ({
    jobs: many(JobListingTable),
    userSettings: many(OrganizationUserSettingsTable),
}))
