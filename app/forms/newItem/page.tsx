'use client';

import Sidebar from '../../components/Sidebar';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Chip,
  TextField,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stepper,
  Step,
  StepLabel,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Menu,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Inventory as InventoryIcon,
  ShoppingCart as PurchaseIcon,
  Warehouse as WarehouseIcon,
  CheckCircle as CheckIcon,
  Clear as ClearIcon,
  TrendingUp as PriceIcon,
  Category as CategoryIcon,
  Description as DescIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  MoreVert as MoreVertIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';

interface Item {
  _id: string;
  itemId: string;
  itemName: string;
  category: string;
  description?: string;
  quantity: number;
  initialQuantity?: number;
  unitMeasurement: string;
  unitPrice: number;
  totalPrice: number;
  recordedBy: string;
  supplierName?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  totalPurchaseCost?: number;
  warehouseName?: string;
  locationCode?: string;
  expiryDate?: string;
  recordDate?: string;
  manufacturerInfo?: string;
  batchNumber?: string;
  status: string;
  createdAt: string;
}

interface Location {
  _id: string;
  name: string;
  code: string;
  description?: string;
}

interface Category {
  _id: string;
  name: string;
  code: string;
  description?: string;
}

const initialFormData = {
  itemId: '',
  itemName: '',
  category: '',
  description: '',
  quantity: '',
  unitMeasurement: 'Piece',
  unitPrice: '',
  totalPrice: '',
  recordedBy: '',
  supplierName: '',
  purchaseDate: '',
  purchasePrice: '',
  warehouseName: '',
  locationCode: '',
  expiryDate: '',
  recordDate: new Date().toISOString().split('T')[0],
  manufacturerInfo: '',
  batchNumber: '',
};

const unitMeasurements = [
  'Piece', 'Box', 'Pack', 'Set', 'Pair',
  'Meter', 'Centimeter', 'Foot', 'Inch', 'Roll',
  'Kilogram', 'Gram', 'Pound', 'Ounce',
  'Liter', 'Milliliter', 'Gallon',
  'Dozen', 'Ream', 'Carton', 'Bottle', 'Tube'
];

// categoryPrefixes will be built dynamically from database categories

