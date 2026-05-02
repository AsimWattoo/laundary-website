# Clothing Groups Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dedicated Clothing Groups management section in the Wardrobe tab with collage-style previews and edit/delete capabilities.

**Architecture:** Update the Wardrobe server page to fetch groups with items, implement a new `updateClothingGroup` server action, and create a tabbed UI in `WardrobeClient` to toggle between items and groups.

**Tech Stack:** Next.js (TypeScript), Tailwind CSS v4, Drizzle ORM, Lucide React, Shadcn/ui Dialog.

---

### Task 1: Server Actions and Data Fetching

**Files:**
- Modify: `src/lib/actions.ts`
- Modify: `src/app/wardrobe/page.tsx`

- [ ] **Step 1: Implement `updateClothingGroup` server action**
  
```typescript
// src/lib/actions.ts

export async function updateClothingGroup(id: string, name: string, clothIds: string[]) {
  try {
    await db.transaction(async (tx) => {
      // 1. Update group name
      await tx.update(clothingGroups)
        .set({ name })
        .where(eq(clothingGroups.id, id));

      // 2. Delete existing items
      await tx.delete(clothingGroupItems)
        .where(eq(clothingGroupItems.groupId, id));

      // 3. Insert new items
      if (clothIds.length > 0) {
        await tx.insert(clothingGroupItems).values(
          clothIds.map(clothId => ({
            groupId: id,
            clothId,
          }))
        );
      }
    });

    revalidatePath('/wardrobe');
    revalidatePath('/sessions/new');
  } catch (error) {
    console.error('Error in updateClothingGroup:', error);
    throw error;
  }
}
```

- [ ] **Step 2: Update Wardrobe Page to fetch groups with items**

```typescript
// src/app/wardrobe/page.tsx

// Replace the fetch logic to include groups
const allGroups = await db.query.clothingGroups.findMany({
  with: {
    items: {
      with: {
        cloth: true
      }
    }
  },
  orderBy: [desc(clothingGroups.createdAt)]
});

// Map it to a cleaner format for the client
const groupsWithItems = allGroups.map(group => ({
  id: group.id,
  name: group.name,
  items: group.items.map(gi => gi.cloth)
}));

// Pass groupsWithItems to WardrobeClient
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/actions.ts src/app/wardrobe/page.tsx
git commit -m "feat: add updateClothingGroup action and fetch groups in wardrobe"
```

---

### Task 2: Group UI Components (Collage and Edit Dialog)

**Files:**
- Create: `src/components/GroupCollage.tsx`
- Create: `src/components/EditGroupDialog.tsx`

- [ ] **Step 1: Implement `GroupCollage` component**

```tsx
// src/components/GroupCollage.tsx
import { cn } from '@/lib/utils'

export function GroupCollage({ images }: { images: string[] }) {
  const displayImages = images.slice(0, 4)
  const count = displayImages.length

  return (
    <div className={cn(
      "grid gap-0.5 aspect-square bg-muted rounded-md overflow-hidden",
      count === 1 ? "grid-cols-1" : "grid-cols-2"
    )}>
      {displayImages.map((src, i) => (
        <img 
          key={i} 
          src={src} 
          alt="" 
          className={cn(
            "w-full h-full object-cover",
            count === 3 && i === 0 ? "row-span-2" : ""
          )} 
        />
      ))}
      {count === 0 && <div className="flex items-center justify-center h-full text-muted-foreground text-[10px]">No items</div>}
    </div>
  )
}
```

- [ ] **Step 2: Implement `EditGroupDialog` component**
  (Reusing the multi-select pattern from `AddGroupDialog`)

```tsx
// src/components/EditGroupDialog.tsx
// ... imports ...
export function EditGroupDialog({ group, allClothes }: EditGroupDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [name, setName] = useState(group.name)
  const [selectedIds, setSelectedIds] = useState<string[]>(group.items.map(i => i.id))

  const handleUpdate = async () => {
    setIsPending(true)
    try {
      await updateClothingGroup(group.id, name, selectedIds)
      setOpen(false)
      toast.success('Group updated successfully!')
    } catch (error) {
      toast.error('Failed to update group.')
    } finally {
      setIsPending(false)
    }
  }
  // ... JSX similar to AddGroupDialog ...
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/GroupCollage.tsx src/components/EditGroupDialog.tsx
git commit -m "feat: add GroupCollage and EditGroupDialog components"
```

---

### Task 3: WardrobeClient Integration

**Files:**
- Modify: `src/components/WardrobeClient.tsx`

- [ ] **Step 1: Add Tab state and UI switcher**
  
- [ ] **Step 2: Implement Groups Grid**
  
- [ ] **Step 3: Update `initialClothes` and `groups` props**

- [ ] **Step 4: Commit**

```bash
git add src/components/WardrobeClient.tsx
git commit -m "feat: integrate groups tab into WardrobeClient"
```

---

### Task 4: Final Polish and Verification

- [ ] **Step 1: Verify Create -> View -> Edit -> Delete flow for groups**
- [ ] **Step 2: Verify search works for both tabs**
- [ ] **Step 3: Run Build**

Run: `npm run build`
Expected: exit 0
