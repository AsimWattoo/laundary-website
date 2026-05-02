# Wardrobe View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Wardrobe View to allow users to view their clothes and add new ones.

**Architecture:** Use Next.js Server Components for fetching clothes and Client Components for the Add Cloth dialog. Leverage shadcn/ui for accessible UI components.

**Tech Stack:** Next.js (App Router), Drizzle ORM, shadcn/ui, Radix UI, Tailwind CSS.

---

### Task 1: Add shadcn UI Components

**Files:**
- Modify: `package.json` (via command)
- Create: `src/components/ui/dialog.tsx`, `src/components/ui/input.tsx`, `src/components/ui/label.tsx`

- [ ] **Step 1: Install shadcn components**

Run: `npx shadcn@latest add dialog input label`

- [ ] **Step 2: Verify installation**

Check if `src/components/ui/dialog.tsx`, `src/components/ui/input.tsx`, and `src/components/ui/label.tsx` exist.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/
git commit -m "chore: add dialog, input, and label shadcn components"
```

### Task 2: Implement AddClothDialog Component

**Files:**
- Create: `src/components/AddClothDialog.tsx`

- [ ] **Step 1: Create the AddClothDialog component**

```tsx
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

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Uploading...
        </>
      ) : (
        'Add to Wardrobe'
      )}
    </Button>
  )
}

export function AddClothDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Cloth
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
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
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Blue T-Shirt"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AddClothDialog.tsx
git commit -m "feat: implement AddClothDialog component"
```

### Task 3: Implement Wardrobe Page

**Files:**
- Create: `src/app/wardrobe/page.tsx`

- [ ] **Step 1: Create the Wardrobe page**

```tsx
import { db } from '@/db'
import { clothes } from '@/db/schema'
import { desc } from 'drizzle-orm'
import { AddClothDialog } from '@/components/AddClothDialog'

export default async function WardrobePage() {
  const allClothes = await db.query.clothes.findMany({
    orderBy: [desc(clothes.createdAt)],
  })

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Wardrobe</h1>
        <AddClothDialog />
      </div>

      {allClothes.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 rounded-lg border-2 border-dashed">
          <p className="text-muted-foreground">Your wardrobe is empty. Add your first piece of clothing!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {allClothes.map((cloth) => (
            <div key={cloth.id} className="group relative bg-card rounded-lg border shadow-sm overflow-hidden transition-all hover:shadow-md">
              <div className="aspect-square relative overflow-hidden bg-muted">
                <img
                  src={cloth.imageUrl}
                  alt={cloth.name}
                  className="object-cover w-full h-full transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-3">
                <h3 className="font-medium truncate">{cloth.name}</h3>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/wardrobe/page.tsx
git commit -m "feat: implement Wardrobe page"
```
