import { boolean, pgTable, varchar } from "drizzle-orm/pg-core"
import { createdAt, id, updatedAt } from "../schemaHelpers"
import { UserTable } from "./user"

export const UserNotificationSettingsTable = pgTable(
    "user_notification_settings",
    {
        id,
        userId: varchar()
            .references(() => UserTable.id, { onDelete: "cascade" })
            .notNull()
            .unique(),
        canSendEmails: boolean().notNull().default(false),
        createdAt,
        updatedAt,
    }
)
