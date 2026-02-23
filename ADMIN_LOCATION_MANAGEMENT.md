# Admin Location Management System

## Overview
Admins can now manage locations/warehouses through a dedicated admin panel. All dropdowns automatically populate from the database.

## Features

✅ **Admin-Only Access** - Only admin users can access location management
✅ **Create Locations** - Add new warehouses/locations
✅ **Edit Locations** - Update existing location details
✅ **Delete Locations** - Remove locations from the system
✅ **Auto-Populate Dropdowns** - All forms fetch locations from database
✅ **Status Management** - Mark locations as active/inactive

## How to Access

### Method 1: Via Sidebar
1. Login as admin user
2. Look for "Admin" section in sidebar
3. Click "Locations"

### Method 2: Direct URL
```
http://localhost:3000/admin/locations
```

## Location Management Page

### View All Locations
- Table shows all locations with:
  - Name
  - Code (short identifier)
  - Description
  - Status (Active/Inactive)
  - Actions (Edit/Delete)

### Stats Cards
- **Total Locations**: Count of all locations
- **Active**: Count of active locations
- **Inactive**: Count of inactive locations

## Creating a New Location

1. Click "Add New Location" button
2. Fill in the form:
   - **Location Name**: Full name (e.g., "Addis Ababa")
   - **Location Code**: Short code (e.g., "AA") - auto-converts to uppercase
   - **Description**: Optional details
3. Click "Create Location"

### Example Locations
```
Name: Addis Ababa
Code: AA
Description: Main warehouse in Addis Ababa

Name: Cairo
Code: CA
Description: Cairo branch warehouse

Name: Dubai
Code: DXB
Description: Dubai distribution center
```

## Editing a Location

1. Click the **Edit** icon (pencil) on any location row
2. Update the fields
3. Click "Update Location"

## Deleting a Location

1. Click the **Delete** icon (trash) on any location row
2. Confirm deletion in the dialog
3. Location is removed from system

**Note**: Deleted locations won't appear in dropdowns anymore

## How Dropdowns Work

### User Registration
When admin registers a new user:
1. Location dropdown fetches all active locations from database
2. Admin selects one
3. User is assigned to that location

### Item Registration
When registering items:
1. Warehouse dropdown fetches all active locations from database
2. User selects one
3. Item is assigned to that warehouse

### Automatic Updates
- Add new location → appears in all dropdowns immediately
- Delete location → disappears from all dropdowns immediately
- No manual refresh needed

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
    "_id": "507f1f77bcf86cd799439011",
    "name": "Addis Ababa",
    "code": "AA",
    "description": "Main warehouse",
    "isActive": true,
    "createdAt": "2026-01-21T10:00:00Z"
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

### PUT /api/locations/:id (Admin only)
Update location
```bash
curl -X PUT http://localhost:3000/api/locations/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Addis Ababa",
    "code": "AA",
    "description": "Updated description",
    "isActive": true
  }'
```

### DELETE /api/locations/:id (Admin only)
Delete location
```bash
curl -X DELETE http://localhost:3000/api/locations/507f1f77bcf86cd799439011 \
  -H "Cookie: token=YOUR_ADMIN_TOKEN"
```

## Workflow Example

### Step 1: Setup Locations
1. Login as admin
2. Go to `/admin/locations`
3. Create locations:
   - Addis Ababa (AA)
   - Cairo (CA)
   - Dubai (DXB)

### Step 2: Register Users
1. Go to `/auth/register`
2. Create User 1:
   - Username: warehouse_addis
   - Location: **Addis Ababa** (from dropdown)
3. Create User 2:
   - Username: warehouse_cairo
   - Location: **Cairo** (from dropdown)

### Step 3: Register Items
1. Go to item registration
2. Create Item 1:
   - Warehouse: **Addis Ababa** (from dropdown)
3. Create Item 2:
   - Warehouse: **Cairo** (from dropdown)

### Step 4: Verify Access
- User 1 logs in → sees only items from Addis Ababa
- User 2 logs in → sees only items from Cairo
- Admin logs in → sees all items

## Best Practices

1. **Use Consistent Names**: Use full city/location names
2. **Use Short Codes**: 2-3 letter codes for easy identification
3. **Add Descriptions**: Help users understand each location
4. **Deactivate Instead of Delete**: Mark locations as inactive if they're no longer used
5. **Plan Ahead**: Create all locations before registering users

## Troubleshooting

### Dropdown is Empty
- Check if locations are created in admin panel
- Verify locations are marked as "Active"
- Refresh the page

### User Can't See Items
- Verify user's location matches item's warehouse name
- Check if user is admin (admins see all items)
- Verify item's warehouse is set correctly

### Can't Access Location Management
- Verify you're logged in as admin user
- Check if user has `isAdmin: true` in database
- Try accessing `/admin/locations` directly

## Database Management

### View All Locations (including inactive)
```javascript
db.locations.find()
```

### Deactivate a Location
```javascript
db.locations.updateOne(
  { name: "Old Location" },
  { $set: { isActive: false } }
)
```

### Reactivate a Location
```javascript
db.locations.updateOne(
  { name: "Old Location" },
  { $set: { isActive: true } }
)
```

### Delete All Locations
```javascript
db.locations.deleteMany({})
```

## Summary

✅ Admin can manage locations through UI
✅ No more manual database edits needed
✅ Dropdowns auto-populate from database
✅ Changes take effect immediately
✅ Prevents location name misspellings
✅ Ensures data consistency across system
