# Request System Permissions Update

## Changes Made

### 1. Separated Request Permissions

Previously there was only one permission: `canRequestItems`

Now there are TWO separate permissions:

#### `canRequestItems`
- **Purpose:** Allow users to submit/create item requests
- **Access:** `/forms/requestItem` page
- **Menu Item:** "Request Item" (visible in main menu when permission granted)

#### `canViewRequests`
- **Purpose:** Allow users to view, approve, and reject item requests
- **Access:** `/admin/requests` page
- **Menu Item:** "View Requests" (visible in admin section when permission granted)

---

## User Model Updates

### Updated Permissions Object

```typescript
permissions: {
  canRegisterItems: boolean;
  canIssueItems: boolean;
  canRequestItems: boolean;      // NEW: Submit requests
  canViewRequests: boolean;       // NEW: View/manage requests
  canManageLocations: boolean;
  canManageCategories: boolean;
  canApproveItems: boolean;
  canViewReports: boolean;
}
```

---

## User Management Page

### Permission Checkboxes

The User Management page now shows 8 permission checkboxes:

1. ✅ Can Register Items
2. ✅ Can Issue Items
3. ✅ Can Request Items (NEW)
4. ✅ Can View Requests (NEW)
5. ✅ Can Manage Locations
6. ✅ Can Manage Categories
7. ✅ Can Approve Items
8. ✅ Can View Reports

### Permission Chips in Table

The permissions column now displays all assigned permissions as chips:

```
[Register Items] [Issue Items] [Request Items] [View Requests] [Manage Locations] ...
```

---

## Sidebar Menu Updates

### Main Menu
- **Request Item** - Visible only if user has `canRequestItems` permission

### Admin Section
- **View Requests** - Visible only if user has `canViewRequests` permission

---

## Permission Assignment Workflow

### Step 1: Open User Management
- Admin navigates to Admin → Users

### Step 2: Select User
- Click "Edit" on desired user

### Step 3: Assign Permissions
- Toggle "Can Request Items" checkbox to allow user to submit requests
- Toggle "Can View Requests" checkbox to allow user to review requests

### Step 4: Save
- Click "Save Changes"
- Permissions take effect immediately

---

## Access Control

### Request Item Page (`/forms/requestItem`)
- **Required Permission:** `canRequestItems`
- **Behavior:** 
  - User can submit new requests
  - User can view own requests
  - User can delete own requests
  - User cannot view other users' requests

### View Requests Page (`/admin/requests`)
- **Required Permission:** `canViewRequests`
- **Behavior:**
  - User can view all requests from their location
  - User can approve/reject requests
  - User can mark requests as seen
  - Non-admin users redirected if permission missing

---

## Permission Combinations

### Example 1: Department Staff
- ✅ Can Request Items
- ❌ Can View Requests
- **Result:** Can submit requests but cannot review them

### Example 2: Inventory Manager
- ❌ Can Request Items
- ✅ Can View Requests
- **Result:** Can review requests but cannot submit them

### Example 3: Full Access User
- ✅ Can Request Items
- ✅ Can View Requests
- **Result:** Can both submit and review requests

### Example 4: Admin
- ✅ All permissions (automatic)
- **Result:** Full access to all features

---

## Files Modified

### Models
- `lib/models/User.ts`
  - Added `canRequestItems` to permissions
  - Added `canViewRequests` to permissions

### Components
- `app/components/Sidebar.tsx`
  - Updated menu items to use correct permissions
  - "Request Item" uses `canRequestItems`
  - "View Requests" uses `canViewRequests`

### Pages
- `app/admin/users/page.tsx`
  - Updated User interface with new permissions
  - Added permission checkboxes for both new permissions
  - Updated permissions display in table
  - Updated permissions state initialization

- `app/admin/requests/page.tsx`
  - Added permission check on page load
  - Redirects to dashboard if user lacks `canViewRequests` permission

---

## Testing Checklist

### Permission Assignment
- [ ] Admin can toggle "Can Request Items" checkbox
- [ ] Admin can toggle "Can View Requests" checkbox
- [ ] Permissions save correctly
- [ ] Permissions display as chips in table

### Menu Visibility
- [ ] "Request Item" appears only with `canRequestItems` permission
- [ ] "View Requests" appears only with `canViewRequests` permission
- [ ] Menu updates immediately after permission change

### Page Access
- [ ] User with `canRequestItems` can access `/forms/requestItem`
- [ ] User without `canRequestItems` cannot see menu item
- [ ] User with `canViewRequests` can access `/admin/requests`
- [ ] User without `canViewRequests` is redirected to dashboard

### Functionality
- [ ] User with `canRequestItems` can submit requests
- [ ] User with `canViewRequests` can approve/reject requests
- [ ] User without permissions cannot access features

---

## Migration Notes

### For Existing Users

If you have existing users with the old `canRequestItems` permission:

1. The permission will still work for submitting requests
2. You may want to separately assign `canViewRequests` to users who should review requests
3. No data loss or breaking changes

### Recommended Setup

For a typical organization:

**Department Staff:**
- ✅ Can Request Items
- ❌ Can View Requests

**Inventory Manager:**
- ❌ Can Request Items
- ✅ Can View Requests

**Admin:**
- ✅ All permissions

---

## Benefits

✅ **Separation of Concerns:** Request submission and review are separate permissions
✅ **Granular Control:** Admins can assign specific roles to users
✅ **Security:** Users can only perform actions they're authorized for
✅ **Flexibility:** Easy to create custom permission combinations
✅ **Scalability:** Easy to add more permissions in the future
