"use client"

import { Button } from "@/components/ui/button"
import { deleteOrganization } from "@/server/actions/organizations"
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
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog"
import { Loader2, Trash2 } from "lucide-react"

export function DeleteOrganizationButton({ organizationId, organizationName }: { organizationId: string, organizationName: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteOrganization(organizationId)
      if (result && "error" in result) {
        toast.error(result.error)
        setIsDeleting(false)
      }
    } catch (error) {
      toast.error("Failed to delete organization")
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="gap-2">
            <Trash2 className="size-4" />
            Delete Organization
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the <strong>{organizationName}</strong> organization and remove all associated data including job listings and applications.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
                e.preventDefault()
                handleDelete()
            }} 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? (
                <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Deleting...
                </>
            ) : (
                "Permanently Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
