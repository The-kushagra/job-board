"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, UserCheck, User } from "lucide-react"
import { cn } from "@/lib/utils"

type RankedApplicant = {
  id: string
  name: string
  email: string
  imageUrl: string
  status: string
  score: number
  reason: string
  appliedAt: string
}

function getScoreClass(score: number) {
  if (score >= 80) return "bg-gradient-to-r from-purple-600 to-teal-500 text-white shadow-lg shadow-teal-500/20";
  if (score >= 60) return "bg-gradient-to-r from-purple-800 to-indigo-600 text-white opacity-90";
  return "bg-slate-800 text-slate-400";
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-2xl border border-white/5 bg-slate-800/50 p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="size-10 rounded-full bg-slate-700" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-1/3 bg-slate-700" />
              <Skeleton className="h-4 w-1/4 bg-slate-700" />
            </div>
            <Skeleton className="h-10 w-20 rounded-xl bg-slate-700" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function RankedApplicants({ jobId }: { jobId: string }) {
  const [applicants, setApplicants] = useState<RankedApplicant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRanked() {
      try {
        const res = await fetch(`/api/jobs/${jobId}/applicants/ranked`)
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || "Failed to load applicants.")
          return
        }

        setApplicants(data.applicants ?? [])
      } catch {
        setError("Something went wrong. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchRanked()
  }, [jobId])

  if (loading) return <LoadingSkeleton />

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center text-red-400 font-bold">
        {error}
      </div>
    )
  }

  if (applicants.length === 0) {
    return (
      <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-3xl bg-slate-800/20">
        <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <User className="size-10 text-primary opacity-40" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">No applicants yet</h3>
        <p className="text-slate-400 font-medium max-w-xs mx-auto">
          Applicants will appear here with AI-generated match scores once they submit their resumes.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {applicants.map((applicant, index) => (
        <div
          key={applicant.id}
          className="group relative rounded-2xl border border-white/5 bg-slate-800/40 p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-slate-800"
        >
          <div className="flex items-center gap-6">
            {/* Rank */}
            <div className="flex items-center justify-center size-10 rounded-xl bg-slate-900 border border-white/5 text-sm font-black text-slate-300 group-hover:bg-primary transition-all group-hover:text-white">
              #{index + 1}
            </div>

            {/* Avatar */}
            <div className="size-14 rounded-2xl bg-slate-700 overflow-hidden shrink-0 border-2 border-white/5 shadow-inner">
              {applicant.imageUrl ? (
                <img
                  src={applicant.imageUrl}
                  alt={applicant.name}
                  className="size-full object-cover"
                />
              ) : (
                <div className="size-full flex items-center justify-center">
                  <User className="size-7 text-slate-400" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h4 className="font-black text-lg text-white group-hover:text-primary transition-colors truncate">
                  {applicant.name}
                </h4>
                <Badge variant="secondary" className="shrink-0">
                  {applicant.status}
                </Badge>
              </div>
              <p className="text-sm font-bold text-cyan-400 uppercase tracking-widest truncate">
                {applicant.email}
              </p>
            </div>

            {/* AI Reason */}
            <div className="hidden md:flex items-center gap-3 max-w-[300px] border-x border-white/5 px-6">
              <Sparkles className="size-5 shrink-0 text-amber-500" />
              <p className="text-sm font-medium text-slate-400 line-clamp-2 italic leading-snug">
                "{applicant.reason}"
              </p>
            </div>

            {/* Score Badge */}
            <div className={cn(
              "shrink-0 px-4 py-2 rounded-xl font-black text-lg border border-white/10 transition-transform group-hover:scale-110",
              getScoreClass(applicant.score)
            )}>
              {applicant.score}%
            </div>

            {/* Shortlist Button */}
            <Button variant="outline" size="sm" className="hidden lg:flex gap-2 font-black h-11 px-6 rounded-xl">
              <UserCheck className="size-4" />
              Shortlist
            </Button>
          </div>

          {/* Mobile-only AI reason */}
          <div className="md:hidden mt-6 pt-6 border-t border-white/5 flex items-start gap-3">
             <Sparkles className="size-5 shrink-0 text-amber-500" />
             <p className="text-sm font-medium text-slate-400 italic leading-relaxed">
               "{applicant.reason}"
             </p>
          </div>
        </div>
      ))}
    </div>
  )
}
