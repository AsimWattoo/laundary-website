# Clothing Groups Management Design Spec

**Goal:** Provide a dedicated UI within the Wardrobe section to view, edit, and delete clothing groups.

## User Interface (UI)
- **Tabbed Navigation**: Implement a `Tabs` component in `WardrobeClient` to switch between "Individual Items" and "Clothing Groups".
- **Groups Grid**: 
    - Display groups in a responsive grid.
    - **Collage Preview**: Each group card will show a 2x2 grid of the first 4 items in that group.
    - **Group Details**: Show the group name and the total number of items.
- **Management Actions**:
    - **Edit Group**: A button on the card opens `EditGroupDialog`, allowing the user to rename the group and modify the selected items.
    - **Delete Group**: A button on the card opens a confirmation dialog to delete the group record (without deleting the underlying clothes).

## Architecture & Data Flow
- **Wardrobe Page (Server Component)**:
    - Update to fetch both `allClothes` and `allGroups` (with their joined items).
- **WardrobeClient (Client Component)**:
    - Manage the active tab state.
    - Render either the `ItemsGrid` or the new `GroupsGrid`.
- **Server Actions**:
    - `updateClothingGroup(id, name, clothIds)`: New action to update group details and its associated items.
    - `deleteClothingGroup(id)`: Use the existing action.

## Components
- **EditGroupDialog.tsx**: A new component that reuses logic from `AddGroupDialog` for name input and multi-item selection.
- **GroupsGrid.tsx**: A new component to render the collection of group cards.

## Error Handling
- Use `sonner` for success and error toast notifications.
- Implement loading states (spinners) on all management buttons.

## Verification Plan
- **Manual Test**: Verify that creating a group appears in the "Groups" tab.
- **Manual Test**: Verify that editing a group's name or items reflects immediately in the UI.
- **Manual Test**: Verify that deleting a group removes it from the list but keeps the clothes in the "Items" tab.
