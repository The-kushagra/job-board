import { db } from "@/drizzle/db"
import { OrganizationTable } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import { JobListingForm } from "@/components/forms/JobListingForm"

export default async function NewJobListingPage({
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Post a New Job</h1>
        <p className="text-muted-foreground">Creating a listing for {organization.name}</p>
      </div>
      <JobListingForm organizationId={id} />
    </div>
  )
}
