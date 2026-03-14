import { db } from "@/drizzle/db"
import { OrganizationTable, OrganizationUserSettingsTable, UserTable } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DeleteOrganizationButton } from "@/components/organizations/DeleteOrganizationButton"

export default async function OrganizationSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const organization = await db.query.OrganizationTable.findFirst({
    where: eq(OrganizationTable.id, id),
  })

  if (!organization) {
    notFound()
  }

  const members = await db
    .select({
      id: UserTable.id,
      name: UserTable.name,
      email: UserTable.email,
      imageUrl: UserTable.imageUrl,
      role: OrganizationUserSettingsTable.role,
    })
    .from(UserTable)
    .innerJoin(
      OrganizationUserSettingsTable,
      eq(UserTable.id, OrganizationUserSettingsTable.userId)
    )
    .where(eq(OrganizationUserSettingsTable.organizationId, id))

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Manage your organization's public profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <p className="text-sm font-medium">Name</p>
            <p className="text-sm text-muted-foreground">{organization.name}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>People with access to this organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={member.imageUrl} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="text-sm font-medium capitalize text-muted-foreground">
                  {member.role}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/20 shadow-sm">
        <CardHeader className="bg-destructive/5">
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions for this organization. Please proceed with extreme caution.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold">Delete this organization</p>
              <p className="text-sm text-muted-foreground">
                Once deleted, all data including jobs and applications will be gone forever.
              </p>
            </div>
            <DeleteOrganizationButton 
                organizationId={organization.id} 
                organizationName={organization.name} 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
