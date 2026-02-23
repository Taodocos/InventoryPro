# View Requests Menu Visibility Fix

## Problem
When a non-admin user was given the `canViewRequests` permission, the "View Requests" menu item did not appear in their sidebar.

## Root Cause
The Sidebar component was only showing the "View Requests" menu item when the user was an admin (`currentUser?.isAdmin`). Non-admin users with the `canViewRequests` permission were not seeing the menu item.

## Solution
Added a separate conditional section in the Sidebar that displays "View Requests" for non-admin users who have the `canViewRequests` permission.

### Code Changes

**Before:**
```typescript
{currentUser?.isAdmin && (
  <>
    <Typography variant="overline">Admin</Typography>
    <List>
      {filterMenuItems(adminItems).map(...)}  // View Requests was here
    </List>
  </>
)}
```

**After:**
```typescript
{currentUser?.isAdmin && (
  <>
    <Typography variant="overline">Admin</Typography>
    <List>
      {filterMenuItems(adminItems).map(...)}  // Admin-only items
    </List>
  </>
)}

{currentUser?.permissions?.canViewRequests && !currentUser?.isAdmin && (
  <>
    <Typography variant="overline">Requests</Typography>
    <List>
      <ListItem component={Link} href="/admin/requests">
        View Requests
      </ListItem>
    </List>
  </>
)}
```

## How It Works

### For Admin Users
- "View Requests" appears in the "Admin" section
- Admin can manage all requests from all locations

### For Non-Admin Users with Permission
- "View Requests" appears in a separate "Requests" section
- User can view and manage requests from their location only

### For Users Without Permission
- "View Requests" menu item is not visible
- User cannot access the requests page

## Testing

### Step 1: Assign Permission to Non-Admin User
1. Go to Admin → Users
2. Select a non-admin user
3. Check "Can View Requests" permission
4. Click Save

### Step 2: Verify Menu Appears
1. Logout and login as that user
2. Look for "Requests" section in sidebar
3. Verify "View Requests" menu item is visible

### Step 3: Verify Access
1. Click "View Requests"
2. Should see requests from user's location
3. Can approve/reject requests

### Step 4: Verify Admin Still Works
1. Login as admin
2. "View Requests" should appear in "Admin" section
3. Can see all requests from all locations

## Files Modified

- `app/components/Sidebar.tsx`
  - Added conditional rendering for non-admin users with `canViewRequests` permission
  - Added new "Requests" section in sidebar
  - Maintained existing admin section functionality

## Result

✅ Non-admin users with `canViewRequests` permission now see "View Requests" menu
✅ Menu appears in a separate "Requests" section
✅ Admin users still see "View Requests" in "Admin" section
✅ Users without permission don't see the menu item
✅ Location-based access control still works
