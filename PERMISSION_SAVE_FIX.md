# Permission Save Bug Fix

## Problem
When selecting "Can Request Items" and "Can View Requests" permissions and clicking save, the success message appeared but the permissions were not actually saved to the database.

## Root Cause
Two issues were preventing the new permissions from being saved:

### Issue 1: Frontend Not Initializing New Permissions
In `app/admin/users/page.tsx`, the `handleEditUser` function was not including the new permissions when loading a user's current permissions.

**Before:**
```typescript
setPermissions(user.permissions || {
  canRegisterItems: false,
  canIssueItems: false,
  canManageLocations: false,
  canManageCategories: false,
  canApproveItems: false,
  canViewReports: false,
});
```

**After:**
```typescript
setPermissions(user.permissions || {
  canRegisterItems: false,
  canIssueItems: false,
  canRequestItems: false,           // ADDED
  canViewRequests: false,           // ADDED
  canManageLocations: false,
  canManageCategories: false,
  canApproveItems: false,
  canViewReports: false,
});
```

### Issue 2: Backend Not Saving New Permissions
In `app/api/admin/users/route.ts`, the PUT endpoint was not including the new permissions when updating the user in the database.

**Before:**
```typescript
if (permissions) {
  user.permissions = {
    canRegisterItems: permissions.canRegisterItems || false,
    canIssueItems: permissions.canIssueItems || false,
    canManageLocations: permissions.canManageLocations || false,
    canManageCategories: permissions.canManageCategories || false,
    canApproveItems: permissions.canApproveItems || false,
    canViewReports: permissions.canViewReports || false,
  };
}
```

**After:**
```typescript
if (permissions) {
  user.permissions = {
    canRegisterItems: permissions.canRegisterItems || false,
    canIssueItems: permissions.canIssueItems || false,
    canRequestItems: permissions.canRequestItems || false,     // ADDED
    canViewRequests: permissions.canViewRequests || false,     // ADDED
    canManageLocations: permissions.canManageLocations || false,
    canManageCategories: permissions.canManageCategories || false,
    canApproveItems: permissions.canApproveItems || false,
    canViewReports: permissions.canViewReports || false,
  };
}
```

## Solution
Updated both the frontend and backend to properly handle the new permissions:

1. **Frontend (`app/admin/users/page.tsx`):**
   - Added `canRequestItems` and `canViewRequests` to the default permissions object
   - Now properly initializes these permissions when editing a user

2. **Backend (`app/api/admin/users/route.ts`):**
   - Added `canRequestItems` and `canViewRequests` to the permissions update logic
   - Now properly saves these permissions to the database

## Testing

### Step 1: Assign Permissions
1. Go to Admin → Users
2. Click Edit on a user
3. Check "Can Request Items" checkbox
4. Check "Can View Requests" checkbox
5. Click "Save Changes"
6. Verify success message appears

### Step 2: Verify Permissions Saved
1. Refresh the page
2. Click Edit on the same user
3. Verify both checkboxes are still checked
4. Verify permission chips appear in the table

### Step 3: Verify Menu Items Appear
1. Logout and login as the user with permissions
2. Verify "Request Item" appears in main menu
3. Verify "View Requests" appears in admin section
4. Click on each menu item to verify access

## Files Modified

- `app/admin/users/page.tsx`
  - Updated `handleEditUser` function to include new permissions

- `app/api/admin/users/route.ts`
  - Updated PUT endpoint to save new permissions

## Result

✅ Permissions now save correctly
✅ Menu items appear after permission assignment
✅ Users can access Request Item and View Requests pages
✅ Permissions persist after page refresh
