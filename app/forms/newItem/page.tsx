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
  status: string;
  createdAt: string;
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
  totalPurchaseCost: '',
  warehouseName: '',
  locationCode: '',
  expiryDate: '',
};

const unitMeasurements = [
  'Piece', 'Box', 'Pack', 'Set', 'Pair',
  'Meter', 'Centimeter', 'Foot', 'Inch', 'Roll',
  'Kilogram', 'Gram', 'Pound', 'Ounce',
  'Liter', 'Milliliter', 'Gallon',
  'Dozen', 'Ream', 'Carton', 'Bottle', 'Tube'
];

export default function RegisterItemPage() {
  const [items, setItems] = useState<Item[]>([]);
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

  const steps = ['Item Information', 'Purchase Details', 'Storage & Location'];

  // Stats
  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const lowStockCount = items.filter((item) => item.status === 'Low Stock').length;

  useEffect(() => {
    fetchItems();
  }, []);

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
        totalPurchaseCost: item.totalPurchaseCost?.toString() || '',
        warehouseName: item.warehouseName || '',
        locationCode: item.locationCode || '',
        expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : '',
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
          unitPrice: Number(formData.unitPrice),
          totalPrice: Number(formData.totalPrice),
          purchasePrice: formData.purchasePrice ? Number(formData.purchasePrice) : undefined,
          totalPurchaseCost: formData.totalPurchaseCost ? Number(formData.totalPurchaseCost) : undefined,
          purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate) : undefined,
          expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setSuccess(isEditing ? 'Item updated successfully!' : 'Item registered successfully!');
      fetchItems();
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
              <TextField label="Item ID / Code" name="itemId" value={formData.itemId} onChange={handleChange} fullWidth required disabled={isEditing}
                InputProps={{ startAdornment: <InputAdornment position="start"><InventoryIcon sx={{ color: '#3b82f6' }} /></InputAdornment> }} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField label="Item Name" name="itemName" value={formData.itemName} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select name="category" value={formData.category} onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))} label="Category">
                  <MenuItem value="Electronics">Electronics</MenuItem>
                  <MenuItem value="Furniture">Furniture</MenuItem>
                  <MenuItem value="IT Equipment">IT Equipment</MenuItem>
                  <MenuItem value="Stationery">Stationery</MenuItem>
                  <MenuItem value="Office Supplies">Office Supplies</MenuItem>
                  <MenuItem value="Medicine">Medicine</MenuItem>
                  <MenuItem value="Chemicals">Chemicals</MenuItem>
                  <MenuItem value="Food & Beverages">Food & Beverages</MenuItem>
                  <MenuItem value="Cleaning Supplies">Cleaning Supplies</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField label="Description" name="description" value={formData.description} onChange={handleChange} fullWidth multiline rows={2} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField label="Quantity" name="quantity" type="number" value={formData.quantity} onChange={handleChange} fullWidth required InputProps={{ inputProps: { min: 0 } }} />
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
              <TextField label="Unit Price" name="unitPrice" type="number" value={formData.unitPrice} onChange={handleChange} fullWidth required
                InputProps={{ inputProps: { min: 0, step: 0.01 }, startAdornment: <InputAdornment position="start"><MoneyIcon sx={{ color: '#f59e0b' }} /></InputAdornment> }} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField label="Total Price" name="totalPrice" value={formData.totalPrice} fullWidth InputProps={{ readOnly: true }} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="Recorded By" name="recordedBy" value={formData.recordedBy} onChange={handleChange} fullWidth required
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#3b82f6' }} /></InputAdornment> }} />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField label="Supplier Name" name="supplierName" value={formData.supplierName} onChange={handleChange} fullWidth
                InputProps={{ startAdornment: <InputAdornment position="start"><PurchaseIcon sx={{ color: '#3b82f6' }} /></InputAdornment> }} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField label="Purchase Date" name="purchaseDate" type="date" value={formData.purchaseDate} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField label="Purchase Price (per unit)" name="purchasePrice" type="number" value={formData.purchasePrice} onChange={handleChange} fullWidth
                InputProps={{ inputProps: { min: 0, step: 0.01 } }} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField label="Total Purchase Cost" name="totalPurchaseCost" type="number" value={formData.totalPurchaseCost} onChange={handleChange} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField label="Expiry Date (Optional)" name="expiryDate" type="date" value={formData.expiryDate} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }}
                helperText="Leave empty if item doesn't expire" />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField label="Store / Warehouse Name" name="warehouseName" value={formData.warehouseName} onChange={handleChange} fullWidth
                InputProps={{ startAdornment: <InputAdornment position="start"><WarehouseIcon sx={{ color: '#3b82f6' }} /></InputAdornment> }} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField label="Shelf / Location Code" name="locationCode" value={formData.locationCode} onChange={handleChange} fullWidth />
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
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}
              sx={{ bgcolor: '#001488', '&:hover': { bgcolor: '#000d5c' }, borderRadius: 2, px: 3, py: 1.5 }}>
              Add New Item
            </Button>
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
                  ) : items.length === 0 ? (
                    <TableRow><TableCell colSpan={8} align="center">No items found. Click "Add New Item" to get started.</TableCell></TableRow>
                  ) : (
                    items.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item) => (
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
            <TablePagination component="div" count={items.length} page={page} onPageChange={(e, newPage) => setPage(newPage)}
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
                <Button variant="contained" onClick={() => setActiveStep((prev) => prev + 1)}>Next</Button>
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
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Quantity</Typography><Typography>{selectedItem.quantity} {selectedItem.unitMeasurement}</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Unit Price</Typography><Typography>${selectedItem.unitPrice}</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Total Value</Typography><Typography>${selectedItem.totalPrice}</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Status</Typography><Chip label={selectedItem.status} size="small" color={selectedItem.status === 'In Stock' ? 'success' : 'warning'} /></Grid>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Warehouse</Typography><Typography>{selectedItem.warehouseName || '-'}</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Expiry Date</Typography><Typography>{selectedItem.expiryDate ? new Date(selectedItem.expiryDate).toLocaleDateString() : 'N/A'}</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Unit</Typography><Typography>{selectedItem.unitMeasurement}</Typography></Grid>
                  <Grid size={{ xs: 12 }}><Typography color="textSecondary">Description</Typography><Typography>{selectedItem.description || '-'}</Typography></Grid>
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
