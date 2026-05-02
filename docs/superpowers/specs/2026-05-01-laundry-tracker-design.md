# Design Spec: Laundry Tracker (Next.js, Supabase, Vercel Blob)

**Date:** 2026-05-01  
**Topic:** Laundry Tracker Website  
**Status:** Approved  

## 1. Overview
A minimal, web-based laundry tracking application designed for personal use. It allows users to maintain a digital wardrobe, group clothes into laundry sessions, and track the return status of individual items.

## 2. Technical Stack
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **ORM:** Drizzle ORM (for type-safe database interactions)
- **File Storage:** Vercel Blob (for cloth photos)
- **State Management:** React Server Components + Server Actions

## 3. Data Model

### `clothes`
- `id`: UUID (Primary Key)
- `name`: String
- `image_url`: String (Vercel Blob URL)
- `description`: Text (Optional)
- `created_at`: Timestamp

### `laundry_sessions`
- `id`: UUID (Primary Key)
- `start_date`: Timestamp
- `expected_return_date`: Timestamp (Optional)
- `status`: Enum ('active', 'completed')
- `created_at`: Timestamp

### `laundry_items`
- `id`: UUID (Primary Key)
- `session_id`: UUID (Foreign Key -> `laundry_sessions.id`)
- `cloth_id`: UUID (Foreign Key -> `clothes.id`)
- `is_returned`: Boolean (Default: false)
- `created_at`: Timestamp

## 4. Key Views & Workflows

### 4.1. Dashboard
- Summary cards for active sessions and total clothes.
- "Start New Session" primary action.
- Recent activity feed.

### 4.2. Wardrobe (Inventory)
- Grid view of all `clothes`.
- Search and filter by name.
- Detail view for each cloth showing its laundry history.

### 4.3. Session Management
- **Create Session:** Select multiple clothes from the wardrobe OR "Quick Add" a new cloth (upload photo -> name -> save to wardrobe -> add to session).
- **Session Tracking:** View all items in a specific session. Mark items as "Returned" individually. Session automatically completes when all items are returned (or manual toggle).

## 5. UI/UX Design (Minimalist)
- Clean typography using a sans-serif stack (e.g., Inter).
- Generous whitespace.
- Subtle animations for transitions between views.
- Mobile-first responsive design for easy photo taking and status checking.

## 6. Security & Privacy
- **Personal Use:** No multi-tenant auth required for the initial phase (single-user assumption).
- **Environment Variables:** All API keys (Supabase, Vercel Blob) stored in `.env.local`.

## 7. Accessibility
- Semantic HTML landmarks (`<main>`, `<nav>`, `<header>`).
- ARIA labels for image uploads and interactive status toggles.
- Focus management for modals (Quick Add dialog).
- `aria-live` for session completion and item return notifications.
