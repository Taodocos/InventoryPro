# Item ID Auto-Generation Fix

## Problems Fixed

### Problem 1: Item codes not incrementing within same location
Item codes were not incrementing properly. When registering items with category DAB, the first item would get `DAB-001-`, but the next item would also get `DAB-001-` instead of `DAB-002-`.

### Problem 2: Item codes restarting in different locations
When registering items in different locations, the item code would restart from `DAB-001-` instead of continuing the global sequence. For example:
- Addis Ababa: `DAB-001-`, `DAB-002-`, `DAB-003-`
- Dire Dawa: Should be `DAB-004-`, but was getting `DAB-001-` (causing "already exists" error)

## Root Cause
The issue was in how the item ID generation logic handled the sequence number extraction and calculation:

1. **Regex Pattern Issue**: The original regex `/(\d+)$/` was matching the LAST digits in the string, which could be unreliable for the format `DAB-001-`
2. **State Staleness**: The `nextItemNumbers` state was being updated asynchronously after item creation, but the next item registration might use the old cached value
3. **No Real-Time Calculation**: When generating IDs during CSV import or form submission, the function wasn't recalculating based on the current items list
4. **Location-Based Filtering**: The frontend was only fetching items for the user's location, so it couldn't see items in other locations when calculating the next sequence number

## Solution
Updated the item ID generation logic with four key improvements:

### 1. New API Endpoint for Global Item Fetching
Created `/api/items/all` endpoint that returns ALL items regardless of location:

```typescript
// app/api/items/all/route.ts
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const items = await Item.find({}).sort({ createdAt: -1 });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}
```

This ensures ID generation always considers items from ALL locations, not just the user's location.

### 2. Separate Fetch for ID Generation
Added `fetchAllItemsForIdGeneration()` function that fetches all items specifically for calculating next item numbers:

```typescript
const fetchAllItemsForIdGeneration = async () => {
  try {
    const response = await fetch('/api/items/all');
    const data = await response.json();
    calculateNextItemNumbers(data);
  } catch (err) {
    console.error('Failed to fetch all items for ID generation:', err);
  }
};
```

### 3. Fixed Regex Pattern
Changed from `/(\d+)$/` to `/^[A-Z]+-(\d+)-/` to specifically extract the sequence number from the correct position in the format `PREFIX-###-`

### 4. Real-Time Calculation During Operations
Updated all operations to refresh the global item list after changes:
- After item creation: `fetchAllItemsForIdGeneration()`
- After CSV import: `fetchAllItemsForIdGeneration()`
- On component mount: `fetchAllItemsForIdGeneration()`

## Result
- Item codes now increment correctly across all locations: `DAB-001-`, `DAB-002-`, `DAB-003-`, `DAB-004-`, etc.
- Works for both single item registration and CSV bulk import
- Handles multiple categories independently
- Global sequence ensures no duplicate IDs across locations
- Each location sees only their items in the table, but ID generation considers all items globally

## Files Modified
- `app/forms/newItem/page.tsx`
  - Added `fetchAllItemsForIdGeneration()` function
  - Updated `useEffect` to call `fetchAllItemsForIdGeneration()`
  - Updated `calculateNextItemNumbers()` function with improved regex
  - Updated `generateItemId()` function with optional itemsList parameter
  - Updated category selection handler to pass items list
  - Updated `handleImportCSV()` to maintain running items list during import
  - Updated `handleSubmit()` to refresh global items after creation
- `app/api/items/all/route.ts` (NEW)
  - New endpoint that returns all items regardless of location
  - Used exclusively for ID generation calculations
