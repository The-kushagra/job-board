import { db } from "@/drizzle/db"
import { JobListingApplicationTable, JobListingTable, OrganizationTable } from "@/drizzle/schema"
import { auth } from "@clerk/nextjs/server"
import { eq, desc } from "drizzle-orm"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Building2, Calendar, FileText } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export default async function MyApplicationsPage() {
  const { userId } = await auth()

  if (!userId) {
    return <div>Unauthorized</div>
  }

  const applications = await db
    .select({
      id: JobListingApplicationTable.id,
      status: JobListingApplicationTable.status,
      aiScore: JobListingApplicationTable.aiScore,
      aiFeedback: JobListingApplicationTable.aiFeedback,
      createdAt: JobListingApplicationTable.createdAt,
      job: JobListingTable,
      organization: OrganizationTable,
    })
    .from(JobListingApplicationTable)
    .innerJoin(JobListingTable, eq(JobListingApplicationTable.jobListingId, JobListingTable.id))
    .innerJoin(OrganizationTable, eq(JobListingTable.organizationId, OrganizationTable.id))
    .where(eq(JobListingApplicationTable.userId, userId))
    .orderBy(desc(JobListingApplicationTable.createdAt))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
        <p className="text-muted-foreground">Track your job applications and see how your resume matched with each role.</p>
      </div>

      <div className="grid gap-6">
        {applications.map((app) => (
          <Card key={app.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl">
                  <Link href={`/jobs/${app.job.id}`} className="hover:underline">
                    {app.job.title}
                  </Link>
                </CardTitle>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="size-4" />
                  <span>{app.organization.name}</span>
                </div>
              </div>
              <Badge className="capitalize">{app.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="size-4" />
                  Applied {formatDistanceToNow(new Date(app.createdAt || Date.now()), { addSuffix: true })}
                </div>
                <div className="flex items-center gap-1">
                   <FileText className="size-4" />
                   Resume Analysis Included
                </div>
              </div>

              <div className="rounded-lg border bg-zinc-50 dark:bg-zinc-950 p-4 space-y-3">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-primary">
                       <Sparkles className="size-4" />
                       AI Match Analysis
                    </div>
                    <div className="text-lg font-black text-primary">
                       {app.aiScore}%
                    </div>
                 </div>
                 <p className="text-sm border-t pt-3 leading-relaxed">
                    {app.aiFeedback || "AI analysis is pending or unavailable."}
                 </p>
              </div>
            </CardContent>
          </Card>
        ))}

        {applications.length === 0 && (
          <div className="py-20 text-center border rounded-xl border-dashed bg-muted/20">
             <Sparkles className="size-12 text-muted-foreground mx-auto mb-4 opacity-20" />
             <h3 className="text-xl font-medium">No applications found</h3>
             <p className="text-muted-foreground mb-6">You haven't applied to any jobs yet. Start discovery today.</p>
             <Button asChild>
                <Link href="/jobs">Browse Jobs</Link>
             </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function Button({ children, className, asChild }: any) {
    const Comp = asChild ? "span" : "button"
    return (
        <Comp className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 ${className}`}>
            {children}
        </Comp>
    )
}
