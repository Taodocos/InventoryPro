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
  Autocomplete,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Inventory as InventoryIcon,
  Close as CloseIcon,
  Visibility as ViewIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  DateRange as DateIcon,
  Description as DescriptionIcon,
  Business as DepartmentIcon,
  Print as PrintIcon,
  PictureAsPdf as PdfIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { useState, useEffect, useRef } from 'react';

interface AvailableItem {
  _id: string;
  itemId: string;
  itemName: string;
  category: string;
  quantity: number;
  unitPrice: number;
}

interface IssuedItem {
  _id: string;
  itemCode: string;
  itemName: string;
  issuedQuantity: number;
  unitPrice?: number;
  issuedTo: string;
  issueDate: string;
  purpose?: string;
  issuedBy: string;
  approvedBy?: string;
  approvalStatus?: string;
  approvalDate?: string;
  rejectionReason?: string;
  warehouseLocation?: string;
  status: string;
  createdAt: string;
}

const initialFormData = {
  itemCode: '',
  itemName: '',
  issuedQuantity: '',
  issuedTo: '',
  issueDate: '',
  purpose: '',
  issuedBy: '',
  approvedBy: '',
};

export default function IssueItemPage() {
  const [issuedItems, setIssuedItems] = useState<IssuedItem[]>([]);
  const [availableItems, setAvailableItems] = useState<AvailableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<IssuedItem | null>(null);
  const [selectedAvailableItem, setSelectedAvailableItem] = useState<AvailableItem | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuItem, setMenuItem] = useState<IssuedItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IssuedItem | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Filter issued items based on search term
  const filteredIssuedItems = issuedItems.filter(item =>
    item.itemCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.issuedTo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.purpose?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const totalIssued = filteredIssuedItems.length;
  const pendingApprovals = filteredIssuedItems.filter((item) => item.approvalStatus === 'Pending').length;
  const totalQuantityIssued = filteredIssuedItems.reduce((sum, item) => sum + item.issuedQuantity, 0);
  const approvedItems = filteredIssuedItems.filter((item) => item.approvalStatus === 'Approved').length;

  useEffect(() => {
    fetchIssuedItems();
    fetchAvailableItems();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error('Failed to fetch current user:', err);
    }
  };

  const fetchIssuedItems = async () => {
    try {
      const response = await fetch('/api/issues');
      const data = await response.json();
      setIssuedItems(data);
    } catch (err) {
      console.error('Failed to fetch issued items:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableItems = async () => {
    try {
      const response = await fetch('/api/items/available');
      const data = await response.json();
      setAvailableItems(data);
    } catch (err) {
      console.error('Failed to fetch available items:', err);
    }
  };

  const handleOpenDialog = () => {
    setFormData(initialFormData);
    setSelectedAvailableItem(null);
    setError('');
    setSuccess('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormData(initialFormData);
    setSelectedAvailableItem(null);
    setError('');
    setIsEditing(false);
    setEditingItem(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setSubmitLoading(true);
    setError('');

    try {
      const payload = {
        itemCode: formData.itemCode,
        issuedQuantity: Number(formData.issuedQuantity),
        issuedTo: formData.issuedTo,
        issueDate: formData.issueDate,
        purpose: formData.purpose,
        issuedBy: formData.issuedBy || currentUser?.username || 'Unknown',
        approvedBy: formData.approvedBy,
        unitPrice: selectedAvailableItem?.unitPrice || 0,
        dateRecorded: new Date().toISOString(),
      };

      console.log('Submitting issue with payload:', payload);

      const response = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Issue response:', data);

      if (!response.ok) throw new Error(data.error);

      setSuccess('Item issued successfully!');
      fetchIssuedItems();
      fetchAvailableItems();
      setTimeout(() => {
        handleCloseDialog();
        setSuccess('');
      }, 1500);
    } catch (err: any) {
      console.error('Issue submission error:', err);
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, item: IssuedItem) => {
    setAnchorEl(event.currentTarget);
    setMenuItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuItem(null);
  };

  const handleEditItem = (item: IssuedItem) => {
    if (item.approvalStatus !== 'Pending') {
      setError('Only pending items can be edited');
      return;
    }
    setEditingItem(item);
    setFormData({
      itemCode: item.itemCode,
      itemName: item.itemName,
      issuedQuantity: item.issuedQuantity.toString(),
      issuedTo: item.issuedTo,
      issueDate: item.issueDate,
      purpose: item.purpose || '',
      issuedBy: item.issuedBy,
      approvedBy: item.approvedBy || '',
    });
    setIsEditing(true);
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteItem = (item: IssuedItem) => {
    if (item.approvalStatus !== 'Pending') {
      setError('Only pending items can be deleted');
      return;
    }
    setEditingItem(item);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleConfirmDelete = async () => {
    if (!editingItem) return;
    
    try {
      const response = await fetch(`/api/issues/${editingItem._id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete item');
      
      setSuccess('Item deleted successfully!');
      setDeleteDialogOpen(false);
      setEditingItem(null);
      fetchIssuedItems();
      fetchAvailableItems();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;
    
    setSubmitLoading(true);
    setError('');

    try {
      const payload = {
        issuedQuantity: Number(formData.issuedQuantity),
        issuedTo: formData.issuedTo,
        issueDate: formData.issueDate,
        purpose: formData.purpose,
        issuedBy: formData.issuedBy,
        approvedBy: formData.approvedBy,
      };

      const response = await fetch(`/api/issues/${editingItem._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setSuccess('Item updated successfully!');
      setIsEditing(false);
      setEditingItem(null);
      fetchIssuedItems();
      fetchAvailableItems();
      setTimeout(() => {
        handleCloseDialog();
        setSuccess('');
      }, 1500);
    } catch (err: any) {
      console.error('Update error:', err);
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Issue Voucher - ${selectedItem?.itemCode}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { text-align: center; color: #1e293b; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
            .row { display: flex; margin-bottom: 15px; }
            .label { font-weight: bold; width: 150px; color: #64748b; }
            .value { flex: 1; }
            .footer { margin-top: 50px; display: flex; justify-content: space-between; }
            .signature { text-align: center; border-top: 1px solid #000; padding-top: 10px; width: 200px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ISSUE VOUCHER</h1>
            <p>Document No: ISS-${selectedItem?._id.slice(-6).toUpperCase()}</p>
          </div>
          <div class="row"><span class="label">Item Code:</span><span class="value">${selectedItem?.itemCode}</span></div>
          <div class="row"><span class="label">Item Name:</span><span class="value">${selectedItem?.itemName}</span></div>
          <div class="row"><span class="label">Quantity Issued:</span><span class="value">${selectedItem?.issuedQuantity}</span></div>
          <div class="row"><span class="label">Issued To:</span><span class="value">${selectedItem?.issuedTo}</span></div>
          <div class="row"><span class="label">Issue Date:</span><span class="value">${selectedItem?.issueDate ? new Date(selectedItem.issueDate).toLocaleDateString() : '-'}</span></div>
          <div class="row"><span class="label">Purpose:</span><span class="value">${selectedItem?.purpose || '-'}</span></div>
          <div class="row"><span class="label">Issued By:</span><span class="value">${selectedItem?.issuedBy}</span></div>
          <div class="row"><span class="label">Approved By:</span><span class="value">${selectedItem?.approvedBy || '-'}</span></div>
          <div class="row"><span class="label">Status:</span><span class="value">${selectedItem?.status}</span></div>
          <div class="footer">
            <div class="signature">Issued By</div>
            <div class="signature">Received By</div>
            <div class="signature">Approved By</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleExportPdf = () => {
    // For PDF export, we'll use the print functionality with PDF option
    handlePrint();
  };

  return (
    <>
      <Sidebar />
      <Box sx={{ flexGrow: 1, ml: { xs: 0, md: '260px' }, minHeight: '100vh', bgcolor: '#f8fafc' }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1e293b' }}>Issue Items</Typography>
              <Typography variant="body1" color="#64748b">Manage item issuance to departments and individuals</Typography>
            </Box>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog}
              sx={{ background: 'linear-gradient(135deg, #001488 0%, #1a3a9e 100%)', '&:hover': { background: 'linear-gradient(135deg, #1a3a9e 0%, #001488 100%)' }, borderRadius: 2, px: 3, py: 1.5 }}>
              Issue Item
            </Button>
          </Box>

          {/* Search Bar */}
          <Box sx={{ mb: 4 }}>
            <TextField
              fullWidth
              placeholder="Search by Item Code, Name, Issued To, or Purpose..."
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
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>Total Issues</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{totalIssued}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ borderRadius: 3, bgcolor: '#1a3a9e', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>Pending Approvals</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{pendingApprovals}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ borderRadius: 3, bgcolor: '#0026d4', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>Approved</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{approvedItems}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ borderRadius: 3, bgcolor: '#4f6cff', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>Qty Issued</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{totalQuantityIssued}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Issued Items Table */}
          <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Item Code</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Item Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Issued To</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Quantity</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Unit Price</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Issue Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Issued By</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={9} align="center">Loading...</TableCell></TableRow>
                  ) : issuedItems.length === 0 ? (
                    <TableRow><TableCell colSpan={9} align="center">No items found. Try adjusting your search.</TableCell></TableRow>
                  ) : (
                    filteredIssuedItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item) => (
                      <TableRow key={item._id} hover>
                        <TableCell><Typography sx={{ fontWeight: 'bold', color: '#3b82f6' }}>{item.itemCode}</Typography></TableCell>
                        <TableCell>{item.itemName}</TableCell>
                        <TableCell>{item.issuedTo}</TableCell>
                        <TableCell align="right"><Typography sx={{ fontWeight: 'bold' }}>{item.issuedQuantity}</Typography></TableCell>
                        <TableCell align="right">{(item.unitPrice || 0).toLocaleString()}</TableCell>
                        <TableCell>{new Date(item.issueDate).toLocaleDateString()}</TableCell>
                        <TableCell>{item.issuedBy}</TableCell>
                        <TableCell>
                          <Chip label={item.approvalStatus || 'Pending'} size="small" color={item.approvalStatus === 'Approved' ? 'success' : item.approvalStatus === 'Rejected' ? 'error' : 'warning'} />
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
            <TablePagination component="div" count={filteredIssuedItems.length} page={page} onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} />
          </Paper>

          {/* Actions Menu */}
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={() => { setSelectedItem(menuItem); setViewDialogOpen(true); handleMenuClose(); }}>
              <ViewIcon sx={{ mr: 1 }} /> View Details
            </MenuItem>
            <Divider />
            <MenuItem 
              onClick={() => handleEditItem(menuItem!)}
              disabled={menuItem?.approvalStatus !== 'Pending'}
            >
              Edit
            </MenuItem>
            <MenuItem 
              onClick={() => handleDeleteItem(menuItem!)}
              disabled={menuItem?.approvalStatus !== 'Pending'}
            >
              Delete
            </MenuItem>
          </Menu>

          {/* Issue Item Dialog */}
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
              {isEditing ? 'Edit Issue Item' : 'Issue Item'}
              <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Autocomplete
                    options={availableItems}
                    getOptionLabel={(option) => `${option.itemName} (${option.itemId}) - Qty: ${option.quantity}`}
                    value={selectedAvailableItem}
                    onChange={(e, newValue) => {
                      setSelectedAvailableItem(newValue);
                      if (newValue) {
                        setFormData((prev) => ({ ...prev, itemCode: newValue.itemId, itemName: newValue.itemName }));
                      } else {
                        setFormData((prev) => ({ ...prev, itemCode: '', itemName: '' }));
                      }
                    }}
                    renderInput={(params) => <TextField {...params} label="Select Item" required />}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField label="Quantity to Issue" name="issuedQuantity" type="number" value={formData.issuedQuantity} onChange={handleChange} fullWidth required
                    InputProps={{ inputProps: { min: 1, max: selectedAvailableItem?.quantity || 999 } }}
                    helperText={selectedAvailableItem ? `Available: ${selectedAvailableItem.quantity}` : ''} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField label="Issued To (Department/Person)" name="issuedTo" value={formData.issuedTo} onChange={handleChange} fullWidth required
                    InputProps={{ startAdornment: <InputAdornment position="start"><DepartmentIcon /></InputAdornment> }} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField label="Issue Date" name="issueDate" type="date" value={formData.issueDate} onChange={handleChange} fullWidth required InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField label="Purpose / Remark" name="purpose" value={formData.purpose} onChange={handleChange} fullWidth multiline rows={2} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField label="Issued By" name="issuedBy" value={formData.issuedBy} onChange={handleChange} fullWidth required
                    InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment> }} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField label="Approved By" name="approvedBy" value={formData.approvedBy} onChange={handleChange} fullWidth />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, borderTop: '1px solid #e5e7eb' }}>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button variant="contained" onClick={isEditing ? handleUpdateItem : handleSubmit} disabled={submitLoading} startIcon={<SendIcon />}
                sx={{ background: 'linear-gradient(135deg, #001488 0%, #1a3a9e 100%)', borderRadius: 2 }}>
                {submitLoading ? (isEditing ? 'Updating...' : 'Issuing...') : (isEditing ? 'Update Item' : 'Issue Item')}
              </Button>
            </DialogActions>
          </Dialog>

          {/* View Details Dialog with Print/PDF */}
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
            <DialogTitle sx={{ bgcolor: '#f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '24px 24px 0 0' }}>
              Issue Details
              <Box>
                <IconButton onClick={handlePrint} title="Print"><PrintIcon /></IconButton>
                <IconButton onClick={handleExportPdf} title="Export PDF"><PdfIcon /></IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers ref={printRef}>
              {selectedItem && (
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Item Code</Typography><Typography fontWeight="bold">{selectedItem.itemCode}</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Item Name</Typography><Typography fontWeight="bold">{selectedItem.itemName}</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Quantity Issued</Typography><Typography>{selectedItem.issuedQuantity}</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Unit Price</Typography><Typography>{(selectedItem.unitPrice || 0).toLocaleString()}</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Issued To</Typography><Typography>{selectedItem.issuedTo}</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Issue Date</Typography><Typography>{new Date(selectedItem.issueDate).toLocaleDateString()}</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Issued By</Typography><Typography>{selectedItem.issuedBy}</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Approved By</Typography><Typography>{selectedItem.approvedBy || '-'}</Typography></Grid>
                  <Grid size={{ xs: 12 }}><Typography color="textSecondary">Approval Status</Typography><Chip label={selectedItem.approvalStatus || 'Pending'} size="small" color={selectedItem.approvalStatus === 'Approved' ? 'success' : selectedItem.approvalStatus === 'Rejected' ? 'error' : 'warning'} /></Grid>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Approval Date</Typography><Typography>{selectedItem.approvalDate ? new Date(selectedItem.approvalDate).toLocaleDateString() : '-'}</Typography></Grid>
                  {selectedItem.approvalStatus === 'Rejected' && (
                    <Grid size={{ xs: 12 }}><Typography color="textSecondary">Rejection Reason</Typography><Typography sx={{ color: '#dc2626', fontWeight: 500 }}>{(selectedItem as any).rejectionReason || 'No reason provided'}</Typography></Grid>
                  )}
                  <Grid size={{ xs: 12 }}><Typography color="textSecondary">Purpose</Typography><Typography>{selectedItem.purpose || '-'}</Typography></Grid>
                </Grid>
              )}
            </DialogContent>
            <DialogActions><Button onClick={() => setViewDialogOpen(false)}>Close</Button></DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 'bold' }}>
              Delete Issue Item
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Typography>
                Are you sure you want to delete this issued item? This action cannot be undone.
              </Typography>
              {editingItem && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 1 }}>
                  <Typography variant="body2" color="textSecondary">Item: {editingItem.itemName}</Typography>
                  <Typography variant="body2" color="textSecondary">Quantity: {editingItem.issuedQuantity}</Typography>
                  <Typography variant="body2" color="textSecondary">Issued To: {editingItem.issuedTo}</Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button 
                variant="contained" 
                color="error" 
                onClick={handleConfirmDelete}
                disabled={submitLoading}
              >
                {submitLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </>
  );
}
