# Approver System Implementation Summary

## Overview
A complete approver system has been implemented to add approval workflow to the item issuance process. Approvers can review and approve/reject issued items within their assigned location.

## What Was Implemented

### 1. User Model Updates
- Added `isApprover: boolean` field to User model
- Approvers are location-specific (each approver is assigned to one location)
- Approvers can be created during user registration

### 2. IssuedItem Model Updates
- Added `approvalStatus: 'Pending' | 'Approved' | 'Rejected'` field
- Added `approvalDate: Date` field to track when approval was made
- Added `warehouseLocation: string` field to link issued items to locations
- All new issued items default to `approvalStatus: 'Pending'`

### 3. User Registration Updates
- Added "Approver User" checkbox in registration form
- Admins can now create approver users
- Approver users are assigned to a location during registration

### 4. Authentication Updates
- JWT token now includes `isApprover` flag
- Login endpoint returns `isApprover` in user response
- Auth utility updated to include `isApprover` in AuthPayload

### 5. API Endpoints

#### GET /api/approvals/pending
Returns all pending approvals for the logged-in approver's location.
- Only accessible to approvers
- Filters by approver's location
- Returns items with `approvalStatus: 'Pending'`

#### PUT /api/approvals/{itemId}
Approve or reject an issued item.
- Only accessible to approvers
- Can only approve items in approver's location
- Updates `approvalStatus`, `approvedBy`, `approvedByUserId`, `approvalDate`
- Prevents double-approval (rejects if already approved/rejected)

### 6. Approver Dashboard
New page at `/approver/dashboard` with:
- List of pending approvals for approver's location
- Quick view of approval count
- View item details dialog
- Approve/Reject buttons
- Real-time status updates

### 7. Sidebar Updates
- Added "Approver" section in sidebar (visible only to approvers)
- "Approvals" link in approver section
- Conditional rendering based on `isApprover` flag

### 8. Issue Items Page Updates
- View details now shows:
  - Approval Status (Pending/Approved/Rejected)
  - Approval Date
  - Approver Name
- Color-coded approval status chips

## Database Changes

### User Collection
```javascript
{
  username: String,
  email: String,
  password: String,
  isAdmin: Boolean,
  isApprover: Boolean,  // NEW
  location: String,
  createdAt: Date,
  updatedAt: Date
}
```

### IssuedItem Collection
```javascript
{
  itemId: ObjectId,
  itemCode: String,
  itemName: String,
  issuedQuantity: Number,
  issuedTo: String,
  issueDate: Date,
  purpose: String,
  issuedBy: String,
  approvedBy: String,
  approvalStatus: String,  // NEW: 'Pending' | 'Approved' | 'Rejected'
  approvalDate: Date,      // NEW
  warehouseLocation: String,  // NEW
  status: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Files Created/Modified

### New Files
- `app/api/approvals/pending/route.ts` - Get pending approvals
- `app/api/approvals/[id]/route.ts` - Approve/reject items
- `app/approver/dashboard/page.tsx` - Approver dashboard UI
- `APPROVER_SYSTEM.md` - System documentation

### Modified Files
- `lib/models/User.ts` - Added isApprover field
- `lib/models/IssuedItem.ts` - Added approval fields
- `lib/auth.ts` - Updated AuthPayload interface
- `app/api/auth/register/route.ts` - Handle isApprover in registration
- `app/api/auth/login/route.ts` - Include isApprover in JWT token
- `app/api/issues/route.ts` - Set warehouseLocation and approvalStatus on issue creation
- `app/auth/register/page.tsx` - Added approver checkbox
- `app/forms/issueItem/page.tsx` - Show approval status in details
- `app/components/Sidebar.tsx` - Added approver section

## Workflow

### Creating an Approver User
1. Admin goes to User Registration page
2. Fills in user details (username, email, password, location)
3. Checks "Approver User" checkbox
4. Clicks "Register User"
5. User is created with `isApprover: true`

### Issuing an Item
1. User goes to "Issue Items" page
2. Fills in item details
3. Issues the item
4. Item is created with `approvalStatus: 'Pending'`
5. Item appears in approver's pending list

### Approving an Item
1. Approver logs in
2. Clicks "Approvals" in sidebar
3. Views pending approvals for their location
4. Clicks "View" on an item
5. Reviews item details
6. Clicks "Approve" or "Reject"
7. Item status updates immediately

## Security Features

- Approvers can only approve items in their assigned location
- Cannot approve items from other locations
- Cannot approve already approved/rejected items
- All approvals logged with timestamp and approver name
- Admin can view all approvals across all locations

## API Examples

### Get Pending Approvals
```bash
curl -X GET http://localhost:3000/api/approvals/pending \
  -H "Cookie: token=<jwt_token>"
```

### Approve an Item
```bash
curl -X PUT http://localhost:3000/api/approvals/item_id \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<jwt_token>" \
  -d '{"approvalStatus": "Approved"}'
```

### Reject an Item
```bash
curl -X PUT http://localhost:3000/api/approvals/item_id \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<jwt_token>" \
  -d '{"approvalStatus": "Rejected"}'
```

## Testing Checklist

- [ ] Create approver user with admin account
- [ ] Login as approver user
- [ ] Verify "Approvals" link appears in sidebar
- [ ] Issue an item from a regular user account
- [ ] Login as approver and see pending approval
- [ ] View item details and verify all fields
- [ ] Approve the item
- [ ] Verify approval status updates
- [ ] Try to approve already approved item (should fail)
- [ ] Try to approve item from different location (should fail)
- [ ] Reject an item and verify status

## Future Enhancements

- Email notifications when items are issued
- Approval deadline/SLA tracking
- Multi-level approval workflow
- Bulk approval/rejection
- Approval history and audit trail
- Approval comments/notes
- Approval statistics and reports
