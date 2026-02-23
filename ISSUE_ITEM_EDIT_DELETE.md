# Issue Item Edit and Delete Functionality

## Summary
Added edit and delete functionality to the issue item grid with restrictions - only pending items can be edited or deleted. Approved and rejected items are locked.

## Changes Made

### 1. Issue Item Form (`app/forms/issueItem/page.tsx`)

**New State Variables:**
- `isEditing`: Boolean to track if in edit mode
- `deleteDialogOpen`: Boolean for delete confirmation dialog
- `editingItem`: Stores the item being edited/deleted

**New Handler Functions:**
- `handleEditItem()`: Opens edit dialog for pending items only
- `handleDeleteItem()`: Opens delete confirmation for pending items only
- `handleConfirmDelete()`: Confirms and deletes the item via API
- `handleUpdateItem()`: Updates the issued item via API

**UI Updates:**
- Added "Edit" and "Delete" menu items to the 3-dot menu
- Menu items are disabled for non-pending items (Approved/Rejected)
- Dialog title changes to "Edit Issue Item" when editing
- Submit button changes to "Update Item" when editing
- Added delete confirmation dialog with item details

### 2. Issues API Endpoint (`app/api/issues/[id]/route.ts`)

**New DELETE Handler:**
- Validates that only pending items can be deleted
- Returns error if trying to delete approved/rejected items
- Deletes the issued item from database
- Returns success message

**Existing PUT Handler:**
- Already supports updating issued items
- Used for editing pending items

## Features

### Edit Functionality
- Only available for items with `approvalStatus === 'Pending'`
- Allows editing:
  - Issued Quantity
  - Issued To
  - Issue Date
  - Purpose
  - Issued By
  - Approved By
- Updates the item in database
- Refreshes the grid after update

### Delete Functionality
- Only available for items with `approvalStatus === 'Pending'`
- Shows confirmation dialog with item details
- Prevents accidental deletion
- Deletes the item from database
- Refreshes the grid after deletion

### Restrictions
- **Pending Items**: Can be edited and deleted ✓
- **Approved Items**: Cannot be edited or deleted (menu items disabled) ✗
- **Rejected Items**: Cannot be edited or deleted (menu items disabled) ✗

## Files Modified
- `app/forms/issueItem/page.tsx` - Added edit/delete UI and handlers
- `app/api/issues/[id]/route.ts` - Added DELETE endpoint

## User Experience
1. User clicks 3-dot menu on an issued item
2. If item is Pending:
   - "Edit" option is enabled
   - "Delete" option is enabled
3. If item is Approved or Rejected:
   - "Edit" option is disabled (grayed out)
   - "Delete" option is disabled (grayed out)
4. Clicking "Edit" opens dialog with current values
5. Clicking "Delete" shows confirmation with item details
6. After edit/delete, grid refreshes automatically
