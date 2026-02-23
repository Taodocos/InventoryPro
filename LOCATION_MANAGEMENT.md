# Location Management System

## Problem Solved
- ✅ Prevents misspellings of location/warehouse names
- ✅ Eliminates case sensitivity issues
- ✅ Ensures consistency across the system
- ✅ Centralized location management

## How It Works

### 1. Locations Model
- Stores predefined locations/warehouses
- Each location has:
  - `name`: Full name (e.g., "Addis Ababa")
  - `code`: Short code (e.g., "AA")
  - `description`: Optional description
  - `isActive`: Whether location is active

### 2. Location Selection (Dropdown)
Instead of typing location names, users select from a dropdown:

**User Registration:**
- Admin selects location from dropdown when creating users
- No typos possible

**Item Registration:**
- When registering items, warehouse is selected from dropdown
- Matches user locations exactly

### 3. Setup Instructions

#### Step 1: Seed Default Locations
```bash
npm run seed-locations
```

This creates default locations:
- Addis Ababa (AA)
- Cairo (CA)
- Dubai (DXB)
- Nairobi (NRB)
- Lagos (LOS)
- Johannesburg (JNB)

#### Step 2: Add Custom Locations (via API)
As admin, you can add new locations:

```bash
curl -X POST http://localhost:3000/api/locations \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Khartoum",
    "code": "KRT",
    "description": "Khartoum regional office"
  }'
```

### 4. User Registration Flow

1. Admin goes to `/auth/register`
2. Fills in user details
3. **Selects location from dropdown** (not typing)
4. Checks "Admin User" if needed
5. Clicks "Register User"

### 5. Item Registration Flow

1. Admin/User goes to item registration
2. Selects category (auto-generates item ID)
3. Fills in item details
4. **Selects warehouse from dropdown** (not typing)
5. Submits form

### 6. Data Consistency

**Before (with text input):**
- User location: "Addis Ababa"
- Item warehouse: "addis ababa" ❌ (won't match - case sensitive)
- Item warehouse: "Addis Abba" ❌ (typo - won't match)

**After (with dropdown):**
- User location: "Addis Ababa" (selected from dropdown)
- Item warehouse: "Addis Ababa" (selected from dropdown)
- ✅ Perfect match - user sees the item

## API Endpoints

### GET /api/locations
Get all active locations
```bash
curl http://localhost:3000/api/locations
```

Response:
```json
[
  {
    "_id": "...",
    "name": "Addis Ababa",
    "code": "AA",
    "description": "Main warehouse in Addis Ababa",
    "isActive": true
  }
]
```

### POST /api/locations (Admin only)
Create new location
```bash
curl -X POST http://localhost:3000/api/locations \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Khartoum",
    "code": "KRT",
    "description": "Khartoum office"
  }'
```

## Managing Locations

### Add New Location
1. Login as admin
2. Use API endpoint or create admin UI for location management
3. Provide name, code, and optional description

### Deactivate Location
Update in MongoDB:
```javascript
db.locations.updateOne(
  { name: "Old Location" },
  { $set: { isActive: false } }
)
```

Inactive locations won't appear in dropdowns.

### Edit Location
Update in MongoDB:
```javascript
db.locations.updateOne(
  { name: "Addis Ababa" },
  { $set: { description: "Updated description" } }
)
```

## Benefits

1. **No Typos**: Users select from predefined list
2. **Case Insensitive**: Dropdown ensures exact matching
3. **Consistency**: All users and items use same location names
4. **Easy Management**: Centralized location control
5. **Scalability**: Easy to add/remove locations

## Example Scenario

**Setup:**
1. Run `npm run seed-locations` to create default locations
2. Create admin user with location "Addis Ababa"
3. Create regular user with location "Cairo"

**Usage:**
- Admin user logs in → sees all items from all locations
- Addis Ababa user logs in → sees only items from "Addis Ababa" warehouse
- Cairo user logs in → sees only items from "Cairo" warehouse

**No more issues with:**
- ❌ "addis ababa" vs "Addis Ababa"
- ❌ "Addis Abba" (typo)
- ❌ "AA" vs "Addis Ababa"
- ✅ All users see consistent location names
