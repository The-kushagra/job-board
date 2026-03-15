import { Webhook } from "svix"
import { headers } from "next/headers"
import { WebhookEvent } from "@clerk/nextjs/server"
import { env } from "@/data/env/server"
import { db } from "@/drizzle/db"
import { 
    UserTable, 
    OrganizationTable, 
    OrganizationUserSettingsTable 
} from "@/drizzle/schema"
import { eq, and } from "drizzle-orm"

export async function POST(req: Request) {
    const headerPayload = await headers()
    const svix_id = headerPayload.get("svix-id")
    const svix_timestamp = headerPayload.get("svix-timestamp")
    const svix_signature = headerPayload.get("svix-signature")

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response("Error occurred -- no svix headers", {
            status: 400,
        })
    }

    const payload = await req.json()
    const body = JSON.stringify(payload)

    const wh = new Webhook(env.CLERK_WEBHOOK_SECRET)

    let evt: WebhookEvent

    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as WebhookEvent
    } catch (err) {
        console.error("Error verifying webhook:", err)
        return new Response("Error occurred", {
            status: 400,
        })
    }

    const eventType = evt.type
    console.log(`Processing Clerk webhook: ${eventType}`, { id: (evt.data as any).id })

    try {
        if (eventType === "user.created" || eventType === "user.updated") {
            const { id, first_name, last_name, image_url, email_addresses } = evt.data
            const email = email_addresses[0]?.email_address
            const name = `${first_name ?? ""} ${last_name ?? ""}`.trim()

            console.log(`Syncing user: ${id}`, { email, name })

            await db
                .insert(UserTable)
                .values({
                    id: id,
                    name: name || email || "User",
                    imageUrl: image_url || "",
                    email: email,
                })
                .onConflictDoUpdate({
                    target: UserTable.id,
                    set: {
                        name: name || email || "User",
                        imageUrl: image_url || "",
                        email: email,
                        updatedAt: new Date(),
                    },
                })
        }

        if (eventType === "user.deleted") {
            const { id } = evt.data
            if (id) {
                console.log(`Deleting user: ${id}`)
                await db.delete(UserTable).where(eq(UserTable.id, id))
            }
        }

        if (eventType === "organization.created" || eventType === "organization.updated") {
            const { id, name, image_url } = evt.data
            console.log(`Syncing organization: ${id}`, { name })
            
            await db.insert(OrganizationTable).values({
                id: id,
                name: name,
                imageUrl: image_url || "",
            }).onConflictDoUpdate({
                target: OrganizationTable.id,
                set: {
                    name: name,
                    imageUrl: image_url || "",
                    updatedAt: new Date(),
                }
            })
        }

        if (eventType === "organizationMembership.created") {
            const { organization, public_user_data, role } = evt.data
            const orgId = organization.id
            const userId = public_user_data.user_id
            
            console.log(`Creating membership: Org ${orgId}, User ${userId}, Role ${role}`)

            await db.insert(OrganizationUserSettingsTable).values({
                id: crypto.randomUUID(),
                organizationId: orgId,
                userId: userId,
                role: role === "org:admin" ? "admin" : "member",
            })
        }

        if (eventType === "organizationMembership.deleted") {
            const { organization, public_user_data } = evt.data
            const orgId = organization.id
            const userId = public_user_data.user_id

            console.log(`Deleting membership: Org ${orgId}, User ${userId}`)

            await db.delete(OrganizationUserSettingsTable).where(
                and(
                    eq(OrganizationUserSettingsTable.organizationId, orgId),
                    eq(OrganizationUserSettingsTable.userId, userId)
                )
            )
        }
    } catch (error) {
        console.error(`Error processing Clerk webhook ${eventType}:`, error)
        return new Response("Internal Server Error", { status: 500 })
    }

    return new Response("Webhook processed", { status: 200 })
}
