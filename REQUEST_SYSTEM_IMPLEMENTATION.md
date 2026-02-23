# Item Request System Implementation

## Overview
A complete request system allowing departments to request items from inventory. Includes request submission, viewing, and status management with location-based access control.

---

## Features

### 1. Request Item Page (`/forms/requestItem`)
- **Access:** Users with `canRequestItems` permission
- **Functionality:**
  - Submit new item requests
  - View own requests
  - Delete own requests
  - Search requests by item, department, or use
  - Filter by status (Unseen, Seen, Approved, Rejected)
  - View request details

### 2. View Requests Page (`/admin/requests`)
- **Access:** Admin users only
- **Functionality:**
  - View all requests in user's location
  - Filter by status
  - Search requests
  - Approve/Reject requests
  - Mark requests as Seen
  - View detailed request information
  - Statistics dashboard

### 3. Request Status Workflow
- **Unseen:** New request, not yet reviewed
- **Seen:** Request has been viewed
- **Approved:** Request approved by admin
- **Rejected:** Request rejected by admin

---

## Database Schema

### Request Model (`lib/models/Request.ts`)

```typescript
{
  itemId: String,              // Item code (e.g., DAB-001-)
  itemName: String,            // Item name
  category: String,            // Item category
  requestedQuantity: Number,   // How many units requested
  requestedBy: String,         // Username of requester
  requestedByUserId: String,   // User ID of requester
  department: String,          // Department requesting
  numberOfPatients: Number,    // Optional: number of patients
  useFor: String,              // Purpose/use case
  location: String,            // Location of requester
  status: String,              // Unseen | Seen | Approved | Rejected
  notes: String,               // Optional notes
  createdAt: Date,             // Request creation date
  updatedAt: Date              // Last update date
}
```

---

## API Endpoints

### GET /api/requests
**Purpose:** Fetch all requests (filtered by location for non-admins)

**Response:**
```json
[
  {
    "_id": "...",
    "itemId": "DAB-001-",
    "itemName": "Printer Paper",
    "category": "Office",
    "requestedQuantity": 50,
    "requestedBy": "john_doe",
    "department": "Administration",
    "numberOfPatients": null,
    "useFor": "Office supplies",
    "location": "Addis Ababa",
    "status": "Unseen",
    "createdAt": "2024-01-30T10:00:00Z"
  }
]
```

### POST /api/requests
**Purpose:** Create new request

**Request Body:**
```json
{
  "itemId": "DAB-001-",
  "itemName": "Printer Paper",
  "category": "Office",
  "requestedQuantity": 50,
  "department": "Administration",
  "numberOfPatients": null,
  "useFor": "Office supplies"
}
```

**Auto-filled by system:**
- `requestedBy` - Current user's username
- `requestedByUserId` - Current user's ID
- `location` - Current user's location
- `status` - "Unseen"

### PUT /api/requests/{id}
**Purpose:** Update request status

**Request Body:**
```json
{
  "status": "Approved"  // or "Rejected", "Seen", "Unseen"
}
```

### DELETE /api/requests/{id}
**Purpose:** Delete request (only by requester or admin)

---

## User Permissions

### New Permission: `canRequestItems`
- **Default:** false
- **Purpose:** Allow users to submit item requests
- **Assigned via:** User Management page

### Permission Assignment
1. Go to Admin → Users
2. Select user
3. Toggle "Request Items" permission
4. Save changes

---

## User Flow

### Requesting Items

**Step 1: Navigate to Request Item**
- Click "Request Item" in sidebar (if permission granted)
- Or go to `/forms/requestItem`

**Step 2: Fill Request Form**
- Select item from dropdown
- Enter quantity needed
- Enter department name
- Enter number of patients (optional)
- Enter use case/purpose
- Click "Submit Request"

**Step 3: View Request Status**
- Request appears in table with "Unseen" status
- Can view details or delete request
- Status updates when admin reviews

### Reviewing Requests

**Step 1: Navigate to View Requests**
- Admin only: Click "View Requests" in sidebar
- Or go to `/admin/requests`

