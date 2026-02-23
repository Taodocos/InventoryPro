# Approver System Documentation

## Overview
The Approver System allows designated users to approve or reject issued items within their location. This adds a layer of control and accountability to the item issuance process.

## User Roles

### Approver User
- Created during user registration by checking the "Approver User" checkbox
- Associated with a specific location
- Can view pending approvals for items in their location
- Can approve or reject issued items
- Receives notifications when items are issued in their location

### Admin User
- Can create approver users
- Can view all approvals across all locations
- Can override approvals if needed

### Regular User
- Can issue items
- Cannot approve items
- Items they issue require approval from location approver

## How It Works

### 1. Creating an Approver User
1. Go to User Registration page (Admin only)
2. Fill in user details (username, email, password, location)
3. Check "Approver User" checkbox
4. Click "Register User"
5. The user is now an approver for their assigned location

### 2. Issuing an Item
1. Go to "Issue Items" page
2. Fill in item details and issue the item
3. The item is created with status: **Pending** (awaiting approval)
4. Approver for that location receives notification

### 3. Approving/Rejecting Items
1. Approver logs in to their account
2. Views pending approvals for their location
3. Can approve or reject each item
4. Approval status updates to **Approved** or **Rejected**
5. Approval date and approver name are recorded

## Approval Status

Each issued item has an approval status:

| Status | Meaning | Color |
|--------|---------|-------|
| Pending | Awaiting approver review | Yellow/Warning |
| Approved | Approved by location approver | Green/Success |
| Rejected | Rejected by location approver | Red/Error |

## API Endpoints

### Get Pending Approvals
```
GET /api/approvals/pending
```
Returns all pending approvals for the logged-in approver's location.

**Response:**
```json
[
  {
    "_id": "item_id",
    "itemCode": "SUPP-001-",
    "itemName": "Surgical Gloves",
    "issuedQuantity": 100,
    "issuedTo": "John Doe",
    "issueDate": "2026-01-24",
    "warehouseLocation": "Addis Ababa",
    "approvalStatus": "Pending",
    "createdAt": "2026-01-24T10:00:00Z"
  }
]
```

### Approve/Reject Item
```
PUT /api/approvals/{itemId}
```

**Request Body:**
```json
{
  "approvalStatus": "Approved"  // or "Rejected"
}
```

**Response:**
```json
{
  "message": "Item approved successfully",
  "issuedItem": {
    "_id": "item_id",
    "approvalStatus": "Approved",
    "approvedBy": "approver_username",
    "approvalDate": "2026-01-24T10:30:00Z"
  }
}
```

## Database Schema

### User Model
```typescript
{
  username: string;
  email: string;
  password: string;
  isAdmin: boolean;
  isApprover: boolean;  // NEW
  location: string;
}
```

### IssuedItem Model
```typescript
{
  itemId: ObjectId;
  itemCode: string;
  itemName: string;
  issuedQuantity: number;
  issuedTo: string;
  issueDate: Date;
  purpose?: string;
  issuedBy: string;
  approvedBy?: string;
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';  // NEW
  approvalDate?: Date;  // NEW
  warehouseLocation?: string;  // NEW
  status: 'Active' | 'Returned' | 'Consumed';
}
```

## View Details

When viewing issued item details, you can see:
- Item Code & Name
- Quantity Issued
- Issued To & By
- Issue Date
- Approval Status (Pending/Approved/Rejected)
- Approval Date
- Approver Name
- Item Status (Active/Returned/Consumed)
- Purpose

## Workflow Example

1. **Admin creates approver user:**
   - Username: approver_addis
   - Location: Addis Ababa
   - Role: Approver

2. **Regular user issues item:**
   - Issues 100 Surgical Gloves from Addis Ababa warehouse
   - Item created with approvalStatus: "Pending"

3. **Approver reviews:**
   - Logs in as approver_addis
   - Sees pending approval for Surgical Gloves
   - Reviews item details
   - Clicks "Approve"

4. **Item approved:**
   - approvalStatus changes to "Approved"
   - approvedBy: "approver_addis"
   - approvalDate: current timestamp

## Notifications

When an item is issued in an approver's location:
- Approver receives notification (if notification system is implemented)
- Item appears in their pending approvals list
- Approver can review and approve/reject

## Security

- Only approvers can approve items in their location
- Approvers cannot approve items from other locations
- All approvals are logged with timestamp and approver name
- Admin can view all approvals across all locations

## Future Enhancements

- Email notifications when items are issued
- Bulk approval/rejection
- Approval history and audit trail
- Approval deadline/SLA tracking
- Approval workflow with multiple levels
