# Navy Blue Dashboard & Responsive Navbar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a responsive navy blue light-mode theme with a hamburger-menu navbar and Recharts-based dashboard visualizations.

**Architecture:**
- Refactor `Navbar` into a client component to handle mobile state.
- Update `globals.css` with a navy-focused palette.
- Create a `DashboardCharts` client component for data visualization.
- Use `recharts` for all graphs.

**Tech Stack:**
- Next.js 16 (App Router)
- Tailwind CSS v4
- Recharts
- Lucide React (Icons)

---

### Task 1: Dependencies & Theme Setup

**Files:**
- Modify: `package.json`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Install Recharts**
Run: `npm install recharts`

- [ ] **Step 2: Update globals.css with Navy Palette**
Replace the `:root` variables to reflect the Navy Blue Light Mode.

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.09 0.02 264); /* Slate 950 */
  --card: oklch(0.99 0 0);
  --card-foreground: oklch(0.09 0.02 264);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.09 0.02 264);
  --primary: oklch(0.12 0.03 264); /* Deep Navy (Slate 900) */
  --primary-foreground: oklch(0.98 0 0);
  --secondary: oklch(0.96 0.01 264);
  --secondary-foreground: oklch(0.12 0.03 264);
  --muted: oklch(0.96 0.01 264);
  --muted-foreground: oklch(0.45 0.03 264);
  --accent: oklch(0.96 0.01 264);
  --accent-foreground: oklch(0.12 0.03 264);
  --destructive: oklch(0.6 0.2 25);
  --border: oklch(0.92 0.01 264);
  --input: oklch(0.92 0.01 264);
  --ring: oklch(0.12 0.03 264);
  --chart-1: oklch(0.12 0.03 264); /* Navy */
  --chart-2: oklch(0.45 0.03 264); /* Slate */
}
```

- [ ] **Step 3: Commit**
```bash
git add package.json src/app/globals.css
git commit -m "feat: install recharts and update theme to navy blue light mode"
```

---

### Task 2: Responsive Navbar Component

**Files:**
- Create: `src/components/Navbar.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create Navbar Client Component**
Implement a responsive navbar with a hamburger menu for mobile using `lucide-react` icons.

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="border-b px-4 py-3 sticky top-0 bg-background/95 backdrop-blur z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-primary">
          Laundry Tracker
        </Link>
        
        {/* Desktop Links */}
        <div className="hidden md:flex gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-primary transition-colors">Dashboard</Link>
          <Link href="/wardrobe" className="hover:text-primary transition-colors">Wardrobe</Link>
          <Link href="/sessions/new" className="hover:text-primary transition-colors">New Session</Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-primary" 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b p-4 flex flex-col gap-4 shadow-lg animate-in fade-in slide-in-from-top-2">
          <Link href="/" onClick={() => setIsOpen(false)} className="text-lg font-medium">Dashboard</Link>
          <Link href="/wardrobe" onClick={() => setIsOpen(false)} className="text-lg font-medium">Wardrobe</Link>
          <Link href="/sessions/new" onClick={() => setIsOpen(false)} className="text-lg font-medium">New Session</Link>
        </div>
      )}
    </nav>
  );
}
```

- [ ] **Step 2: Update Layout to use new Navbar**
Replace the hardcoded navbar in `src/app/layout.tsx` with the `<Navbar />` component.

- [ ] **Step 3: Commit**
```bash
git add src/components/Navbar.tsx src/app/layout.tsx
git commit -m "feat: implement responsive mobile navbar with hamburger menu"
```

---

### Task 3: Dashboard Graphs Components

**Files:**
- Create: `src/components/DashboardCharts.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create DashboardCharts Component**
Implement `AreaChart`, `PieChart`, and `BarChart` using Recharts. Pass chart data as props.

- [ ] **Step 2: Update Dashboard Page to Fetch & Pass Data**
Modify `src/app/page.tsx` to:
1. Aggregate data for the "Volume Trend" (sessions per day/week).
2. Calculate "Status Distribution" (returned vs pending).
3. Find "Most Laundered Items" (cloth frequency).
4. Render `<DashboardCharts data={...} />`.

- [ ] **Step 3: Update Dashboard Layout for Responsiveness**
Use a responsive grid:
- Mobile: 1 column stack.
- Desktop: 2 columns for larger charts.

- [ ] **Step 4: Commit**
```bash
git add src/components/DashboardCharts.tsx src/app/page.tsx
git commit -m "feat: add responsive Recharts dashboard visualizations"
```

---

### Task 4: Final Refinement & Accessibility

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/ui/card.tsx`

- [ ] **Step 1: Add ARIA labels to Charts**
Ensure each chart has an `aria-label` or description for screen readers.

- [ ] **Step 2: Polish Responsiveness**
Check spacing and font sizes on mobile vs desktop.

- [ ] **Step 3: Commit**
```bash
git commit -m "style: final dashboard polish and accessibility improvements"
```
