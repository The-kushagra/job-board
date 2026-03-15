import { auth } from "@clerk/nextjs/server"
import { db } from "@/drizzle/db"
import { OrganizationTable, OrganizationUserSettingsTable } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import { unstable_noStore as noStore } from "next/cache"

export async function GET() {
  noStore()
  const { userId } = await auth()

  if (!userId) {
    return Response.json([])
  }

  const userOrgs = await db
    .select({
      id: OrganizationTable.id,
      name: OrganizationTable.name,
    })
    .from(OrganizationTable)
    .innerJoin(
      OrganizationUserSettingsTable,
      eq(OrganizationTable.id, OrganizationUserSettingsTable.organizationId)
    )
    .where(eq(OrganizationUserSettingsTable.userId, userId))

  return Response.json(userOrgs)
}
