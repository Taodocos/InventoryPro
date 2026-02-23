# User Management & Role Assignment System

## Overview
The User Management system allows admins to assign specific roles and permissions to users. Instead of just having admin/non-admin, users can now have granular permissions for different features.

## User Roles

### Admin
- Full system access
- Can create users
- Can manage all users and their permissions
- Can manage locations and categories
- Can view all data regardless of location

### Approver
- Can approve/reject issued items in their location
- Can view pending approvals
- Can view reports (if permission granted)
- Location-specific access

### Regular User
- Can perform actions based on assigned permissions
- Location-specific access
- Cannot access admin features

## Permissions

Each user can have the following permissions assigned:

| Permission | Description | Use Case |
|-----------|-------------|----------|
| Can Register Items | Can add new items to inventory | Warehouse staff |
| Can Issue Items | Can issue items to departments | Issue coordinators |
| Can Manage Locations | Can create/edit/delete locations | Admin staff |
| Can Manage Categories | Can create/edit/delete categories | Admin staff |
| Can Approve Items | Can approve issued items | Approvers |
| Can View Reports | Can access reports section | Managers |

## User Management Page

### Location
`/admin/users` (Admin only)

### Features

#### 1. User List
- View all registered users
- Search by username, email, or location
- See user roles and permissions at a glance
- Filter by role type

#### 2. User Statistics
- Total Users count
- Number of Admins
- Number of Approvers
- Number of Regular Users

#### 3. Edit User Permissions
- Click "Edit" on any user
- Assign/revoke permissions
- Set approver role
- Save changes

### User Information Displayed

For each user, the system shows:
- Username
- Email
- Location
- Role (Admin/Approver/User)
- Assigned Permissions
- Edit button

## How to Assign Roles

### Step 1: Go to User Management
1. Login as admin
2. Click "Users" in Admin section of sidebar
3. View list of all users

### Step 2: Select User
1. Find the user you want to manage
2. Use search bar to filter if needed
3. Click "Edit" button

### Step 3: Assign Permissions
1. Check/uncheck desired permissions
2. Toggle "Approver User" if needed
3. Click "Save Changes"

### Step 4: Confirm
- Success message appears
- User list updates
- Changes take effect immediately

## Database Schema

### User Model
```javascript
{
  username: String,
  email: String,
  password: String,
  isAdmin: Boolean,
  isApprover: Boolean,
  location: String,
  permissions: {
    canRegisterItems: Boolean,
    canIssueItems: Boolean,
    canManageLocations: Boolean,
    canManageCategories: Boolean,
    canApproveItems: Boolean,
    canViewReports: Boolean,
  },
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Get All Users
```
GET /api/admin/users
```
Returns list of all users with their permissions.

**Response:**
```json
[
  {
    "_id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "location": "Addis Ababa",
    "isAdmin": false,
    "isApprover": true,
    "permissions": {
      "canRegisterItems": true,
      "canIssueItems": true,
      "canManageLocations": false,
      "canManageCategories": false,
      "canApproveItems": true,
      "canViewReports": true
    }
  }
]
```

### Update User Permissions
```
PUT /api/admin/users
```

**Request Body:**
```json
{
  "userId": "user_id",
  "permissions": {
    "canRegisterItems": true,
    "canIssueItems": true,
    "canManageLocations": false,
    "canManageCategories": false,
    "canApproveItems": true,
    "canViewReports": true
  },
  "isApprover": true
}
```

**Response:**
```json
{
  "message": "User updated successfully",
  "user": {
    "id": "user_id",
    "username": "john_doe",
    "permissions": { ... }
  }
}
```

## Permission Examples

### Warehouse Staff
- ✅ Can Register Items
- ✅ Can Issue Items
- ❌ Can Manage Locations
- ❌ Can Manage Categories
- ❌ Can Approve Items
- ✅ Can View Reports

### Department Manager
- ❌ Can Register Items
- ❌ Can Issue Items
- ❌ Can Manage Locations
- ❌ Can Manage Categories
- ✅ Can Approve Items
- ✅ Can View Reports

### Admin Staff
- ✅ Can Register Items
- ✅ Can Issue Items
- ✅ Can Manage Locations
- ✅ Can Manage Categories
- ✅ Can Approve Items
- ✅ Can View Reports

## Security Features

- Only admins can access user management
- Only admins can modify user permissions
- Permissions are checked on each request
- All changes are logged with timestamp
- Users can only access features they have permission for

## Future Enhancements

- Permission groups/roles (e.g., "Warehouse Manager", "Department Head")
- Audit trail for permission changes
- Bulk permission assignment
- Permission templates
- Time-based permissions (temporary access)
- Department-based access control
- Activity logs per user
- Permission inheritance from groups

## Troubleshooting

### User can't access a feature
- Check if user has required permission
- Verify user's location matches the data location
- Confirm user is not disabled

### Permission changes not taking effect
- User needs to log out and log in again
- Check if JWT token needs refresh
- Verify permission was actually saved

### Can't edit user
- Verify you are logged in as admin
- Check if user exists in database
- Ensure user ID is correct
