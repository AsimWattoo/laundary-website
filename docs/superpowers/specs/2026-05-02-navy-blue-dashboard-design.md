# Design Spec: Navy Blue Dashboard & Responsive Navbar

## Goal
Transform the Laundry Tracker dashboard into a professional, responsive interface with a navy blue light-mode theme and interactive data visualizations.

## 1. Visual Design (Navy Blue Light Mode)
*   **Primary Theme:** Deep Navy Professional.
*   **Palette:**
    *   `primary`: `#0f172a` (Slate 900) - Used for Navbar, Primary Buttons, and Main Headings.
    *   `background`: `#ffffff` (White) - Page body.
    *   `surface`: `#f8fafc` (Slate 50) - Card backgrounds.
    *   `border`: `#e2e8f0` (Slate 200) - Card borders and separators.
    *   `text-main`: `#0f172a` (Slate 900) - Primary text.
    *   `text-muted`: `#64748b` (Slate 500) - Secondary/helper text.
*   **Aesthetics:** Sharp corners (0.5rem radius), subtle shadows, and high-contrast typography.

## 2. Responsive Navbar
*   **Behavior:**
    *   **Desktop (>768px):** Horizontal navigation links.
    *   **Mobile (<768px):** 
        *   Logo on the left.
        *   "Hamburger" menu icon on the right.
        *   Menu toggle reveals a vertical list of links (Dashboard, Wardrobe, New Session).
*   **Implementation:** Use a Client Component for the Navbar to handle state (open/closed) and animations.

## 3. Dashboard Visualization (Graphs)
*   **Library:** `recharts`
*   **Charts:**
    1.  **Laundry Volume Trend (AreaChart):**
        *   **Data:** Sessions aggregated by week/day.
        *   **Visual:** Navy line with a light blue gradient area fill.
    2.  **Item Status Distribution (PieChart/Donut):**
        *   **Data:** Count of `isReturned: true` vs `isReturned: false` across all active sessions.
        *   **Colors:** Navy (`#0f172a`) for Returned, Slate (`#94a3b8`) for Pending.
    3.  **Most Laundered Items (BarChart):**
        *   **Data:** Top 5 items sorted by frequency in `laundry_items`.
        *   **Visual:** Horizontal bars for better mobile readability.

## 4. Responsive Layout (Grid)
*   **Stats Overview:** 
    *   Mobile: 1 column
    *   Desktop: 3 columns (Active Sessions, Total Clothes, Pending Items)
*   **Main Content:**
    *   Mobile: Single column stack.
    *   Desktop: 
        *   Trend Graph: 2/3 width.
        *   Status Pie: 1/3 width.
        *   Recent History & Top Items: Side-by-side or below in a 2-column grid.

## 5. Technical Considerations
*   **Client vs Server:** Fetch data in the Server Component (`page.tsx`), but pass serializable data to a Client Component for rendering Recharts.
*   **Accessibility:**
    *   Aria-labels for the mobile menu button.
    *   Focus management for the dropdown menu.
    *   Alt-text/Descriptions for charts for screen readers.