export default function RegisterItemPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState(initialFormData);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuItem, setMenuItem] = useState<Item | null>(null);
  const [nextItemNumbers, setNextItemNumbers] = useState<{ [key: string]: number }>({});
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryPrefixes, setCategoryPrefixes] = useState<{ [key: string]: string }>({});
  const [searchTerm, setSearchTerm] = useState('');

  const steps = ['Item Information', 'Purchase Details', 'Storage & Location'];

  // Filter items based on search term
  const filteredItems = items.filter(item =>
    item.itemId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.warehouseName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const totalItems = filteredItems.length;
  const totalQuantity = filteredItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = filteredItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const lowStockCount = filteredItems.filter((item) => item.status === 'Low Stock').length;

  useEffect(() => {
    fetchLocations();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchItems();
    fetchAllItemsForIdGeneration();
  }, [categories]);

  const fetchAllItemsForIdGeneration = async () => {
    try {
      const response = await fetch('/api/items/all');
      const data = await response.json();
      setAllItems(data);
      calculateNextItemNumbers(data);
    } catch (err) {
      console.error('Failed to fetch all items for ID generation:', err);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations');
      const data = await response.json();
      setLocations(data);
    } catch (err) {
      console.error('Failed to fetch locations:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
      
      // Build categoryPrefixes map from database categories
      const prefixes: { [key: string]: string } = {};
      data.forEach((cat: Category) => {
        prefixes[cat.name] = cat.code;
      });
      setCategoryPrefixes(prefixes);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/items');
      const data = await response.json();
      setItems(data);
    } catch (err) {
      console.error('Failed to fetch items:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateNextItemNumbers = (itemsList: Item[]) => {
    const numbers: { [key: string]: number } = {};
    
    categories.forEach((category) => {
      const itemsInCategory = itemsList.filter((item) => item.category === category.name);
      
      if (itemsInCategory.length === 0) {
        numbers[category.name] = 1;
      } else {
        // Extract the number from the middle of the itemId (between first and second dash)
        const maxNumber = Math.max(
          ...itemsInCategory.map((item) => {
            // For format like "DAB-001-", extract 001
            const match = item.itemId.match(/^[A-Z]+-(\d+)-/);
            return match ? parseInt(match[1]) : 0;
          })
        );
        numbers[category.name] = maxNumber + 1;
      }
    });
    
    setNextItemNumbers(numbers);
  };

  const generateItemId = (category: string, itemsList?: Item[]): string => {
    const prefix = categoryPrefixes[category];
    if (!prefix) return '';
    
    // If itemsList is provided, calculate the next number from it
    // Otherwise use the state (for real-time updates)
    let nextNumber = 1;
    
    if (itemsList) {
      const itemsInCategory = itemsList.filter((item) => item.category === category);
      if (itemsInCategory.length > 0) {
        const maxNumber = Math.max(
          ...itemsInCategory.map((item) => {
            const match = item.itemId.match(/^[A-Z]+-(\d+)-/);
            return match ? parseInt(match[1]) : 0;
          })
        );
        nextNumber = maxNumber + 1;
      }
    } else {
      nextNumber = nextItemNumbers[category] || 1;
    }
    
    const paddedNumber = String(nextNumber).padStart(3, '0');
    return `${prefix}-${paddedNumber}-`;
  };

  const isStep1Valid = (): boolean => {
    return !!(
      formData.itemId &&
      formData.itemName &&
      formData.category &&
      formData.quantity &&
      formData.unitPrice &&
      formData.recordedBy
    );
  };

  const handleOpenDialog = (item?: Item) => {
    if (item) {
      setIsEditing(true);
      setSelectedItem(item);
      setFormData({
        itemId: item.itemId,
        itemName: item.itemName,
        category: item.category,
        description: item.description || '',
        quantity: item.quantity.toString(),
        unitMeasurement: item.unitMeasurement || 'Piece',
        unitPrice: item.unitPrice.toString(),
        totalPrice: item.totalPrice.toString(),
        recordedBy: item.recordedBy,
        supplierName: item.supplierName || '',
        purchaseDate: item.purchaseDate ? item.purchaseDate.split('T')[0] : '',
        purchasePrice: item.purchasePrice?.toString() || '',
        warehouseName: item.warehouseName || '',
        locationCode: item.locationCode || '',
        expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : '',
        recordDate: item.recordDate ? item.recordDate.split('T')[0] : new Date().toISOString().split('T')[0],
        manufacturerInfo: item.manufacturerInfo || '',
      });
    } else {
      setIsEditing(false);
      setSelectedItem(null);
      setFormData(initialFormData);
    }
    setActiveStep(0);
    setError('');
    setSuccess('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormData(initialFormData);
    setActiveStep(0);
    setError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'quantity' || name === 'unitPrice') {
      const qty = name === 'quantity' ? value : formData.quantity;
      const price = name === 'unitPrice' ? value : formData.unitPrice;
      if (qty && price) {
        const total = (parseFloat(qty) * parseFloat(price)).toFixed(2);
        setFormData((prev) => ({ ...prev, totalPrice: total }));
      }
    }
  };

  const handleSubmit = async () => {
    setSubmitLoading(true);
    setError('');

    try {
      const url = isEditing ? `/api/items/${selectedItem?._id}` : '/api/items';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity: Number(formData.quantity),
          initialQuantity: isEditing ? undefined : Number(formData.quantity),
          unitPrice: Number(formData.unitPrice), 
          totalPrice: Number(formData.totalPrice),
          purchasePrice: formData.purchasePrice ? Number(formData.purchasePrice) : undefined,
          purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate) : undefined,
          recordDate: formData.recordDate ? new Date(formData.recordDate) : new Date(),
          expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setSuccess(isEditing ? 'Item updated successfully!' : 'Item registered successfully!');
      fetchItems();
      fetchAllItemsForIdGeneration();
      setTimeout(() => {
        handleCloseDialog();
        setSuccess('');
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const itemsToImport = [];
        let currentItems = allItems; // Use global items list
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const values = lines[i].split(',').map(v => v.trim());
          const item: any = {};
          
          headers.forEach((header, index) => {
            item[header] = values[index];
          });

          // Validate required fields
          if (!item.itemname || !item.category || !item.quantity || !item.unitprice) {
            console.warn(`Skipping row ${i + 1}: Missing required fields`);
            continue;
          }

          // Generate item ID using global items list for accurate sequencing
          const itemId = generateItemId(item.category, currentItems);
          
          const newItem = {
            itemId,
            itemName: item.itemname,
            category: item.category,
            description: item.description || '',
            quantity: Number(item.quantity),
            initialQuantity: Number(item.quantity),
            unitMeasurement: item.unitmeasurement || 'Piece',
            unitPrice: Number(item.unitprice),
            totalPrice: Number(item.quantity) * Number(item.unitprice),
            recordedBy: item.recordedby || 'Import',
            supplierName: item.suppliername || '',
            purchaseDate: item.purchasedate ? new Date(item.purchasedate) : undefined,
            recordDate: new Date(),
            manufacturerInfo: item.manufacturerinfo || '',
            warehouseName: item.warehousename || '',
            expiryDate: item.expirydate ? new Date(item.expirydate) : undefined,
          };
          
          itemsToImport.push(newItem);
          
          // Add to currentItems for next iteration to get correct sequence
          currentItems = [...currentItems, { ...newItem, _id: '', createdAt: new Date().toISOString(), recordDate: new Date().toISOString().split('T')[0], status: 'In Stock' } as Item];
        }

        // Import items
        let successCount = 0;
        let failCount = 0;

        for (const item of itemsToImport) {
          try {
            const response = await fetch('/api/items', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item),
            });

            if (response.ok) {
              successCount++;
            } else {
              failCount++;
            }
          } catch (err) {
            failCount++;
          }
        }

        setSuccess(`Import completed: ${successCount} items imported, ${failCount} failed`);
        fetchItems();
        fetchAllItemsForIdGeneration();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err: any) {
        setError(`Import failed: ${err.message}`);
        setTimeout(() => setError(''), 3000);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      const response = await fetch(`/api/items/${selectedItem._id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      fetchItems();
      setDeleteDialogOpen(false);
      setSelectedItem(null);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, item: Item) => {
    setAnchorEl(event.currentTarget);
    setMenuItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuItem(null);
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField 
                label="Item ID / Code" 
                name="itemId" 
                value={formData.itemId} 
                fullWidth 
                required 
                disabled
                helperText="Auto-generated based on category"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <InventoryIcon sx={{ color: '#3b82f6' }} />
                      </InputAdornment>
                    ),
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField 
                label="Item Name" 
                name="itemName" 
                value={formData.itemName} 
                onChange={handleChange} 
                fullWidth 
                required 
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select 
                  name="category" 
                  value={formData.category} 
                  onChange={(e) => {
                    const newCategory = e.target.value;
                    const newItemId = generateItemId(newCategory, allItems);
                    setFormData((prev) => ({ 
                      ...prev, 
                      category: newCategory,
                      itemId: newItemId
                    }));
                  }} 
                  label="Category"
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat._id} value={cat.name}>
                      {cat.name} ({cat.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField label="Description" name="description" value={formData.description} onChange={handleChange} fullWidth multiline rows={2} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField 
                label="Quantity" 
                name="quantity" 
                type="number" 
                value={formData.quantity} 
                onChange={handleChange} 
                fullWidth 
                required 
                slotProps={{
                  input: {
                    inputProps: { min: 0 }
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Unit</InputLabel>
                <Select name="unitMeasurement" value={formData.unitMeasurement} onChange={(e) => setFormData((prev) => ({ ...prev, unitMeasurement: e.target.value }))} label="Unit">
                  {unitMeasurements.map((unit) => (<MenuItem key={unit} value={unit}>{unit}</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField 
                label="Unit Price" 
                name="unitPrice" 
                type="number" 
                value={formData.unitPrice} 
                onChange={handleChange} 
                fullWidth 
                required
                slotProps={{
                  input: {
                    inputProps: { min: 0, step: 0.01 },
                    startAdornment: <InputAdornment position="start"><MoneyIcon sx={{ color: '#f59e0b' }} /></InputAdornment>
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField 
                label="Total Price" 
                name="totalPrice" 
                value={formData.totalPrice} 
                fullWidth 
                slotProps={{
                  input: {
                    readOnly: true
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField 
                label="Recorded By" 
                name="recordedBy" 
                value={formData.recordedBy} 
                onChange={handleChange} 
                fullWidth 
                required
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#3b82f6' }} /></InputAdornment>
                  }
                }}
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField 
                label="Supplier Name" 
                name="supplierName" 
                value={formData.supplierName} 
                onChange={handleChange} 
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start"><PurchaseIcon sx={{ color: '#3b82f6' }} /></InputAdornment>
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField 
                label="Manufacturer Info" 
                name="manufacturerInfo" 
                value={formData.manufacturerInfo} 
                onChange={handleChange} 
                fullWidth
                helperText="Manufacturer name or details"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField 
                label="Batch Number" 
                name="batchNumber" 
                value={formData.batchNumber} 
                onChange={handleChange} 
                fullWidth
                helperText="Batch or lot number"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField 
                label="Purchase Date" 
                name="purchaseDate" 
                type="date" 
                value={formData.purchaseDate} 
                onChange={handleChange} 
                fullWidth 
                slotProps={{
                  inputLabel: { shrink: true }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField 
                label="Record Date" 
                name="recordDate" 
                type="date" 
                value={formData.recordDate} 
                onChange={handleChange} 
                fullWidth 
                required
                slotProps={{
                  inputLabel: { shrink: true }
                }}
                helperText="Date item was recorded in system"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField 
                label="Expiry Date (Optional)" 
                name="expiryDate" 
                type="date" 
                value={formData.expiryDate} 
                onChange={handleChange} 
                fullWidth 
                slotProps={{
                  inputLabel: { shrink: true }
                }}
                helperText="Leave empty if item doesn't expire" 
              />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Store / Warehouse Name</InputLabel>
                <Select
                  name="warehouseName"
                  value={formData.warehouseName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, warehouseName: e.target.value }))}
                  label="Store / Warehouse Name"
                >
                  {locations.map((loc) => (
                    <MenuItem key={loc._id} value={loc.name}>
                      {loc.name} ({loc.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Sidebar />
      <Box sx={{ flexGrow: 1, ml: { xs: 0, md: '260px' }, minHeight: '100vh', bgcolor: '#f8fafc' }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1e293b' }}>Inventory Items</Typography>
              <Typography variant="body1" color="#64748b">Manage your registered inventory items</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}
                sx={{ bgcolor: '#001488', '&:hover': { bgcolor: '#000d5c' }, borderRadius: 2, px: 3, py: 1.5 }}>
                Add New Item
              </Button>
              <Button variant="outlined" component="label" sx={{ borderRadius: 2, px: 3, py: 1.5 }}>
                Import CSV/Excel
                <input hidden accept=".csv,.xlsx,.xls" type="file" onChange={handleImportCSV} />
              </Button>
            </Box>
          </Box>

          {/* Search Bar */}
          <Box sx={{ mb: 4 }}>
            <TextField
              fullWidth
              placeholder="Search by Item Code, Name, Category, or Warehouse..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box sx={{ color: '#64748b' }}>🔍</Box>
                    </InputAdornment>
                  ),
                }
              }}
              sx={{
                bgcolor: 'white',
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  borderColor: '#e2e8f0',
                }
              }}
            />
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ borderRadius: 3, bgcolor: '#001488', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>Total Items</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{totalItems}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ borderRadius: 3, bgcolor: '#1a3a9e', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>Total Quantity</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{totalQuantity}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ borderRadius: 3, bgcolor: '#0026d4', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>Total Value</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>${totalValue.toLocaleString()}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ borderRadius: 3, bgcolor: '#4f6cff', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>Low Stock</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{lowStockCount}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Items Table */}
          <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Item Code</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Item Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Quantity</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Unit Price</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Expiry</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={8} align="center">Loading...</TableCell></TableRow>
                  ) : filteredItems.length === 0 ? (
                    <TableRow><TableCell colSpan={8} align="center">No items found. Try adjusting your search.</TableCell></TableRow>
                  ) : (
                    filteredItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item) => (
                      <TableRow key={item._id} hover>
                        <TableCell><Typography sx={{ fontWeight: 'bold', color: '#001488' }}>{item.itemId}</Typography></TableCell>
                        <TableCell>{item.itemName}</TableCell>
                        <TableCell><Chip label={item.category} size="small" /></TableCell>
                        <TableCell align="right"><Typography sx={{ fontWeight: 'bold' }}>{item.quantity} {item.unitMeasurement}</Typography></TableCell>
                        <TableCell align="right">${item.unitPrice.toLocaleString()}</TableCell>
                        <TableCell>{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>
                          <Chip label={item.status} size="small" color={item.status === 'In Stock' ? 'success' : item.status === 'Low Stock' ? 'warning' : 'error'} />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton size="small" onClick={(e) => handleMenuOpen(e, item)}><MoreVertIcon /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination component="div" count={filteredItems.length} page={page} onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} />
          </Paper>

          {/* Actions Menu */}
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={() => { setSelectedItem(menuItem); setViewDialogOpen(true); handleMenuClose(); }}>
              <ViewIcon sx={{ mr: 1 }} /> View Details
            </MenuItem>
            <MenuItem onClick={() => { handleOpenDialog(menuItem!); handleMenuClose(); }}>
              <EditIcon sx={{ mr: 1 }} /> Edit
            </MenuItem>
            <MenuItem onClick={() => { setSelectedItem(menuItem); setDeleteDialogOpen(true); handleMenuClose(); }} sx={{ color: 'error.main' }}>
              <DeleteIcon sx={{ mr: 1 }} /> Delete
            </MenuItem>
          </Menu>

          {/* Add/Edit Dialog */}
          <Dialog 
            open={dialogOpen} 
            onClose={handleCloseDialog} 
            maxWidth="md" 
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 20, 136, 0.25)',
              }
            }}
          >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #001488 0%, #1a3a9e 100%)', color: 'white', borderRadius: '24px 24px 0 0' }}>
              {isEditing ? 'Edit Item' : 'Register New Item'}
              <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
              <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (<Step key={label}><StepLabel>{label}</StepLabel></Step>))}
              </Stepper>
              {getStepContent(activeStep)}
            </DialogContent>
            <DialogActions sx={{ p: 3, borderTop: '1px solid #e5e7eb' }}>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button disabled={activeStep === 0} onClick={() => setActiveStep((prev) => prev - 1)}>Back</Button>
              {activeStep === steps.length - 1 ? (
                <Button variant="contained" onClick={handleSubmit} disabled={submitLoading}
                  sx={{ bgcolor: '#001488', '&:hover': { bgcolor: '#000d5c' }, borderRadius: 2 }}>
                  {submitLoading ? 'Saving...' : isEditing ? 'Update Item' : 'Register Item'}
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  onClick={() => setActiveStep((prev) => prev + 1)}
                  disabled={activeStep === 0 && !isStep1Valid()}
                >
                  Next
                </Button>
              )}
            </DialogActions>
          </Dialog>

          {/* View Details Dialog */}
          <Dialog 
            open={viewDialogOpen} 
            onClose={() => setViewDialogOpen(false)} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 20, 136, 0.15)',
              }
            }}
          >
            <DialogTitle sx={{ bgcolor: '#f1f5f9', borderRadius: '24px 24px 0 0' }}>Item Details</DialogTitle>
            <DialogContent dividers>
              {selectedItem && (
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Item ID</Typography><Typography fontWeight="bold">{selectedItem.itemId}</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Item Name</Typography><Typography fontWeight="bold">{selectedItem.itemName}</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Category</Typography><Typography>{selectedItem.category}</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Description</Typography><Typography>{selectedItem.description || '-'}</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Quantity</Typography><Typography>{selectedItem.quantity} {selectedItem.unitMeasurement}</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Unit Price</Typography><Typography>${selectedItem.unitPrice.toLocaleString()}</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Total Value</Typography><Typography>${selectedItem.totalPrice.toLocaleString()}</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Status</Typography><Chip label={selectedItem.status} size="small" color={selectedItem.status === 'In Stock' ? 'success' : 'warning'} /></Grid>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Supplier Name</Typography><Typography>{selectedItem.supplierName || '-'}</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Purchase Date</Typography><Typography>{selectedItem.purchaseDate ? new Date(selectedItem.purchaseDate).toLocaleDateString() : '-'}</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Purchase Price</Typography><Typography>{selectedItem.purchasePrice ? `$${selectedItem.purchasePrice.toLocaleString()}` : '-'}</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Warehouse / Store</Typography><Typography>{selectedItem.warehouseName || '-'}</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Expiry Date</Typography><Typography>{selectedItem.expiryDate ? new Date(selectedItem.expiryDate).toLocaleDateString() : 'N/A'}</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Recorded By</Typography><Typography>{selectedItem.recordedBy || '-'}</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Created Date</Typography><Typography>{new Date(selectedItem.createdAt).toLocaleDateString()}</Typography></Grid>
                </Grid>
              )}
            </DialogContent>
            <DialogActions><Button onClick={() => setViewDialogOpen(false)}>Close</Button></DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog 
            open={deleteDialogOpen} 
            onClose={() => setDeleteDialogOpen(false)}
            PaperProps={{
              sx: {
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.2)',
              }
            }}
          >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, borderRadius: '24px 24px 0 0' }}>
              <WarningIcon color="error" /> Confirm Delete
            </DialogTitle>
            <DialogContent>
              <Typography>Are you sure you want to delete <strong>{selectedItem?.itemName}</strong>? This action cannot be undone.</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </>
  );
}
