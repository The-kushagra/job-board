import { db } from "@/drizzle/db"
import { JobListingApplicationTable, JobListingTable, UserTable } from "@/drizzle/schema"
import { eq, and } from "drizzle-orm"
import { notFound } from "next/navigation"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sparkles, ArrowRight, User } from "lucide-react"
import Link from "next/link"

export default async function JobApplicantsPage({
  params,
}: {
  params: Promise<{ id: string; jobId: string }>
}) {
  const { id, jobId } = await params

  const job = await db.query.JobListingTable.findFirst({
    where: and(eq(JobListingTable.id, jobId), eq(JobListingTable.organizationId, id)),
  })

  if (!job) {
    notFound()
  }

  const applications = await db
    .select({
      id: JobListingApplicationTable.id,
      status: JobListingApplicationTable.status,
      aiScore: JobListingApplicationTable.aiScore,
      aiFeedback: JobListingApplicationTable.aiFeedback,
      createdAt: JobListingApplicationTable.createdAt,
      user: UserTable,
    })
    .from(JobListingApplicationTable)
    .innerJoin(UserTable, eq(JobListingApplicationTable.userId, UserTable.id))
    .where(eq(JobListingApplicationTable.jobListingId, jobId))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Applicants for {job.title}</h1>
        <p className="text-muted-foreground">Review candidates and their AI-generated match scores.</p>
      </div>

      <div className="grid gap-4">
        {applications.map((app) => (
          <Card key={app.id} className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-4">
                <Avatar className="size-12 border">
                  <AvatarImage src={app.user.imageUrl || ""} alt={app.user.name} />
                  <AvatarFallback><User /></AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{app.user.name}</CardTitle>
                  <CardDescription>{app.user.email}</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                       <Sparkles className="size-4 text-primary" />
                       <span className="text-lg font-bold">AI Match: {app.aiScore}%</span>
                    </div>
                    <Badge variant={parseInt(app.aiScore || "0") > 70 ? "default" : "secondary"}>
                       {parseInt(app.aiScore || "0") > 70 ? "High Match" : "Reviewed"}
                    </Badge>
                 </div>
                 <Button variant="ghost" size="icon" asChild>
                    <Link href={`/organizations/${id}/jobs/${jobId}/applicants/${app.id}`}>
                       <ArrowRight className="size-5" />
                    </Link>
                 </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2 italic">
                "{app.aiFeedback}"
              </p>
            </CardContent>
          </Card>
        ))}

        {applications.length === 0 && (
          <div className="py-20 text-center border rounded-xl border-dashed bg-muted/20">
             <User className="size-12 text-muted-foreground mx-auto mb-4 opacity-20" />
             <h3 className="text-xl font-medium">No applications yet</h3>
             <p className="text-muted-foreground">Applicants will appear here once they apply to your job posting.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function Button({ children, className, variant, size, asChild }: any) {
    const Comp = asChild ? "span" : "button"
    return (
        <Comp className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variant === 'ghost' ? 'hover:bg-accent hover:text-accent-foreground' : ''} ${size === 'icon' ? 'size-10' : 'px-4 py-2'} ${className}`}>
            {children}
        </Comp>
    )
}
