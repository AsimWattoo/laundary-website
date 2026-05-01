'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
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

/**
 * Submit button component that handles loading state using useFormStatus.
 * Provides visual feedback during upload.
 */
function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          Uploading...
        </>
      ) : (
        'Add to Wardrobe'
      )}
    </Button>
  )
}

/**
 * AddClothDialog component allows users to add a new piece of clothing.
 * Uses shadcn/ui Dialog which is built on Radix UI for full accessibility.
 */
export function AddClothDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" aria-hidden="true" />
          Add Cloth
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {/* Semantic form for adding clothing */}
        <form
          action={async (formData) => {
            await createCloth(formData)
            setOpen(false)
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
              />
            </div>
          </div>
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
