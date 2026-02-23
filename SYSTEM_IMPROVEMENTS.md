# System Improvements - Multiple Features

## Overview
This document outlines four major improvements made to the inventory management system.

---

## 1. Low Stock Alarm at 10% Threshold

### Problem
Previously, low stock was triggered at a fixed quantity of 5 items, regardless of the initial quantity registered.

### Solution
Updated the system to automatically capture the registered quantity as the baseline. When items are issued and the quantity drops to 10% of that original registered quantity, the low stock alarm is triggered.

### How It Works

**When Item is Registered:**
- User enters the quantity (e.g., 100 units)
- System automatically sets `initialQuantity = quantity` (100)
- This baseline is never changed, even when items are issued

**When Items are Issued:**
- Quantity decreases (e.g., 100 → 90 → 80 → ... → 10)
- System calculates: `lowStockThreshold = initialQuantity * 0.1` (10% of 100 = 10)
- When `quantity <= lowStockThreshold`, status changes to "Low Stock"

**Status Calculation:**
```typescript
const lowStockThreshold = this.initialQuantity * 0.1; // 10% of initial quantity

if (this.quantity === 0) {
  this.status = 'Out of Stock';
} else if (this.quantity <= lowStockThreshold) {
  this.status = 'Low Stock';
} else {
  this.status = 'In Stock';
}
```

**Examples:**
- Item registered with 100 units → Low stock triggers at 10 units
- Item registered with 50 units → Low stock triggers at 5 units
- Item registered with 1000 units → Low stock triggers at 100 units

### Implementation Details

**No User Input Required:**
- `initialQuantity` is NOT shown in the form
- It's automatically set to the registered quantity
- User only enters "Quantity" field
- System handles the rest automatically

**Automatic Capture:**
- When creating new item: `initialQuantity = quantity`
- When editing item: `initialQuantity` is not modified (preserves original baseline)
- When importing CSV: `initialQuantity = quantity` for each item

### Files Modified
- `lib/models/Item.ts` - Added initialQuantity field and updated status logic
- `app/forms/newItem/page.tsx` - Removed initialQuantity from form, auto-set on submission

---

## 2. New Item Registration Enhancements

### Added Fields

#### Record Date
- **Type:** Date
- **Default:** Today's date (Date.now)
- **Purpose:** Track when the item was recorded in the system
- **Location:** Step 2 (Purchase Details)
- **User Input:** Optional (defaults to today)

#### Manufacturer Info
- **Type:** String
- **Purpose:** Store manufacturer name or details
- **Location:** Step 2 (Purchase Details)
- **User Input:** Optional

### Implementation

**Form Updates (`app/forms/newItem/page.tsx`):**
- Added `recordDate` field with default value of today
- Added `manufacturerInfo` field
- Both fields included in form submission
- Both fields supported in CSV import
- Both fields populated when editing items

**Database Updates:**
- `recordDate` stored in Item model with default Date.now
- `manufacturerInfo` stored as optional string field

### User Experience
- Record date auto-fills with today's date (can be changed)
- Manufacturer info is optional
- Both fields appear in item details view
- Both fields can be edited when modifying items

### Files Modified
- `lib/models/Item.ts` - Added recordDate and manufacturerInfo fields
- `app/forms/newItem/page.tsx` - Added form fields and submission logic

---

## 3. Issued Item Report Status Labels

### Problem
Report showed "Active" status which was confusing for users.

### Solution
Changed status labels to be more intuitive:
- "Active" → "Pending" (item is pending approval/return)
- "Returned" → "Returned" (unchanged)
- "Consumed" → "Consumed" (unchanged)

### Implementation

**Report Updates (`app/reports/issued/page.tsx`):**
- Updated status chip display to map "Active" to "Pending"
- Updated statistics card label from "Active Issues" to "Pending"
- Color coding remains the same (warning for pending)

**Status Mapping:**
```typescript
label={
  item.status === 'Active' ? 'Pending' :
  item.status === 'Returned' ? 'Returned' :
  item.status === 'Consumed' ? 'Consumed' :
  item.status
}
```

### Files Modified
- `app/reports/issued/page.tsx` - Updated status display and labels

---

## 4. Rejection Reason Dialog in Approvals

### Problem
When rejecting items, there was no way to record why the item was rejected.

### Solution
Added a popup dialog that requires approvers to enter a rejection reason before rejecting an item.

### Implementation

**Frontend Changes (`app/approver/dashboard/page.tsx`):**
- Added `rejectDialogOpen` state to control dialog visibility
- Added `rejectionReason` state to store the reason
- Updated reject button to open dialog instead of directly rejecting
- Added new rejection reason dialog with:
  - Text area for entering reason
  - Validation to ensure reason is provided
  - Confirm/Cancel buttons
  - Disabled confirm button until reason is entered

**Backend Changes (`app/api/approvals/[id]/route.ts`):**
- Updated to accept `rejectionReason` in request body
- Added validation to require reason for rejections
- Stores rejection reason in database

**Model Changes (`lib/models/IssuedItem.ts`):**
- Added `rejectionReason` field to store the reason

### User Flow
1. Approver clicks "View" on pending item
2. Approver clicks "Reject" button
3. Rejection reason dialog appears
4. Approver enters reason (required)
5. Approver clicks "Confirm Rejection"
6. Item is rejected with reason stored

### Files Modified
- `app/approver/dashboard/page.tsx` - Added rejection dialog and logic
- `app/api/approvals/[id]/route.ts` - Added reason validation and storage
- `lib/models/IssuedItem.ts` - Added rejectionReason field

---

## Database Schema Changes

### Item Model
```typescript
{
  // ... existing fields ...
  initialQuantity: Number,      // NEW: For 10% threshold calculation
  recordDate: Date,             // NEW: When item was recorded
  manufacturerInfo: String,     // NEW: Manufacturer details
  rejectionReason: String       // NEW: For rejected items
}
```

### IssuedItem Model
```typescript
{
  // ... existing fields ...
  rejectionReason: String       // NEW: Reason for rejection
}
```

---

## Testing Checklist

### Low Stock Alarm
- [ ] Register item with 100 units → Low stock at 10 units
- [ ] Register item with 50 units → Low stock at 5 units
- [ ] Verify status updates correctly as quantity decreases
- [ ] Check that 10% threshold is applied consistently

### New Item Fields
- [ ] Record date defaults to today
- [ ] Can edit record date when creating item
- [ ] Manufacturer info field accepts text
- [ ] Both fields appear in item details
- [ ] CSV import includes both fields
- [ ] Fields populate when editing items

### Status Labels
- [ ] Report shows "Pending" instead of "Active"
- [ ] Statistics card shows "Pending" count
- [ ] Color coding remains correct (warning for pending)
- [ ] Export CSV shows correct status labels

### Rejection Reason
- [ ] Reject button opens dialog
- [ ] Dialog requires reason to be entered
- [ ] Confirm button disabled until reason provided
- [ ] Rejection reason stored in database
- [ ] Reason visible in item details after rejection

---

## User Impact

### Positive Changes
- More accurate low stock alerts based on item quantity
- Better tracking of when items were recorded
- Manufacturer information available for reference
- Clearer status labels in reports
- Accountability for rejections with documented reasons

### No Breaking Changes
- All existing items continue to work
- Existing data is preserved
- New fields are optional (except recordDate which defaults to today)
- Status labels are cosmetic only (internal status unchanged)

---

## Future Enhancements

1. Display rejection reason in approvals page
2. Add rejection reason to approval history/reports
3. Allow filtering by rejection reason
4. Add manufacturer-based analytics
5. Track low stock trends over time
