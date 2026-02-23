# Batch Number and Item Price Update

## Summary
Added batch number field to item registration and item price (unit price) to issue item tracking and reports.

## Changes Made

### 1. Item Model (`lib/models/Item.ts`)
- Added `batchNumber?: string` field to IItem interface
- Added `batchNumber` field to ItemSchema

### 2. IssuedItem Model (`lib/models/IssuedItem.ts`)
- Added `unitPrice?: number` field to IIssuedItem interface
- Added `unitPrice` field to IssuedItemSchema

### 3. Register Item Form (`app/forms/newItem/page.tsx`)
- Added `batchNumber` to initialFormData
- Added `batchNumber` field to Item interface
- Added batch number input field in Step 2 (after Manufacturer Info)
- Field label: "Batch Number"
- Helper text: "Batch or lot number"

### 4. Issue Item Form (`app/forms/issueItem/page.tsx`)
- Updated AvailableItem interface to include `unitPrice: number`
- Updated IssuedItem interface to include `unitPrice?: number` and `warehouseLocation?: string`
- Updated form submission to capture and send `unitPrice` from selected item
- Added Unit Price column to the issued items table (right-aligned, currency formatted)
- Added Unit Price display in View Details dialog
- Updated table colspan from 8 to 9 columns

### 5. Issued Items Report (`app/reports/issued/page.tsx`)
- Updated IssuedItem interface to include `unitPrice?: number`
- Added Unit Price column to report table (between Quantity and Issue Date)
- Updated table header colspan from 10 to 11 columns
- Updated CSV export to include Unit Price
- Unit Price displayed with currency formatting ($) and thousand separators

## Files Modified
- `lib/models/Item.ts`
- `lib/models/IssuedItem.ts`
- `app/forms/newItem/page.tsx`
- `app/forms/issueItem/page.tsx`
- `app/reports/issued/page.tsx`

## Features

### Batch Number (Register Item)
- Optional field for tracking batch/lot numbers
- Useful for traceability and quality control
- Stored with each registered item

### Unit Price (Issue Item)
- Automatically captured from the item's unit price when issuing
- Displayed in:
  - Issue Item grid table
  - View Details dialog
  - Issued Items Report
- Formatted with currency symbol ($) and thousand separators
- Helps track the value of issued items

## Display Format
- Unit Price: `$1,234.56` (currency formatted with thousand separators)
- Batch Number: Text field (any alphanumeric value)
