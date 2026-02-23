# Dashboard - Total Issued Value Card Update

## Summary
Added a new card to the dashboard displaying the total price/value of all issued items.

## Changes Made

### 1. Stats API (`app/api/stats/route.ts`)
- Added calculation for `totalIssuedValue`
- Uses MongoDB aggregation pipeline to:
  - Join IssuedItem with Item collection
  - Calculate total value by multiplying `issuedQuantity` × `unitPrice` for each issued item
  - Sum all values
- Returns `totalIssuedValue` in the response

### 2. Dashboard (`app/dashboard/page.tsx`)
- Updated `Stats` interface to include `totalIssuedValue: number`
- Added new card in the second stats row showing:
  - **Title**: "Total Issued Value"
  - **Value**: Total price of all issued items formatted with currency ($)
  - **Icon**: MoneyIcon
  - **Color**: Red/Error color (#ef4444) to distinguish from other stats
  - **Position**: Third card in the second row (after "Total Issues" and "Pending Approvals")

### 3. Card Details
- Displays with loading skeleton while data is being fetched
- Shows formatted currency value with thousand separators
- Uses consistent styling with other dashboard cards
- Responsive design (full width on mobile, 1/3 width on desktop)

## Files Modified
- `app/api/stats/route.ts`
- `app/dashboard/page.tsx`

## Dashboard Layout
The dashboard now shows:

**First Row (4 cards):**
- Total Items
- Total Quantity
- Inventory Value
- Low Stock Alert

**Second Row (3 cards):**
- Total Issues
- Pending Approvals
- **Total Issued Value** (NEW)

**Additional Sections:**
- Expiry Alerts
- Recent Items
- Recent Issues
