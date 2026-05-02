'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateCloth } from '@/lib/actions'
import { Pencil, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface EditClothDialogProps {
  cloth: {
    id: string
    name: string
    type: string
    imageUrl: string
  }
}

/**
 * EditClothDialog component allows users to edit an existing piece of clothing.
 * Pre-fills the form with current data and handles updates via updateCloth action.
 */
export function EditClothDialog({ cloth }: EditClothDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
            aria-label={`Edit ${cloth.name}`}
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        {/* Semantic form for editing clothing */}
        <form
          action={async (formData) => {
            setIsPending(true)
            try {
              await updateCloth(cloth.id, formData)
              setOpen(false)
              toast.success('Cloth updated successfully!')
            } catch (error) {
              console.error('Failed to update cloth:', error)
              toast.error('Failed to update cloth. Please try again.')
            } finally {
              setIsPending(false)
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Edit Cloth</DialogTitle>
            <DialogDescription>
              Update the name, type, or image of your item.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              {/* Programmatically associated label for the name input */}
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                name="name"
                defaultValue={cloth.name}
                className="col-span-3"
                required
                aria-required="true"
                disabled={isPending}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              {/* Programmatically associated label for the type select */}
              <Label htmlFor="edit-type" className="text-right">
                Type
              </Label>
              <select
                id="edit-type"
                name="type"
                defaultValue={cloth.type}
                className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                required
                disabled={isPending}
              >
                <option value="shalwar">Shalwar</option>
                <option value="qameez">Qameez</option>
                <option value="tshirt">T-Shirt</option>
                <option value="pant">Pant</option>
                <option value="underwear">Underwear</option>
                <option value="trouser">Trouser</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">
                Current
              </Label>
              <div className="col-span-3">
                <div className="aspect-square w-24 h-24 rounded-md overflow-hidden border bg-muted mb-2">
                  <img
                    src={cloth.imageUrl}
                    alt={`Current photo of ${cloth.name}`}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              {/* Programmatically associated label for the image upload */}
              <Label htmlFor="edit-image" className="text-right">
                New Image
              </Label>
              <Input
                id="edit-image"
                name="image"
                type="file"
                accept="image/*"
                className="col-span-3"
                disabled={isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
