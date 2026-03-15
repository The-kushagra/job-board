import { pgEnum, pgTable, varchar } from "drizzle-orm/pg-core"
import { createdAt, id, updatedAt } from "../schemaHelpers"
import { OrganizationTable } from "./organization"
import { UserTable } from "./user"

export const organizationUserRoles = ["admin", "member", "owner"] as const
export type OrganizationUserRole = (typeof organizationUserRoles)[number]
export const organizationUserRoleEnum = pgEnum(
    "organization_user_role",
    organizationUserRoles
)

export const OrganizationUserSettingsTable = pgTable(
    "organization_user_settings",
    {
        id,
        userId: varchar()
            .references(() => UserTable.id, { onDelete: "cascade" })
            .notNull(),
        organizationId: varchar()
            .references(() => OrganizationTable.id, { onDelete: "cascade" })
            .notNull(),
        role: organizationUserRoleEnum().notNull().default("member"),
        createdAt,
        updatedAt,
    }
)
import { relations } from "drizzle-orm"

export const organizationUserSettingsRelations = relations(
    OrganizationUserSettingsTable,
    ({ one }) => ({
        user: one(UserTable, {
            fields: [OrganizationUserSettingsTable.userId],
            references: [UserTable.id],
        }),
        organization: one(OrganizationTable, {
            fields: [OrganizationUserSettingsTable.organizationId],
            references: [OrganizationTable.id],
        }),
    })
)
