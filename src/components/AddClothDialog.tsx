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
import { createCloth } from '@/lib/actions'
import { PlusCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

/**
 * AddClothDialog component allows users to add a new piece of clothing.
 * Uses shadcn/ui Dialog which is built on Radix UI for full accessibility.
 */
export function AddClothDialog() {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" aria-hidden="true" />
            Add Cloth
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        {/* Semantic form for adding clothing */}
        <form
          action={async (formData) => {
            setIsPending(true)
            try {
              await createCloth(formData)
              setOpen(false)
              toast.success('Cloth added to wardrobe!')
            } catch (error) {
              console.error('Failed to add cloth:', error)
              toast.error('Failed to add cloth. Please check your image and try again.')
            } finally {
              setIsPending(false)
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Add New Cloth</DialogTitle>
            <DialogDescription>
              Upload an image and give a name to your piece of clothing.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              {/* Programmatically associated label for the name input */}
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Blue T-Shirt"
                className="col-span-3"
                required
                aria-required="true"
                disabled={isPending}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              {/* Programmatically associated label for the image upload */}
              <Label htmlFor="image" className="text-right">
                Image
              </Label>
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                className="col-span-3"
                required
                aria-required="true"
                disabled={isPending}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <select
                id="type"
                name="type"
                className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Uploading...
                </>
              ) : (
                'Add to Wardrobe'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
