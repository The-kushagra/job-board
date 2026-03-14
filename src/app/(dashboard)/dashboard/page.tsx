import { db } from "@/drizzle/db"
import { JobListingTable, JobListingApplicationTable } from "@/drizzle/schema"
import { auth } from "@clerk/nextjs/server"
import { eq, count } from "drizzle-orm"
import { 
  BriefcaseBusiness, 
  FileText, 
  Users, 
  Sparkles 
} from "lucide-react"

export default async function DashboardPage() {
  const { userId } = await auth()

  const [totalJobs] = await db.select({ count: count() }).from(JobListingTable)
  const [userApplications] = userId 
    ? await db.select({ count: count() })
        .from(JobListingApplicationTable)
        .where(eq(JobListingApplicationTable.userId, userId))
    : [{ count: 0 }]

  const stats = [
    {
      title: "Marketplace Jobs",
      value: totalJobs.count.toString(),
      icon: BriefcaseBusiness,
      description: "Available opportunities",
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "My Applications",
      value: userApplications.count.toString(),
      icon: FileText,
      description: "Submitted resumes",
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      title: "Hiring Success",
      value: "84%",
      icon: Sparkles,
      description: "AI Match accuracy",
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      title: "Global Talent",
      value: "12k+",
      icon: Users,
      description: "Registered users",
      color: "text-green-600",
      bg: "bg-green-50"
    }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
        <p className="text-muted-foreground">Welcome to your NextHire dashboard. Here's what's happening today.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.title} className="rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="size-5" />
              </div>
            </div>
            <div className="space-y-1">
               <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
               <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
               <p className="text-xs text-muted-foreground pt-1">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
         <div className="rounded-2xl border bg-card p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
               <BriefcaseBusiness className="size-8 text-primary" />
            </div>
            <div className="max-w-[280px]">
               <h3 className="text-xl font-bold">Find your next role</h3>
               <p className="text-sm text-muted-foreground mt-2">Browse through hundreds of AI-focused positions tailored for your skills.</p>
            </div>
            <a href="/jobs" className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
               Browse Jobs
            </a>
         </div>

         <div className="rounded-2xl border bg-card p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="size-16 rounded-full bg-amber-50 flex items-center justify-center">
               <Sparkles className="size-8 text-amber-600" />
            </div>
            <div className="max-w-[280px]">
               <h3 className="text-xl font-bold">AI Resume Analysis</h3>
               <p className="text-sm text-muted-foreground mt-2">Our advanced AI helps you understand how well you match with different job descriptions.</p>
            </div>
            <a href="/applications" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-8 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
               View My Apps
            </a>
         </div>
      </div>
    </div>
  );
}
