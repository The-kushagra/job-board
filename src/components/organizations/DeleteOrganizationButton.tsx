"use client"

import { Button } from "@/components/ui/button"
import { deleteOrganization } from "@/server/actions/organizations"
import { Trash2, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function DeleteOrganizationButton({ organizationId }: { organizationId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    try {
      const result = await deleteOrganization(organizationId)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Organization deleted successfully")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="gap-2 font-black shadow-lg shadow-destructive/20">
          <Trash2 className="size-4" />
          Delete Organization
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-slate-900 border-white/10">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white font-black text-2xl">Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400 font-medium">
            This action cannot be undone. This will permanently delete your organization,
            including all active job listings and applicant data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 border-t border-white/5 pt-6">
          <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 font-bold">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
               e.preventDefault()
               handleDelete()
            }}
            className="bg-destructive hover:bg-destructive/90 text-white font-black"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Confirm Permanent Deletion"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
