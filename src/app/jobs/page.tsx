import { db } from "@/drizzle/db"
import { JobListingTable, OrganizationTable } from "@/drizzle/schema"
import { desc, eq } from "drizzle-orm"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Clock 
} from "lucide-react"
import { JobFilters } from "@/components/jobs/JobFilters"
import { and, or, ilike } from "drizzle-orm"

export const dynamic = "force-dynamic"

export default async function PublicJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; type?: string; location?: string }>
}) {
  const { search, type, location } = await searchParams

  const whereClause = [eq(JobListingTable.status, "published")]

  if (search) {
    whereClause.push(
      or(
        ilike(JobListingTable.title, `%${search}%`),
        ilike(OrganizationTable.name, `%${search}%`)
      )
    )
  }

  if (type && type !== "all") {
    whereClause.push(eq(JobListingTable.type, type as any))
  }

  if (location && location !== "all") {
    whereClause.push(eq(JobListingTable.locationRequirement, location as any))
  }

  const jobs = await db
    .select({
      id: JobListingTable.id,
      title: JobListingTable.title,
      type: JobListingTable.type,
      locationRequirement: JobListingTable.locationRequirement,
      wage: JobListingTable.wage,
      wageInterval: JobListingTable.wageInterval,
      organizationName: OrganizationTable.name,
      organizationImageUrl: OrganizationTable.imageUrl,
      postedAt: JobListingTable.postedAt,
    })
    .from(JobListingTable)
    .innerJoin(OrganizationTable, eq(JobListingTable.organizationId, OrganizationTable.id))
    .where(and(...(whereClause.filter(Boolean) as any[])))
    .orderBy(desc(JobListingTable.postedAt))

  return (
    <div className="container mx-auto py-10 space-y-8 px-4">
      <div className="flex flex-col gap-4 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Discover Your Next Opportunity
        </h1>
        <p className="text-xl text-muted-foreground max-w-[700px] mx-auto text-balance">
          Browse the latest roles in AI and technology from top companies.
        </p>
      </div>

      <JobFilters />

      <div className="grid gap-6">
        {jobs.map((job) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex gap-4">
                  <div className="size-12 rounded-lg border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                    {job.organizationImageUrl ? (
                       <img src={job.organizationImageUrl} alt={job.organizationName} className="object-cover" />
                    ) : (
                       <Briefcase className="size-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-xl">{job.title}</h3>
                    <p className="text-muted-foreground font-medium">{job.organizationName}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground pt-2">
                       <span className="flex items-center gap-1">
                         <MapPin className="size-4" />
                         {job.locationRequirement}
                       </span>
                       <span className="flex items-center gap-1">
                         <Clock className="size-4" />
                         {job.type}
                       </span>
                       {job.wage && (
                         <span className="flex items-center gap-1">
                           <DollarSign className="size-4" />
                           {job.wage.toLocaleString()} / {job.wageInterval}
                         </span>
                       )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center md:justify-end">
                   <Button asChild>
                     <Link href={`/jobs/${job.id}`}>View Details</Link>
                   </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {jobs.length === 0 && (
          <div className="text-center py-20 border rounded-xl bg-muted/20">
             <p className="text-muted-foreground italic">No jobs posted yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  )
}
