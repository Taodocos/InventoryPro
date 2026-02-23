# TASK 17: Issue Item Status Display Update - COMPLETED

## Summary
Updated the Issue Item page to display approval status (Pending/Approved/Rejected) instead of item status (Active/Returned/Consumed) in the grid and stats cards.

## Changes Made

### 1. Stats Cards Updated
- Changed from counting by item status to counting by approval status
- **Old**: Active Issues, Returned items
- **New**: Pending Approvals, Approved items
- Stats now reflect approval workflow instead of item lifecycle

### 2. Table Status Column Updated
- Changed from displaying `item.status` to `item.approvalStatus`
- Status chips now show: Pending (warning), Approved (success), Rejected (error)
- Defaults to "Pending" if approval status is not set

### 3. Actions Menu Updated
- Changed menu options from "Mark as Returned/Consumed/Active" to "Approve/Reject/Mark as Pending"
- Menu items now work with `approvalStatus` field
- Disabled states updated to check `approvalStatus` instead of `status`

### 4. View Details Dialog Updated
- Removed redundant "Status" field display
- Approval Status now displayed prominently with proper color coding
- Shows Approval Date when available

### 5. API Integration
- `handleStatusChange` function updated to send `approvalStatus` instead of `status`
- API endpoint `/api/issues/[id]` already supports updating any field including `approvalStatus`

## Files Modified
- `app/forms/issueItem/page.tsx`

## Request Location Filtering
- Verified that `/api/requests/route.ts` already correctly filters requests by requester's location
- Non-admin users see requests from their location (requests made by users in their location)
- Admin users see all requests
- No changes needed - already implemented correctly

## Testing Notes
- Issue items now display approval status in the grid
- Stats cards show pending approvals and approved items
- Menu actions allow approving/rejecting items
- View Details dialog shows approval status clearly
