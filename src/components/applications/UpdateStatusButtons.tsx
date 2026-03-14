"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { updateApplicationStatus } from "@/server/actions/applications"
import { toast } from "sonner"
import { CheckCircle2, X } from "lucide-react"
import { useRouter } from "next/navigation"

export function UpdateStatusButtons({ 
  applicationId, 
  currentStatus 
}: { 
  applicationId: string, 
  currentStatus: string 
}) {
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  async function handleUpdate(newStatus: string) {
    if (newStatus === currentStatus) return

    setIsUpdating(true)
    try {
      const result = await updateApplicationStatus(applicationId, newStatus)
      if (result.success) {
        toast.success(`Status updated to ${newStatus}`)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to update status")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button 
        variant="outline" 
        className={`${
          currentStatus === "hired" 
            ? "bg-green-100 text-green-700 border-green-200" 
            : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
        }`}
        disabled={isUpdating || currentStatus === "hired"}
        onClick={() => handleUpdate("hired")}
      >
        <CheckCircle2 className="mr-2 size-4" />
        {currentStatus === "hired" ? "Hired" : "Hire Candidate"}
      </Button>
      <Button 
        variant="outline" 
        className={`${
          currentStatus === "rejected" 
            ? "bg-red-100 text-red-700 border-red-200" 
            : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
        }`}
        disabled={isUpdating || currentStatus === "rejected"}
        onClick={() => handleUpdate("rejected")}
      >
        <X className="mr-2 size-4" />
        {currentStatus === "rejected" ? "Rejected" : "Reject"}
      </Button>
    </div>
  )
}