**Step 2: Review Requests**
- See all requests from your location
- Filter by status or search
- Click menu (⋮) on request

**Step 3: Take Action**
- **View Details:** See full request information
- **Mark as Seen:** Change status to "Seen"
- **Approve:** Change status to "Approved"
- **Reject:** Change status to "Rejected"

---

## Location-Based Access

### Request Submission
- Users can only request items from their location
- System automatically sets location from user profile

### Request Viewing
- Non-admin users: See only requests from their location
- Admin users: See all requests from all locations
- Requests filtered by location in `/api/requests` endpoint

### Request Management
- Only admins can approve/reject requests
- Only requester or admin can delete requests
- Location validation on all operations

---

## Statistics Dashboard

### Request Item Page Stats
- **Total Requests:** Count of all user's requests
- **Unseen:** Count of requests not yet reviewed
- **Approved:** Count of approved requests

### View Requests Page Stats
- **Total Requests:** Count of all requests in location
- **Unseen:** Count of unreviewed requests (warning color)
- **Approved:** Count of approved requests (success color)
- **Rejected:** Count of rejected requests (error color)

---

## Search & Filter

### Request Item Page
- **Search:** Item code, name, department, use case
- **Filter:** By status (Unseen, Seen, Approved, Rejected)

### View Requests Page
- **Search:** Item code, name, department, requester name
- **Filter:** By status (All, Unseen, Seen, Approved, Rejected)

---

## Files Created

### Models
- `lib/models/Request.ts` - Request schema and interface

### API Routes
- `app/api/requests/route.ts` - GET (fetch), POST (create)
- `app/api/requests/[id]/route.ts` - PUT (update), DELETE

### Pages
- `app/forms/requestItem/page.tsx` - Request submission page
- `app/admin/requests/page.tsx` - View/manage requests page

### Updated Files
- `lib/models/User.ts` - Added `canRequestItems` permission
- `app/components/Sidebar.tsx` - Added menu items for requests

---

## Testing Checklist

### Request Submission
- [ ] User with permission can access Request Item page
- [ ] User without permission cannot see menu item
- [ ] Can select item from dropdown
- [ ] Can enter all required fields
- [ ] Request submits successfully
- [ ] Request appears in table with "Unseen" status
- [ ] Can delete own request
- [ ] Can view request details

### Request Management
- [ ] Admin can access View Requests page
- [ ] Can see all requests from location
- [ ] Can search requests
- [ ] Can filter by status
- [ ] Can mark request as "Seen"
- [ ] Can approve request
- [ ] Can reject request
- [ ] Status updates in real-time
- [ ] Statistics update correctly

### Location-Based Access
- [ ] User in Location A only sees requests from Location A
- [ ] User in Location B only sees requests from Location B
- [ ] Admin sees all requests
- [ ] Requests auto-assigned to user's location

### Permissions
- [ ] User without permission cannot see Request Item menu
- [ ] Admin can assign permission to user
- [ ] Permission takes effect immediately
- [ ] User can see menu after permission assigned

---

## Future Enhancements

1. **Request Approval Workflow**
   - Add approval reason/notes
   - Email notifications on status change
   - Request history/audit trail

2. **Advanced Filtering**
   - Filter by date range
   - Filter by requester
   - Filter by department

3. **Reporting**
   - Request statistics by department
   - Request fulfillment rate
   - Most requested items

4. **Integration**
   - Auto-create issue when request approved
   - Link requests to issued items
   - Track request-to-fulfillment time

5. **Notifications**
   - Email when request status changes
   - SMS notifications
   - In-app notifications

---

## Troubleshooting

### Request Item menu not showing
- Check user has `canRequestItems` permission
- Verify permission was saved
- Refresh page or clear browser cache

### Cannot see requests from other locations
- Non-admin users only see their location's requests
- Admin users see all requests
- Check user's location setting

### Request not appearing after submission
- Verify request was submitted successfully
- Check browser console for errors
- Refresh page to see latest requests

### Cannot approve/reject requests
- Only admin users can manage requests
- Check user has admin role
- Verify request is in correct location
