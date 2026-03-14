"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Search, X } from "lucide-react"
import { useTransition } from "react"
import { Button } from "@/components/ui/button"

export function JobFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentSearch = searchParams.get("search") || ""
  const currentType = searchParams.get("type") || "all"
  const currentLocation = searchParams.get("location") || "all"

  function updateFilters(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value === "all" || value === "") {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  function clearFilters() {
    startTransition(() => {
      router.push(pathname)
    })
  }

  const hasFilters = searchParams.size > 0

  return (
    <div className={`flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-xl border shadow-sm transition-opacity ${isPending ? "opacity-70" : "opacity-100"}`}>
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input 
          placeholder="Search jobs or companies..." 
          className="pl-9"
          defaultValue={currentSearch}
          onChange={(e) => updateFilters({ search: e.target.value })}
        />
      </div>

      <div className="flex gap-2 w-full md:w-auto">
        <Select value={currentType} onValueChange={(val) => updateFilters({ type: val })}>
          <SelectTrigger className="w-full md:w-[160px]">
            <SelectValue placeholder="Job Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="full-time">Full-time</SelectItem>
            <SelectItem value="part-time">Part-time</SelectItem>
            <SelectItem value="internship">Internship</SelectItem>
          </SelectContent>
        </Select>

        <Select value={currentLocation} onValueChange={(val) => updateFilters({ location: val })}>
          <SelectTrigger className="w-full md:w-[160px]">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Location</SelectItem>
            <SelectItem value="remote">Remote</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
            <SelectItem value="in-office">In-office</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="icon" onClick={clearFilters} title="Clear Filters">
            <X className="size-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
