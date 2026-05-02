'use client'

import { useState, useTransition } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteCloth } from '@/lib/actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface DeleteClothButtonProps {
  clothId: string
  clothName: string
  className?: string
}

export function DeleteClothButton({ clothId, clothName, className }: DeleteClothButtonProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteCloth(clothId)
        toast.success(`${clothName} deleted successfully`)
        setOpen(false)
      } catch (error) {
        console.error('Failed to delete cloth:', error)
        toast.error('Failed to delete cloth. Please try again.')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-7 px-2 bg-white/90 text-red-600 hover:bg-white hover:text-red-700 shadow-sm border-none backdrop-blur-sm",
              className
            )}
            aria-label={`Delete ${clothName}`}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            <span className="text-[10px] font-bold">Delete</span>
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Clothing Item</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{clothName}</strong>? This will also remove it from all laundry history. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
