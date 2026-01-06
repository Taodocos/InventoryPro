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
}

interface IssuedItem {
  _id: string;
  itemCode: string;
  itemName: string;
  issuedQuantity: number;
  issuedTo: string;
  issueDate: string;
  purpose?: string;
  issuedBy: string;
  approvedBy?: string;
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
  const printRef = useRef<HTMLDivElement>(null);

  // Stats
  const totalIssued = issuedItems.length;
  const activeIssues = issuedItems.filter((item) => item.status === 'Active').length;
  const totalQuantityIssued = issuedItems.reduce((sum, item) => sum + item.issuedQuantity, 0);
  const returnedItems = issuedItems.filter((item) => item.status === 'Returned').length;

  useEffect(() => {
    fetchIssuedItems();
    fetchAvailableItems();
  }, []);

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
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setSubmitLoading(true);
    setError('');

    try {
      const response = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemCode: formData.itemCode,
          issuedQuantity: Number(formData.issuedQuantity),
          issuedTo: formData.issuedTo,
          issueDate: formData.issueDate,
          purpose: formData.purpose,
          issuedBy: formData.issuedBy,
          approvedBy: formData.approvedBy,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setSuccess('Item issued successfully!');
      fetchIssuedItems();
      fetchAvailableItems();
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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, item: IssuedItem) => {
    setAnchorEl(event.currentTarget);
    setMenuItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuItem(null);
  };

  const handleStatusChange = async (item: IssuedItem, newStatus: string) => {
    try {
      const response = await fetch(`/api/issues/${item._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      fetchIssuedItems();
      handleMenuClose();
    } catch (err) {
      console.error('Status update failed:', err);
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
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>Active Issues</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{activeIssues}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ borderRadius: 3, bgcolor: '#0026d4', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>Returned</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{returnedItems}</Typography>
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
                    <TableCell sx={{ fontWeight: 'bold' }}>Issue Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Issued By</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={8} align="center">Loading...</TableCell></TableRow>
                  ) : issuedItems.length === 0 ? (
                    <TableRow><TableCell colSpan={8} align="center">No items issued yet. Click "Issue Item" to get started.</TableCell></TableRow>
                  ) : (
                    issuedItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item) => (
                      <TableRow key={item._id} hover>
                        <TableCell><Typography sx={{ fontWeight: 'bold', color: '#3b82f6' }}>{item.itemCode}</Typography></TableCell>
                        <TableCell>{item.itemName}</TableCell>
                        <TableCell>{item.issuedTo}</TableCell>
                        <TableCell align="right"><Typography sx={{ fontWeight: 'bold' }}>{item.issuedQuantity}</Typography></TableCell>
                        <TableCell>{new Date(item.issueDate).toLocaleDateString()}</TableCell>
                        <TableCell>{item.issuedBy}</TableCell>
                        <TableCell>
                          <Chip label={item.status} size="small" color={item.status === 'Active' ? 'warning' : item.status === 'Returned' ? 'success' : 'error'} />
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
            <TablePagination component="div" count={issuedItems.length} page={page} onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} />
          </Paper>

          {/* Actions Menu */}
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={() => { setSelectedItem(menuItem); setViewDialogOpen(true); handleMenuClose(); }}>
              <ViewIcon sx={{ mr: 1 }} /> View Details
            </MenuItem>
            <Divider />
            <MenuItem disabled={menuItem?.status === 'Returned'} onClick={() => { handleStatusChange(menuItem!, 'Returned'); }}>
              <Chip label="Mark as Returned" size="small" color="success" sx={{ cursor: 'pointer' }} />
            </MenuItem>
            <MenuItem disabled={menuItem?.status === 'Consumed'} onClick={() => { handleStatusChange(menuItem!, 'Consumed'); }}>
              <Chip label="Mark as Consumed" size="small" color="error" sx={{ cursor: 'pointer' }} />
            </MenuItem>
            <MenuItem disabled={menuItem?.status === 'Active'} onClick={() => { handleStatusChange(menuItem!, 'Active'); }}>
              <Chip label="Mark as Active" size="small" color="warning" sx={{ cursor: 'pointer' }} />
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
              Issue Item
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
              <Button variant="contained" onClick={handleSubmit} disabled={submitLoading} startIcon={<SendIcon />}
                sx={{ background: 'linear-gradient(135deg, #001488 0%, #1a3a9e 100%)', borderRadius: 2 }}>
                {submitLoading ? 'Issuing...' : 'Issue Item'}
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
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Issued To</Typography><Typography>{selectedItem.issuedTo}</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Issue Date</Typography><Typography>{new Date(selectedItem.issueDate).toLocaleDateString()}</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Issued By</Typography><Typography>{selectedItem.issuedBy}</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Approved By</Typography><Typography>{selectedItem.approvedBy || '-'}</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Status</Typography><Chip label={selectedItem.status} size="small" color={selectedItem.status === 'Active' ? 'warning' : 'success'} /></Grid>
                  <Grid size={{ xs: 12 }}><Typography color="textSecondary">Purpose</Typography><Typography>{selectedItem.purpose || '-'}</Typography></Grid>
                </Grid>
              )}
            </DialogContent>
            <DialogActions><Button onClick={() => setViewDialogOpen(false)}>Close</Button></DialogActions>
          </Dialog>
        </Container>
      </Box>
    </>
  );
}
