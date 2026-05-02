# Session Tracking (Detail View) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the session detail view where users can track which items have been returned from the laundry.

**Architecture:** Use a Next.js Server Component for fetching data and a Client Component for the interactive checklist. Implement a Server Action for toggling the return status of items.

**Tech Stack:** Next.js (App Router), Drizzle ORM, Tailwind CSS, Shadcn UI (Checkboxes/Cards).

---

### Task 1: Implement `toggleItemReturn` Action

**Files:**
- Modify: `src/lib/actions.ts`

- [ ] **Step 1: Add `toggleItemReturn` function to `src/lib/actions.ts`**

```typescript
export async function toggleItemReturn(itemId: string, isReturned: boolean) {
  const [item] = await db
    .update(laundryItems)
    .set({ isReturned })
    .where(eq(laundryItems.id, itemId))
    .returning({ sessionId: laundryItems.sessionId });

  if (!item) throw new Error('Item not found');

  // Check if all items are returned to update session status
  const allItems = await db
    .select()
    .from(laundryItems)
    .where(eq(laundryItems.sessionId, item.sessionId));

  const allReturned = allItems.every((i) => i.isReturned);

  await db
    .update(laundrySessions)
    .set({ status: allReturned ? 'completed' : 'active' })
    .where(eq(laundrySessions.id, item.sessionId));

  revalidatePath(`/sessions/${item.sessionId}`);
  revalidatePath('/'); // Dashboard also shows sessions
}
```

- [ ] **Step 2: Ensure `eq` is imported from `drizzle-orm`**

### Task 2: Create Session Detail Page

**Files:**
- Create: `src/app/sessions/[id]/page.tsx`

- [ ] **Step 1: Fetch session data with joined items and cloth details**

```typescript
import { db } from '@/db';
import { laundrySessions, laundryItems, clothes } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import ItemChecklist from './ItemChecklist';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default async function SessionDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  const session = await db.query.laundrySessions.findFirst({
    where: eq(laundrySessions.id, id),
  });

  if (!session) notFound();

  const items = await db
    .select({
      id: laundryItems.id,
      isReturned: laundryItems.isReturned,
      cloth: {
        name: clothes.name,
        imageUrl: clothes.imageUrl,
      },
    })
    .from(laundryItems)
    .innerJoin(clothes, eq(laundryItems.clothId, clothes.id))
    .where(eq(laundryItems.sessionId, id));

  const returnedCount = items.filter((i) => i.isReturned).length;
  const totalCount = items.length;
  const progress = Math.round((returnedCount / totalCount) * 100);

  return (
    <div className="container max-w-2xl py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Session: {format(session.startDate, 'PPP')}
        </h1>
        <div className="flex items-center gap-4">
          <span className={`px-2 py-1 rounded text-sm font-medium ${
            session.status === 'completed' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-blue-100 text-blue-700'
          }`}>
            {session.status === 'active' ? 'In Progress' : 'Completed'}
          </span>
          <span className="text-muted-foreground text-sm">
            {returnedCount} of {totalCount} items returned ({progress}%)
          </span>
        </div>
        
        <div className="mt-4 w-full bg-secondary rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <ItemChecklist items={items} />
    </div>
  );
}
```

### Task 3: Create Item Checklist Component

**Files:**
- Create: `src/app/sessions/[id]/ItemChecklist.tsx`

- [ ] **Step 1: Implement Client Component with optimistic updates**

```typescript
'use client';

import { useOptimistic, useTransition } from 'react';
import { toggleItemReturn } from '@/lib/actions';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface Item {
  id: string;
  isReturned: boolean;
  cloth: {
    name: string;
    imageUrl: string;
  };
}

export default function ItemChecklist({ items }: { items: Item[] }) {
  const [optimisticItems, addOptimisticItem] = useOptimistic(
    items,
    (state, { id, isReturned }: { id: string; isReturned: boolean }) =>
      state.map((item) => (item.id === id ? { ...item, isReturned } : item))
  );
  const [isPending, startTransition] = useTransition();

  const handleToggle = async (id: string, isReturned: boolean) => {
    startTransition(async () => {
      addOptimisticItem({ id, isReturned });
      await toggleItemReturn(id, isReturned);
    });
  };

  return (
    <div className="space-y-4">
      {optimisticItems.map((item) => (
        <div 
          key={item.id} 
          className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
        >
          <Checkbox
            id={item.id}
            checked={item.isReturned}
            onCheckedChange={(checked) => handleToggle(item.id, checked === true)}
            aria-label={`Mark ${item.cloth.name} as ${item.isReturned ? 'not returned' : 'returned'}`}
          />
          <div className="h-12 w-12 rounded overflow-hidden flex-shrink-0">
            <img 
              src={item.cloth.imageUrl} 
              alt={item.cloth.name} 
              className="h-full w-full object-cover"
            />
          </div>
          <Label 
            htmlFor={item.id} 
            className={`flex-grow cursor-pointer font-medium ${item.isReturned ? 'line-through text-muted-foreground' : ''}`}
          >
            {item.cloth.name}
          </Label>
        </div>
      ))}
    </div>
  );
}
```

### Task 4: Final Verification and Commit

- [ ] **Step 1: Verify all imports and types**
- [ ] **Step 2: Commit changes**

```bash
git add src/lib/actions.ts src/app/sessions/[id]/page.tsx src/app/sessions/[id]/ItemChecklist.tsx
git commit -m "feat: implement session tracking detail view with item return toggling"
```
