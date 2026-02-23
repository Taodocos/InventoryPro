# Location-Based Charts Implementation

## Summary
Added comprehensive location-based analytics to the dashboard with three new visualizations showing inventory distribution across all warehouse locations.

## New Files Created

### 1. `app/api/stats/by-location/route.ts`
API endpoint that aggregates inventory data by location:
- **Endpoint**: `GET /api/stats/by-location`
- **Returns**: Array of location statistics with:
  - `_id`: Location name
  - `totalItems`: Total number of items at location
  - `totalQuantity`: Total quantity of all items
  - `totalValue`: Total inventory value
  - `inStock`: Count of items in stock
  - `lowStock`: Count of low stock items
  - `outOfStock`: Count of out of stock items

## Dashboard Updates

### File: `app/dashboard/page.tsx`

#### 1. New Imports
- Added `BarChart`, `Bar`, `XAxis`, `YAxis`, `CartesianGrid` from recharts for bar chart visualization

#### 2. New Interface
```typescript
interface LocationStats {
  _id: string;
  totalItems: number;
  totalQuantity: number;
  totalValue: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
}
```

#### 3. New State Variable
- `locationStats`: Stores location-based statistics

#### 4. Updated `fetchData()` Function
- Added fetch call to `/api/stats/by-location`
- Populates `locationStats` state with location data

#### 5. Three New Chart Sections

**Chart 1: Inventory by Location (Bar Chart)**
- Shows total items, in stock, low stock, and out of stock counts per location
- Horizontal bar chart for easy comparison
- Color coded: Blue (Total), Green (In Stock), Amber (Low Stock), Red (Out of Stock)
- Responsive width (full width on all screens)

**Chart 2: Total Value by Location (Pie Chart)**
- Displays inventory value distribution across locations
- Shows monetary value per location
- Color coded with 6 different colors for up to 6 locations
- Includes formatted value labels

**Chart 3: Total Quantity by Location (Pie Chart)**
- Shows unit quantity distribution across locations
- Displays total units per location
- Color coded with 6 different colors
- Includes quantity labels

#### 6. Chart Features
- **Responsive Design**: Charts adapt to screen size
- **Loading States**: Skeleton loaders while data fetches
- **Empty States**: Graceful handling when no data exists
- **Tooltips**: Hover information for all charts
- **Legends**: Clear identification of data series
- **Color Coding**: Consistent with Material-UI theme

## Data Flow

1. Dashboard loads and calls `fetchData()`
2. `fetchData()` fetches from `/api/stats/by-location`
3. Location data aggregated by MongoDB aggregation pipeline
4. Charts render with location statistics
5. Charts update on refresh

## Chart Placement

Dashboard layout (top to bottom):
1. Welcome header with refresh button
2. Main stats cards (Total Items, Quantity, Value, Low Stock Alert)
3. Summary cards (Total Issues, Pending Approvals, Total Issued Value)
4. Item Status Distribution (Pie)
5. Approval Status Distribution (Pie)
6. **Inventory by Location (Bar Chart)** ← NEW
7. **Total Value by Location (Pie Chart)** ← NEW
8. **Total Quantity by Location (Pie Chart)** ← NEW
9. Action cards (Register New Item, Issue Item)
10. Expiring items section
11. Recent items and issues tables

## Technical Details

### API Aggregation Pipeline
```javascript
Item.aggregate([
  {
    $group: {
      _id: '$warehouseName',
      totalItems: { $sum: 1 },
      totalQuantity: { $sum: '$quantity' },
      totalValue: { $sum: '$totalPrice' },
      inStock: { $sum: { $cond: [{ $eq: ['$status', 'In Stock'] }, 1, 0] } },
      lowStock: { $sum: { $cond: [{ $eq: ['$status', 'Low Stock'] }, 1, 0] } },
      outOfStock: { $sum: { $cond: [{ $eq: ['$status', 'Out of Stock'] }, 1, 0] } }
    }
  },
  { $sort: { _id: 1 } }
])
```

### Color Palette
- Blue: #3b82f6 (Primary)
- Green: #10b981 (In Stock/Approved)
- Amber: #f59e0b (Low Stock/Pending)
- Red: #ef4444 (Out of Stock/Rejected)
- Purple: #8b5cf6 (Secondary)
- Pink: #ec4899 (Tertiary)

## User Experience
- Admins see all location data
- Non-admins see only their location data (filtered by API)
- Charts update in real-time with refresh button
- Smooth loading transitions
- Clear visual hierarchy with color coding
- Easy comparison of inventory across locations
