import { desc, eq, and } from "drizzle-orm"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, MoreHorizontal, Settings } from "lucide-react"
import { auth } from "@clerk/nextjs/server"
import { OrganizationUserSettingsTable } from "@/drizzle/schema"
import { db } from "@/drizzle/db"
import { OrganizationTable, JobListingTable } from "@/drizzle/schema"

export default async function OrganizationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { userId } = await auth()

  if (!userId) {
    notFound()
  }

  // Check if user is an admin of this organization
  const userSettings = await db.query.OrganizationUserSettingsTable.findFirst({
    where: and(
      eq(OrganizationUserSettingsTable.userId, userId),
      eq(OrganizationUserSettingsTable.organizationId, id),
      eq(OrganizationUserSettingsTable.role, "admin")
    )
  })

  // If not an admin, they shouldn't see this management dashboard
  if (!userSettings) {
    return redirect("/dashboard")
  }

  const organization = await db.query.OrganizationTable.findFirst({
    where: eq(OrganizationTable.id, id),
  })

  if (!organization) {
    notFound()
  }

  const jobs = await db
    .select()
    .from(JobListingTable)
    .where(eq(JobListingTable.organizationId, id))
    .orderBy(desc(JobListingTable.postedAt))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{organization.name} Dashboard</h1>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" asChild>
             <Link href={`/organizations/${id}/settings`}>
               <Settings className="mr-2 size-4" /> Settings
             </Link>
           </Button>
           <Button size="sm" asChild>
             <Link href={`/organizations/${id}/jobs/new`}>
               <Plus className="mr-2 size-4" /> Post a Job
             </Link>
           </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Active Jobs</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{jobs.length}</div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border shadow">
        <div className="p-6 flex flex-col gap-4">
          <h3 className="text-lg font-bold">Manage Job Listings</h3>
          <div className="divide-y">
             {jobs.map((job) => (
                <div key={job.id} className="py-4 flex items-center justify-between">
                   <div>
                      <p className="font-bold">{job.title}</p>
                      <p className="text-sm text-muted-foreground capitalize">{job.type} • {job.locationRequirement}</p>
                   </div>
                   <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                         <Link href={`/organizations/${id}/jobs/${job.id}/applicants`}>
                            View Applicants
                         </Link>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="size-4" />
                      </Button>
                   </div>
                </div>
             ))}
             {jobs.length === 0 && (
                <div className="py-10 text-center text-muted-foreground italic">
                   No jobs posted yet.
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  )
}
