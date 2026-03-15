"use server"

import { db } from "@/drizzle/db"
import { OrganizationTable, OrganizationUserSettingsTable, UserTable } from "@/drizzle/schema"
import { auth, currentUser } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"
import { revalidatePath, unstable_noStore as noStore } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

const createOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
})

async function syncUser(clerkUserId: string) {
  const user = await db.query.UserTable.findFirst({
    where: eq(UserTable.id, clerkUserId),
  })

  if (user) return user

  const clerkUser = await currentUser()
  if (!clerkUser) throw new Error("User not found in Clerk")

  const [newUser] = await db
    .insert(UserTable)
    .values({
      id: clerkUserId,
      name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || clerkUser.username || "User",
      imageUrl: clerkUser.imageUrl,
      email: clerkUser.emailAddresses[0].emailAddress,
    })
    .returning()

  return newUser
}

export async function createOrganization(formData: z.infer<typeof createOrganizationSchema>) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  await syncUser(userId)

  const validatedFields = createOrganizationSchema.safeParse(formData)

  if (!validatedFields.success) {
    return {
      error: "Invalid fields",
    }
  }

  const { name } = validatedFields.data

  try {
    const [organization] = await db
      .insert(OrganizationTable)
      .values({
        id: crypto.randomUUID(),
        name,
        imageUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${name}`,
      })
      .returning()

    await db.insert(OrganizationUserSettingsTable).values({
      userId,
      organizationId: organization.id,
      role: "admin",
    })

    revalidatePath("/", "layout")
  } catch (error) {
    console.error("DETAILED ERROR:", error)
    return {
      error: "Failed to create organization",
    }
  }

  redirect("/dashboard")
}
export async function deleteOrganization(organizationId: string) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  // Verify admin status
  const userSettings = await db.query.OrganizationUserSettingsTable.findFirst({
    where: eq(OrganizationUserSettingsTable.organizationId, organizationId),
    columns: {
      role: true,
      userId: true
    }
  })

  // We should actually check specifically for the current user's role in THIS organization
  const currentUserSettings = await db.query.OrganizationUserSettingsTable.findFirst({
    where: (table, { and, eq }) => and(
        eq(table.organizationId, organizationId),
        eq(table.userId, userId)
    )
  })

  if (!currentUserSettings || currentUserSettings.role !== "admin") {
    return {
      error: "Only organization admins can delete the organization",
    }
  }

  try {
    await db.delete(OrganizationTable).where(eq(OrganizationTable.id, organizationId))
    revalidatePath("/", "layout")
  } catch (error) {
    console.error("DELETE ORGANIZATION ERROR:", error)
    return {
      error: "Failed to delete organization",
    }
  }

  redirect("/dashboard")
}
export async function getUserOrganizations() {
  noStore()
  const { userId } = await auth()
  if (!userId) return []

  return db
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
}
