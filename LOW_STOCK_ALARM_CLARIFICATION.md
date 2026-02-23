# Low Stock Alarm - Clarification & Implementation

## User Requirement
- No `initialQuantity` field in the registration form
- When an item is registered, the quantity entered becomes the baseline
- When items are issued and quantity drops to 10% of the registered quantity, low stock alarm shows

## Implementation

### What Changed

**Removed from Form:**
- ❌ `initialQuantity` input field (no longer visible to users)

**Automatic Behavior:**
- ✅ When item is registered with quantity = 100, system automatically sets initialQuantity = 100
- ✅ When items are issued, quantity decreases (100 → 90 → 80 → ... → 10)
- ✅ When quantity ≤ 10% of initialQuantity (10 in this case), status = "Low Stock"

### User Flow

**Step 1: Register Item**
```
User enters:
- Item Name: "Printer Paper"
- Quantity: 100 (this becomes the baseline)
- Other details...

System automatically sets:
- initialQuantity = 100 (captured at registration)
```

**Step 2: Issue Items**
```
First issue: 10 units → Quantity = 90 (Status: In Stock)
Second issue: 20 units → Quantity = 70 (Status: In Stock)
Third issue: 30 units → Quantity = 40 (Status: In Stock)
Fourth issue: 35 units → Quantity = 5 (Status: Low Stock ⚠️)
  - Because 5 ≤ 10% of 100 (which is 10)
```

### Database Schema

```typescript
Item {
  quantity: 5,              // Current quantity (changes as items are issued)
  initialQuantity: 100,     // Original registered quantity (never changes)
  status: "Low Stock"       // Calculated based on: quantity ≤ (initialQuantity * 0.1)
}
```

### Code Implementation

**Model (`lib/models/Item.ts`):**
```typescript
// Pre-save hook calculates status
ItemSchema.pre('save', function(next) {
  const lowStockThreshold = this.initialQuantity * 0.1; // 10% of initial
  
  if (this.quantity === 0) {
    this.status = 'Out of Stock';
  } else if (this.quantity <= lowStockThreshold) {
    this.status = 'Low Stock';
  } else {
    this.status = 'In Stock';
  }
  next();
});
```

**Form (`app/forms/newItem/page.tsx`):**
```typescript
// When creating new item
const response = await fetch('/api/items', {
  method: 'POST',
  body: JSON.stringify({
    ...formData,
    quantity: Number(formData.quantity),
    initialQuantity: Number(formData.quantity),  // Auto-set to quantity
    // ... other fields
  })
});

// When editing item
const response = await fetch(`/api/items/${id}`, {
  method: 'PUT',
  body: JSON.stringify({
    ...formData,
    quantity: Number(formData.quantity),
    initialQuantity: undefined,  // Don't modify original baseline
    // ... other fields
  })
});
```

### Examples

**Example 1: Small Quantity Item**
```
Register: 50 units
Low stock threshold: 50 * 0.1 = 5 units
Alert triggers when: quantity ≤ 5
```

**Example 2: Large Quantity Item**
```
Register: 1000 units
Low stock threshold: 1000 * 0.1 = 100 units
Alert triggers when: quantity ≤ 100
```

**Example 3: Very Small Quantity Item**
```
Register: 10 units
Low stock threshold: 10 * 0.1 = 1 unit
Alert triggers when: quantity ≤ 1
```

### CSV Import

When importing items via CSV:
```csv
itemname,category,quantity,unitprice,warehousename
Printer Paper,OFF,100,50,Addis Ababa
Pen Set,OFF,50,10,Addis Ababa
```

System automatically sets:
- Item 1: initialQuantity = 100
- Item 2: initialQuantity = 50

### Testing

1. **Register item with 100 units**
   - Verify initialQuantity = 100 in database
   - Verify status = "In Stock"

2. **Issue 85 units**
   - Quantity becomes 15
   - Verify status = "In Stock" (15 > 10)

3. **Issue 6 more units**
   - Quantity becomes 9
   - Verify status = "Low Stock" (9 ≤ 10)

4. **Issue 9 more units**
   - Quantity becomes 0
   - Verify status = "Out of Stock"

### Benefits

✅ **Automatic:** No manual input needed for initialQuantity
✅ **Flexible:** Works with any registered quantity
✅ **Scalable:** 10% threshold adapts to item size
✅ **Simple:** Users only enter quantity once
✅ **Accurate:** Baseline never changes after registration

### Files Modified

- `lib/models/Item.ts` - Added initialQuantity field, updated status calculation
- `app/forms/newItem/page.tsx` - Removed initialQuantity input, auto-set on submission
