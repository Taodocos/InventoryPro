# Reports Update - Issued and Registered Items

## Summary
Updated both Issued Items Report and Registered Items Report to:
1. Fix status consistency (use approval status instead of item status)
2. Display all relevant fields
3. Add parameterized sorting and filtering

## Changes Made

### Issued Items Report (`app/reports/issued/page.tsx`)

**Status Fix:**
- Changed from displaying `item.status` (Active/Returned/Consumed) to `item.approvalStatus` (Pending/Approved/Rejected)
- Now matches the Issue Item grid display
- Stats cards updated to show Pending Approvals and Approved items

**New Fields Displayed:**
- Item Code
- Item Name
- Issued To
- Quantity
- Issue Date
- Issued By
- **Approved By** (new)
- **Status** (now shows approval status)
- **Approval Date** (new)
- **Location** (new)

**Sorting Options:**
- Issue Date (default)
- Item Code
- Item Name
- Issued To
- Issued By
- Status

**Filtering Options:**
- Search across: item name, code, issued to, issued by, approved by
- Filter by Status: All, Pending, Approved, Rejected

**CSV Export:**
- Updated to include all new fields

---

### Registered Items Report (`app/reports/registered/page.tsx`)

**New Fields Displayed:**
- Item Code
- Item Name
- Category
- Quantity
- Unit Price
- Total Value
- **Location** (warehouse name)
- **Recorded By** (new)
- **Supplier** (new)
- **Record Date** (new)
- Status

**Sorting Options:**
- Item Code (default)
- Item Name
- Category
- Quantity
- Total Value
- Location

**Filtering Options:**
- Search across: item name, code, category, location, recorded by
- Filter by Status: All, In Stock, Low Stock, Out of Stock

**CSV Export:**
- Updated to include all new fields

---

## Key Improvements

1. **Status Consistency**: Issued items report now shows approval status (Pending/Approved/Rejected) matching the Issue Item grid
2. **Comprehensive Data**: Both reports now display all relevant fields for complete visibility
3. **Flexible Sorting**: Users can sort by any column (Item Code, Name, Date, Status, Location, etc.)
4. **Advanced Filtering**: Users can filter by status and search across multiple fields
5. **Better CSV Export**: Exported files now include all displayed fields

## Files Modified
- `app/reports/issued/page.tsx`
- `app/reports/registered/page.tsx`
