import { db } from "@/drizzle/db"
import { OrganizationUserSettingsTable } from "@/drizzle/schema"
import { eq } from "drizzle-orm"

export async function getUserRole(userId: string): Promise<'recruiter' | 'candidate'> {
  const membership = await db.query.OrganizationUserSettingsTable.findFirst({
    where: eq(OrganizationUserSettingsTable.userId, userId)
  })

  return membership ? 'recruiter' : 'candidate'
}
