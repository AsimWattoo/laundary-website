# MonaSans and Wardrobe Edit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set MonaSans as the primary font and add an edit feature for wardrobe items.

**Architecture:** Use `next/font/local` for font loading and a new `EditClothDialog` with a corresponding server action for item updates.

**Tech Stack:** Next.js (TypeScript), Tailwind CSS v4, Vercel Blob, Drizzle ORM.

---

### Task 1: Font Configuration (MonaSans)

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Download MonaSans font files**
  
  *Note: Assuming font files should be placed in `public/fonts/`. Since I cannot download files from the web directly, I will assume the user has them or I will use a reliable remote URL if allowed, but standard practice is local.*
  
  *Action:* Create `public/fonts/` directory and check if font exists. If not, I'll advise the user to place `Mona-Sans.woff2` there. For this plan, I'll assume I'm configuring the code to look for it.

- [ ] **Step 2: Update `layout.tsx` to load MonaSans**

```tsx
// src/app/layout.tsx
import localFont from 'next/font/local';

const monaSans = localFont({
  src: '../../public/fonts/Mona-Sans.woff2',
  display: 'swap',
  variable: '--font-mona-sans',
});

// Update RootLayout body class
// <body className={`${monaSans.variable} font-sans min-h-screen ...`}>
```

- [ ] **Step 3: Update `globals.css` to use the font variable**

```css
/* src/app/globals.css */
:root {
  /* ... existing variables ... */
  --font-sans: var(--font-mona-sans), ui-sans-serif, system-ui, sans-serif;
}
```

- [ ] **Step 4: Verify font change**
  
  Run: `npm run dev` and inspect the computed styles in the browser to ensure `MonaSans` is applied to the body.

---

### Task 2: Server Action for Updating Clothes

**Files:**
- Modify: `src/lib/actions.ts`

- [ ] **Step 1: Implement `updateCloth` action**

```typescript
export async function updateCloth(id: string, formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const type = formData.get('type') as any;
    const file = formData.get('image') as File | null;

    let imageUrl: string | undefined;

    if (file && file.size > 0) {
      const blob = await put(file.name, file, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN
      });
      imageUrl = blob.url;
    }

    await db.update(clothes)
      .set({
        name,
        type,
        ...(imageUrl && { imageUrl }),
      })
      .where(eq(clothes.id, id));

    revalidatePath('/wardrobe');
    revalidatePath('/sessions/new');
  } catch (error) {
    console.error('Error in updateCloth:', error);
    throw error;
  }
}
```

- [ ] **Step 2: Commit changes**

```bash
git add src/lib/actions.ts
git commit -m "feat: add updateCloth server action"
```

---

### Task 3: Create EditClothDialog Component

**Files:**
- Create: `src/components/EditClothDialog.tsx`

- [ ] **Step 1: Implement `EditClothDialog`**

```tsx
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

export function EditClothDialog({ cloth }: EditClothDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:text-white hover:bg-white/20">
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit {cloth.name}</span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
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
              <Label htmlFor="edit-name" className="text-right">Name</Label>
              <Input
                id="edit-name"
                name="name"
                defaultValue={cloth.name}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-type" className="text-right">Type</Label>
              <select
                id="edit-type"
                name="type"
                defaultValue={cloth.type}
                className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                required
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-image" className="text-right">New Image</Label>
              <Input
                id="edit-image"
                name="image"
                type="file"
                accept="image/*"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</>
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/EditClothDialog.tsx
git commit -m "feat: add EditClothDialog component"
```

---

### Task 4: Integrate Edit Button in Wardrobe View

**Files:**
- Modify: `src/components/WardrobeClient.tsx`

- [ ] **Step 1: Import `EditClothDialog` and add to item card**

```tsx
// src/components/WardrobeClient.tsx
import { EditClothDialog } from '@/components/EditClothDialog'

// Inside the map function:
<div className="absolute top-2 right-2 flex gap-1">
  <EditClothDialog cloth={cloth} />
  <DeleteClothButton clothId={cloth.id} clothName={cloth.name} />
</div>
```

- [ ] **Step 2: Adjust `DeleteClothButton` positioning if needed**
  (The existing `DeleteClothButton` might be absolute positioned at `top-2 right-2`. I'll wrap them in a container).

- [ ] **Step 3: Final Verification**
  Run `npm run build` to ensure no type errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/WardrobeClient.tsx
git commit -m "feat: integrate edit action into wardrobe cards"
```
