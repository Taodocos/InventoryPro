# Issue Item Location Filter

## Problem
When a user tried to issue an item, they could see and select items from ALL locations, not just their own location. This allowed users to issue items that weren't registered in their warehouse.

## Solution
Updated the `/api/items/available` endpoint to filter items by the user's location (unless they're an admin).

## How It Works

### For Non-Admin Users
- Only see items registered in their location
- Cannot issue items from other locations
- Maintains location-based access control

### For Admin Users
- See all available items from all locations
- Can issue items from any location
- Full system access

## Implementation Details

### Updated Endpoint: `/api/items/available`

**Before:**
```typescript
export async function GET() {
  const items = await Item.find({ quantity: { $gt: 0 } })
    .select('itemId itemName category quantity')
    .sort({ itemName: 1 });
  return NextResponse.json(items);
}
```

**After:**
```typescript
export async function GET(req: NextRequest) {
  const auth = await verifyAuth(req);
  
  let query: any = { quantity: { $gt: 0 } };
  
  // If user is not admin, filter by their location
  if (auth && !auth.isAdmin) {
    query.warehouseName = auth.location;
  }
  
  const items = await Item.find(query)
    .select('itemId itemName category quantity')
    .sort({ itemName: 1 });
  
  return NextResponse.json(items);
}
```

## Changes Made

### Backend (`app/api/items/available/route.ts`)
- Added `NextRequest` parameter to access user authentication
- Added `verifyAuth()` call to get current user info
- Added location-based filtering for non-admin users
- Admins see all available items
- Non-admins only see items in their location

## User Experience

### Before
- User in Addis Ababa could see and issue items from Dire Dawa
- No location restriction on item selection
- Potential for issuing wrong items

### After
- User in Addis Ababa only sees items registered in Addis Ababa
- User in Dire Dawa only sees items registered in Dire Dawa
- Admin can see and issue items from any location
- Proper location-based access control

## Testing

1. **Login as non-admin user in Location A**
   - Navigate to "Issue Items" → "Issue Item" button
   - Click on item selection dropdown
   - Should only see items registered in Location A

2. **Login as non-admin user in Location B**
   - Navigate to "Issue Items" → "Issue Item" button
   - Click on item selection dropdown
   - Should only see items registered in Location B
   - Should NOT see items from Location A

3. **Login as admin user**
   - Navigate to "Issue Items" → "Issue Item" button
   - Click on item selection dropdown
   - Should see items from ALL locations

## Related Features

This change works in conjunction with:
- Location-based item registration (`/api/items/route.ts`)
- Location-based item viewing (inventory page)
- Location-based approval system (approver dashboard)
- User location assignment (during registration)

## Files Modified

- `app/api/items/available/route.ts`
  - Added authentication verification
  - Added location-based filtering
  - Added admin bypass for full access
