# CSV/Excel Import Template for Items

## Overview
You can now import items in bulk using CSV or Excel files instead of registering them one by one.

## CSV Format

The CSV file should have the following columns (header row required):

```
itemname,category,quantity,unitprice,unitmeasurement,description,suppliername,purchasedate,warehousename,expirydate,recordedby
```

## Column Descriptions

| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| itemname | Yes | Name of the item | Surgical Gloves |
| category | Yes | Category name (must exist in database) | OR/Ward/PACU Supplies |
| quantity | Yes | Quantity of items | 100 |
| unitprice | Yes | Price per unit | 5.50 |
| unitmeasurement | No | Unit of measurement (default: Piece) | Box |
| description | No | Item description | Sterile latex gloves |
| suppliername | No | Supplier name | Medical Supplies Inc |
| purchasedate | No | Purchase date (YYYY-MM-DD) | 2026-01-15 |
| warehousename | No | Warehouse/Store name (must exist in database) | Addis Ababa |
| expirydate | No | Expiry date (YYYY-MM-DD) | 2027-01-15 |
| recordedby | No | Person recording the item | John Doe |

## Sample CSV Content

```csv
itemname,category,quantity,unitprice,unitmeasurement,description,suppliername,purchasedate,warehousename,expirydate,recordedby
Surgical Gloves,OR/Ward/PACU Supplies,100,5.50,Box,Sterile latex gloves,Medical Supplies Inc,2026-01-15,Addis Ababa,2027-01-15,Admin
Oxygen Tank,Emergency Items,50,150.00,Piece,Medical oxygen tank,Gas Supplies Ltd,2026-01-10,Cairo,2028-01-10,Admin
Stethoscope,Medical Equipment,25,45.00,Piece,Digital stethoscope,Health Devices,2026-01-12,Dubai,2029-01-12,Admin
```

## Important Notes

1. **Required Fields**: itemname, category, quantity, unitprice must always be provided
2. **Category Names**: Must match exactly with categories in the database:
   - OR/Ward/PACU Supplies
   - Emergency Items
   - Medical Equipment
   - MH Items
   - DAB Items
   - Team Kit
   - Dental Supplies
   - Nutrition Supplies
   - PSP Supplies
   - Speech Supplies

3. **Warehouse Names**: Must match exactly with locations in the database (case-sensitive)
4. **Date Format**: Use YYYY-MM-DD format for dates
5. **Item ID**: Auto-generated based on category code
6. **Total Price**: Auto-calculated from quantity × unitprice

## How to Import

1. Go to "Inventory Items" page
2. Click "Import CSV/Excel" button
3. Select your CSV or Excel file
4. The system will validate and import all valid rows
5. You'll see a success message with count of imported items

## Troubleshooting

- **Rows skipped**: Check that required fields are filled and category/warehouse names match exactly
- **Import fails**: Ensure CSV format is correct and file is not corrupted
- **Duplicate Item IDs**: The system will reject items with duplicate IDs

## Excel File Format

If using Excel (.xlsx or .xls):
- First row must contain headers
- Use the same column names as CSV format
- Save as .xlsx or .xls format
