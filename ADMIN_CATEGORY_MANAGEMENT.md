# Admin Category Management System

## Overview
Admins can now manage item categories through a dedicated admin panel. All category dropdowns automatically populate from the database.

## Features

✅ **Admin-Only Access** - Only admin users can access category management
✅ **Create Categories** - Add new item categories
✅ **Edit Categories** - Update existing category details
✅ **Delete Categories** - Remove categories from the system
✅ **Auto-Populate Dropdowns** - All forms fetch categories from database
✅ **Status Management** - Mark categories as active/inactive

## How to Access

### Method 1: Via Sidebar
1. Login as admin user
2. Look for "Admin" section in sidebar
3. Click "Categories"

### Method 2: Direct URL
```
http://localhost:3000/admin/categories
```

## Category Management Page

### View All Categories
- Table shows all categories with:
  - Name
  - Code (short identifier)
  - Description
  - Status (Active/Inactive)
  - Actions (Edit/Delete)

### Stats Cards
- **Total Categories**: Count of all categories
- **Active**: Count of active categories
- **Inactive**: Count of inactive categories

## Creating a New Category

1. Click "Add New Category" button
2. Fill in the form:
   - **Category Name**: Full name (e.g., "Medical Equipment")
   - **Category Code**: Short code (e.g., "MED") - auto-converts to uppercase
   - **Description**: Optional details
3. Click "Create Category"

### Example Categories
```
Name: Medical Equipment
Code: MED
Description: Medical devices and equipment

Name: Supplies
Code: SUPP
Description: General supplies and consumables

Name: Emergency Items
Code: ER
Description: Emergency and critical items
```

## Editing a Category

1. Click the **Edit** icon (pencil) on any category row
2. Update the fields
3. Click "Update Category"

## Deleting a Category

1. Click the **Delete** icon (trash) on any category row
2. Confirm deletion in the dialog
3. Category is removed from system

**Note**: Deleted categories won't appear in dropdowns anymore

## How Dropdowns Work

### Item Registration
When registering items:
1. Category dropdown fetches all active categories from database
2. User selects one
3. Item ID auto-generates based on category code
4. Item is assigned to that category

### Automatic Updates
- Add new category → appears in dropdown immediately
- Delete category → disappears from dropdown immediately
- No manual refresh needed

## Item Registration Form Changes

### Removed Fields
- ❌ Purchase Price (per unit)
- ❌ Shelf / Location Code

### Simplified Steps
**Step 1: Item Information**
- Item ID (auto-generated)
- Item Name
- Category (dropdown - from database)
- Description
- Quantity
- Unit
- Unit Price
- Total Price (auto-calculated)
- Recorded By

**Step 2: Purchase Details**
- Supplier Name
- Purchase Date
- Total Purchase Cost
- Expiry Date

**Step 3: Storage & Location**
- Warehouse Name (dropdown - from database)

### Form Validation
- **Next button is disabled** until all Step 1 fields are filled:
  - Item ID (auto-filled)
  - Item Name
  - Category
  - Quantity
  - Unit Price
  - Recorded By

## API Endpoints

### GET /api/categories
Get all active categories
```bash
curl http://localhost:3000/api/categories
```

Response:
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Medical Equipment",
    "code": "MED",
    "description": "Medical devices",
    "isActive": true,
    "createdAt": "2026-01-21T10:00:00Z"
  }
]
```

### POST /api/categories (Admin only)
Create new category
```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Emergency Items",
    "code": "ER",
    "description": "Emergency supplies"
  }'
```

### PUT /api/categories/:id (Admin only)
Update category
```bash
curl -X PUT http://localhost:3000/api/categories/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Medical Equipment",
    "code": "MED",
    "description": "Updated description",
    "isActive": true
  }'
```

### DELETE /api/categories/:id (Admin only)
Delete category
```bash
curl -X DELETE http://localhost:3000/api/categories/507f1f77bcf86cd799439011 \
  -H "Cookie: token=YOUR_ADMIN_TOKEN"
```

## Workflow Example

### Step 1: Setup Categories
1. Login as admin
2. Go to `/admin/categories`
3. Create categories:
   - Medical Equipment (MED)
   - Supplies (SUPP)
   - Emergency Items (ER)
   - Dental Supplies (DEN)

### Step 2: Register Items
1. Go to item registration
2. Create Item 1:
   - Category: **Medical Equipment** (from dropdown)
   - Item ID auto-generates: **MED-001-**
3. Create Item 2:
   - Category: **Supplies** (from dropdown)
   - Item ID auto-generates: **SUPP-001-**

### Step 3: Verify
- Item IDs are auto-generated based on category
- Categories are consistent across all items
- No typos or case sensitivity issues

## Best Practices

1. **Use Consistent Names**: Use clear, descriptive category names
2. **Use Short Codes**: 2-4 letter codes for easy identification
3. **Add Descriptions**: Help users understand each category
4. **Deactivate Instead of Delete**: Mark categories as inactive if no longer used
5. **Plan Ahead**: Create all categories before registering items

## Troubleshooting

### Dropdown is Empty
- Check if categories are created in admin panel
- Verify categories are marked as "Active"
- Refresh the page

### Item ID Not Auto-Generating
- Verify category is selected
- Check if category code exists in database
- Try refreshing the page

### Can't Access Category Management
- Verify you're logged in as admin user
- Check if user has `isAdmin: true` in database
- Try accessing `/admin/categories` directly

## Database Management

### View All Categories (including inactive)
```javascript
db.categories.find()
```

### Deactivate a Category
```javascript
db.categories.updateOne(
  { name: "Old Category" },
  { $set: { isActive: false } }
)
```

### Reactivate a Category
```javascript
db.categories.updateOne(
  { name: "Old Category" },
  { $set: { isActive: true } }
)
```

### Delete All Categories
```javascript
db.categories.deleteMany({})
```

## Summary

✅ Admin can manage categories through UI
✅ Categories auto-populate in dropdowns
✅ Item IDs auto-generate based on category
✅ Simplified item registration form
✅ Form validation prevents incomplete entries
✅ No more manual database edits needed
✅ Prevents category name misspellings
✅ Ensures data consistency across system
