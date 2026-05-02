# Spec: MonaSans Font and Wardrobe Edit

**Date:** 2026-05-03
**Status:** Draft
**Topic:** UI Polish & Functional Enhancement

## 1. Goal
The goal of this update is to improve the visual identity of the Laundry Tracker by adopting the **MonaSans** font and to enhance user control by allowing them to **edit existing wardrobe items**.

## 2. Requirements

### 2.1 Font Integration (MonaSans)
- Set MonaSans as the primary sans-serif font for the entire application.
- Use `next/font/local` for optimal loading and performance.
- Update Tailwind v4 variables to ensure all components inherit the new font.

### 2.2 Wardrobe Item Editing
- Add an "Edit" action to each item card in the wardrobe view.
- Provide a dialog pre-filled with the item's current details (name, type).
- Allow optional image replacement (uploading a new image to Vercel Blob).
- Ensure the UI reflects changes immediately upon success using `revalidatePath`.

## 3. Technical Design

### 3.1 Font Configuration
- **File:** `src/app/layout.tsx`
- **Implementation:**
    - Import `localFont` from `next/font/local`.
    - Configure `MonaSans` with weights (e.g., 200 to 900) and style (normal/italic).
    - Apply the font variable to the `body` tag.
- **File:** `src/app/globals.css`
    - Update `:root` to set `--font-sans` to the MonaSans variable.

### 3.2 Server Actions
- **File:** `src/lib/actions.ts`
- **Function:** `updateCloth(id: string, formData: FormData)`
    - Extract `name`, `type`, and optionally `image`.
    - If a new `image` is provided:
        - Upload to Vercel Blob using `put`.
        - Update the `imageUrl` in the database.
    - Update the `name` and `type` in the `clothes` table.
    - Call `revalidatePath('/wardrobe')`.

### 3.3 Components
- **EditClothDialog.tsx**:
    - Receives `cloth` object as a prop.
    - Uses a `Dialog` from shadcn/ui.
    - Includes fields for Name (input), Type (select), and Image (file input).
    - Handles "isPending" state during submission.
- **WardrobeClient.tsx**:
    - Add the `EditClothDialog` trigger to each item card.
    - Position the edit button (Pencil icon) next to the delete button.

## 4. Accessibility
- **Keyboard Navigation:** The Edit button will be focusable and triggerable via Enter/Space.
- **Screen Readers:** Add `aria-label="Edit [item name]"` to the edit button.
- **Focus Management:** Ensure focus returns to the edit button after the dialog closes.
- **Forms:** Use semantic `<label>` elements and `aria-required` where applicable.

## 5. Success Criteria
- The application font is visibly changed to MonaSans.
- Users can click "Edit" on a wardrobe item, change its name/type/image, and see the updated item in the wardrobe list.
- No regressions in item creation or deletion.
