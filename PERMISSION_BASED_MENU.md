# Permission-Based Menu System

## Overview
The sidebar menu is now dynamic and shows/hides menu items based on user permissions. Users only see menu items they have access to.

## How It Works

### Menu Items & Required Permissions

#### Main Menu
| Menu Item | Required Permission | Notes |
|-----------|-------------------|-------|
| Dashboard | None | Always visible |
| Register Item | canRegisterItems | Hidden if user doesn't have permission |
| Issue Item | canIssueItems | Hidden if user doesn't have permission |

#### Reports Menu
| Menu Item | Required Permission | Notes |
|-----------|-------------------|-------|
| Registered Items | canViewReports | Hidden if user doesn't have permission |
| Issued Items | canViewReports | Hidden if user doesn't have permission |

#### Admin Menu (Admin Only)
| Menu Item | Required Permission | Notes |
|-----------|-------------------|-------|
| Users | None | Admin only, always visible |
| Locations | canManageLocations | Hidden if admin doesn't have permission |
| Categories | canManageCategories | Hidden if admin doesn't have permission |

#### Approver Menu (Approver Only)
| Menu Item | Required Permission | Notes |
|-----------|-------------------|-------|
| Approvals | None | Always visible for approvers |

## Permission Rules

1. **Admins** have all permissions by default
2. **Approvers** see:
   - Dashboard
   - Approvals (if isApprover = true)
   - Reports (if canViewReports = true)
   - Admin section (if isAdmin = true)

3. **Regular Users** see:
   - Dashboard
   - Menu items based on assigned permissions
   - Reports (if canViewReports = true)

## Examples

### Approver with Limited Permissions
```
Permissions:
- canRegisterItems: false
- canIssueItems: false
- canManageLocations: false
- canManageCategories: false
- canApproveItems: true
- canViewReports: false

Visible Menu:
- Dashboard
- Approvals
```

### Warehouse Staff
```
Permissions:
- canRegisterItems: true
- canIssueItems: true
- canManageLocations: false
- canManageCategories: false
- canApproveItems: false
- canViewReports: true

Visible Menu:
- Dashboard
- Register Item
- Issue Item
- Reports (Registered Items, Issued Items)
```

### Admin User
```
Permissions: All (by default)

Visible Menu:
- Dashboard
- Register Item
- Issue Item
- Reports (Registered Items, Issued Items)
- Admin Section:
  - Users
  - Locations
  - Categories
```

## Implementation Details

### Sidebar Component Changes

1. **Added requiresPermission field** to menu items:
```javascript
const menuItems = [
  { text: 'Dashboard', icon: DashboardIcon, path: '/dashboard', requiresPermission: null },
  { text: 'Register Item', icon: InventoryIcon, path: '/forms/newItem', requiresPermission: 'canRegisterItems' },
  { text: 'Issue Item', icon: AssignmentIcon, path: '/forms/issueItem', requiresPermission: 'canIssueItems' },
];
```

2. **Added hasPermission function**:
```javascript
const hasPermission = (permission: string | null): boolean => {
  if (!permission) return true; // No permission required
  if (currentUser?.isAdmin) return true; // Admins have all permissions
  return currentUser?.permissions?.[permission] || false;
};
```

3. **Added filterMenuItems function**:
```javascript
const filterMenuItems = (items: any[]) => {
  return items.filter(item => hasPermission(item.requiresPermission));
};
```

4. **Updated menu rendering**:
```javascript
{filterMenuItems(menuItems).map((item) => { ... })}
{filterMenuItems(reportItems).map((item) => { ... })}
{filterMenuItems(adminItems).map((item) => { ... })}
```

## Benefits

1. **Cleaner UI** - Users only see relevant menu items
2. **Better UX** - No confusion about unavailable features
3. **Security** - Prevents accidental access attempts
4. **Scalability** - Easy to add new permissions and menu items
5. **Flexibility** - Permissions can be changed without code changes

## Future Enhancements

- Permission-based page access (redirect if no permission)
- Permission-based button visibility on pages
- Permission-based API access control
- Audit logging for permission changes
- Permission expiration/time-based access
- Role-based permission groups
