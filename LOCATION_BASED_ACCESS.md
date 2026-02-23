# Location-Based Access Control System

## Overview
Users are now assigned to specific locations/warehouses. Regular users only see inventory data from their assigned location, while admins see all data.

## What's Changed

### 1. User Model (`lib/models/User.ts`)
- Added `location` field (required) - stores the warehouse/location name
- Example: "Addis Ababa", "Cairo", "Dubai"

### 2. User Registration (`app/auth/register/page.tsx`)
- New "Location / Warehouse" field in the registration form
- Admin must assign a location when creating users
- Location field is required

### 3. Authentication (`lib/auth.ts`)
- JWT token now includes `location` field
- AuthPayload interface updated with location

### 4. Login Response (`app/api/auth/login/route.ts`)
- Returns user's location in login response
- Location stored in JWT token

### 5. Data Filtering

#### Items API (`app/api/items/route.ts`)
- **Admin users**: See all items
- **Regular users**: Only see items where `warehouseName` matches their `location`

#### Issues API (`app/api/issues/route.ts`)
- **Admin users**: See all issued items
- **Regular users**: Only see issues for items in their location

#### Stats API (`app/api/stats/route.ts`)
- **Admin users**: See stats for all items
- **Regular users**: See stats only for items in their location

## How It Works

### Example Scenario

**User 1 (Regular User)**
- Username: `warehouse_addis`
- Location: `Addis Ababa`
- When logged in, sees only items with `warehouseName: "Addis Ababa"`

**User 2 (Regular User)**
- Username: `warehouse_cairo`
- Location: `Cairo`
- When logged in, sees only items with `warehouseName: "Cairo"`

**Admin User**
- Username: `admin`
- Location: `Headquarters` (or any location)
- Sees ALL items regardless of warehouse

### Data Flow

1. User logs in with credentials
2. System verifies credentials and creates JWT token with location
3. Token stored in httpOnly cookie
4. When user requests data (items, stats, issues):
   - System checks if user is admin
   - If admin: return all data
   - If regular user: filter data by user's location
5. Only items matching user's location are returned

## Database Queries

### For Regular Users
```javascript
// Items query
{ warehouseName: user.location }

// Issues query
// First get items from user's location
const userItems = await Item.find({ warehouseName: user.location })
// Then get issues for those items
{ itemId: { $in: userItemIds } }
```

### For Admin Users
```javascript
// No filter - returns all data
{}
```

## Important Notes

1. **Location Matching**: The user's `location` field must exactly match the item's `warehouseName` field
   - User location: "Addis Ababa"
   - Item warehouse: "Addis Ababa" ✓ (will see)
   - Item warehouse: "addis ababa" ✗ (won't see - case sensitive)

2. **Admin Access**: Admins can see all data regardless of their assigned location

3. **New User Registration**: When registering a new user, you must specify their location

4. **Existing Users**: If you have existing users in the database, you'll need to add the `location` field to them

## Migration for Existing Users

If you have existing users without location, update them in MongoDB:

```javascript
db.users.updateMany(
  { location: { $exists: false } },
  { $set: { location: "Default Location" } }
)
```

## Testing

1. Create two users with different locations:
   - User A: location = "Addis Ababa"
   - User B: location = "Cairo"

2. Create items with different warehouses:
   - Item 1: warehouseName = "Addis Ababa"
   - Item 2: warehouseName = "Cairo"

3. Login as User A:
   - Should see only Item 1
   - Stats should reflect only Item 1

4. Login as User B:
   - Should see only Item 2
   - Stats should reflect only Item 2

5. Login as Admin:
   - Should see both items
   - Stats should reflect both items
