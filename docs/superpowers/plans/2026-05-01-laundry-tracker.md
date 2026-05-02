# Laundry Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a minimal Next.js laundry tracker with a digital wardrobe and session tracking.

**Architecture:** Hybrid "Wardrobe" approach where clothes are saved permanently and linked to laundry sessions. Uses React Server Components for data fetching and Server Actions for mutations.

**Tech Stack:** Next.js 14 (App Router), Tailwind CSS, shadcn/ui, Supabase (Postgres), Drizzle ORM, Vercel Blob.

---

### Task 1: Project Initialization

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `postcss.config.mjs`, `tailwind.config.ts`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

- [ ] **Step 1: Scaffold Next.js project**

Run: `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`

- [ ] **Step 2: Install core dependencies**

Run: `npm install drizzle-orm @supabase/supabase-js @vercel/blob lucide-react clsx tailwind-merge`
Run: `npm install -D drizzle-kit pg @types/pg`

- [ ] **Step 3: Setup basic layout and global CSS**

```tsx
// src/app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-background text-foreground`}>
        <nav className="border-b px-4 py-3">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">Laundry Tracker</h1>
          </div>
        </nav>
        <main className="container mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore: initial next.js setup with tailwind and deps"
```

---

### Task 2: Database Setup (Drizzle & Supabase)

**Files:**
- Create: `.env.local`
- Create: `src/db/schema.ts`
- Create: `src/db/index.ts`
- Create: `drizzle.config.ts`

- [ ] **Step 1: Configure Drizzle schema**

```typescript
// src/db/schema.ts
import { pgTable, uuid, text, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';

export const sessionStatusEnum = pgEnum('session_status', ['active', 'completed']);

export const clothes = pgTable('clothes', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  imageUrl: text('image_url').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const laundrySessions = pgTable('laundry_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  startDate: timestamp('start_date').defaultNow().notNull(),
  expectedReturnDate: timestamp('expected_return_date'),
  status: sessionStatusEnum('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const laundryItems = pgTable('laundry_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => laundrySessions.id).notNull(),
  clothId: uuid('cloth_id').references(() => clothes.id).notNull(),
  isReturned: boolean('is_returned').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

- [ ] **Step 2: Setup Drizzle client**

```typescript
// src/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client, { schema });
```

- [ ] **Step 3: Run migration (simulated or manual setup request)**

Note: User needs to provide `DATABASE_URL`. I'll assume they will.

- [ ] **Step 4: Commit**

```bash
git add src/db/ drizzle.config.ts
git commit -m "feat: setup database schema and drizzle client"
```

---

### Task 3: Vercel Blob & Server Actions

**Files:**
- Create: `src/lib/actions.ts`

- [ ] **Step 1: Implement upload and save cloth action**

```typescript
// src/lib/actions.ts
'use server'

import { put } from '@vercel/blob';
import { db } from '@/db';
import { clothes } from '@/db/schema';
import { revalidatePath } from 'next/cache';

export async function createCloth(formData: FormData) {
  const file = formData.get('image') as File;
  const name = formData.get('name') as string;

  const blob = await put(file.name, file, { access: 'public' });

  await db.insert(clothes).values({
    name,
    imageUrl: blob.url,
  });

  revalidatePath('/wardrobe');
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/actions.ts
git commit -m "feat: add server action for creating clothes with image upload"
```

---

### Task 4: Wardrobe View (Inventory)

**Files:**
- Create: `src/app/wardrobe/page.tsx`
- Create: `src/components/AddClothDialog.tsx`

- [ ] **Step 1: Create Wardrobe page**

Fetch clothes from DB and display in a grid.

- [ ] **Step 2: Implement AddClothDialog with shadcn/ui**

- [ ] **Step 3: Commit**

```bash
git add src/app/wardrobe/page.tsx src/components/AddClothDialog.tsx
git commit -m "feat: implementation of wardrobe view and add cloth dialog"
```

---

### Task 5: Laundry Session Creation

**Files:**
- Create: `src/app/sessions/new/page.tsx`
- Modify: `src/lib/actions.ts`

- [ ] **Step 1: Implement session creation action**

Action should take a list of cloth IDs and create a `laundry_sessions` record + `laundry_items` links.

- [ ] **Step 2: Create "New Session" page**

Allow selecting from wardrobe and "Quick Add" (reusing `AddClothDialog` logic).

- [ ] **Step 3: Commit**

```bash
git add src/app/sessions/new/page.tsx src/lib/actions.ts
git commit -m "feat: implementation of laundry session creation"
```

---

### Task 6: Session Tracking (Detail View)

**Files:**
- Create: `src/app/sessions/[id]/page.tsx`
- Modify: `src/lib/actions.ts`

- [ ] **Step 1: Implement toggle return action**

Update `is_returned` in `laundry_items`.

- [ ] **Step 2: Create Session Detail page**

List items with checkboxes to mark as returned. Show progress bar.

- [ ] **Step 3: Commit**

```bash
git add src/app/sessions/[id]/page.tsx
git commit -m "feat: implementation of session tracking and item returns"
```

---

### Task 7: Dashboard & Final Touches

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Implement Dashboard UI**

Summary statistics and active session links.

- [ ] **Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: finalize dashboard and navigation"
```
