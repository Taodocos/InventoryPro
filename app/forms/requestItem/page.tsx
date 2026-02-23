'use client';

import Sidebar from '@/app/components/Sidebar';
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
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Visibility as ViewIcon,
  MoreVert as MoreVertIcon,
  Send as SendIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';

interface AvailableItem {
  _id: string;
  itemId: string;
  itemName: string;
  category: string;
  quantity: number;
}

interface ItemRequest {
  _id: string;
  itemId: string;
  itemName: string;
  category: string;
  requestedQuantity: number;
  requestedBy: string;
  department: string;
  numberOfPatients?: number;
  useFor: string;
  status: string;
  createdAt: string;
}

const initialFormData = {
  itemId: '',
  itemName: '',
  category: '',
  requestedQuantity: '',
  department: '',
  numberOfPatients: '',
  useFor: '',
};

export default function RequestItemPage() {
  const [requests, setRequests] = useState<ItemRequest[]>([]);
  const [availableItems, setAvailableItems] = useState<AvailableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ItemRequest | null>(null);
  const [selectedItem, setSelectedItem] = useState<AvailableItem | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuRequest, setMenuRequest] = useState<ItemRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRequests = requests.filter(req =>
    req.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.itemId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRequests = filteredRequests.length;
  const unseenRequests = filteredRequests.filter(r => r.status === 'Unseen').length;
  const approvedRequests = filteredRequests.filter(r => r.status === 'Approved').length;

  useEffect(() => {
    fetchRequests();
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

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/requests');
      const data = await response.json();
      setRequests(data);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
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
    setSelectedItem(null);
    setError('');
    setSuccess('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormData(initialFormData);
    setSelectedItem(null);
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
      const payload = {
        itemId: formData.itemId,
        itemName: formData.itemName,
        category: formData.category,
        requestedQuantity: Number(formData.requestedQuantity),
        department: formData.department,
        numberOfPatients: formData.numberOfPatients ? Number(formData.numberOfPatients) : undefined,
        useFor: formData.useFor,
      };

      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setSuccess('Request submitted successfully!');
      fetchRequests();
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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, request: ItemRequest) => {
    setAnchorEl(event.currentTarget);
    setMenuRequest(request);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuRequest(null);
  };

  const handleDeleteRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete request');
      fetchRequests();
      handleMenuClose();
    } catch (err) {
      console.error('Delete failed:', err);
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
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1e293b' }}>Request Items</Typography>
              <Typography variant="body1" color="#64748b">Submit requests for items from your department</Typography>
            </Box>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog}
              sx={{ background: 'linear-gradient(135deg, #001488 0%, #1a3a9e 100%)', '&:hover': { background: 'linear-gradient(135deg, #1a3a9e 0%, #001488 100%)' }, borderRadius: 2, px: 3, py: 1.5 }}>
              New Request
            </Button>
          </Box>

          {/* Search Bar */}
          <Box sx={{ mb: 4 }}>
            <TextField
              fullWidth
              placeholder="Search by Item Code, Name, or Department..."
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
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>Total Requests</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{totalRequests}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ borderRadius: 3, bgcolor: '#1a3a9e', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>Unseen</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{unseenRequests}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ borderRadius: 3, bgcolor: '#10b981', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>Approved</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{approvedRequests}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          {/* Requests Table */}
          <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Item Code</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Item Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Quantity</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Use For</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={7} align="center">Loading...</TableCell></TableRow>
                  ) : filteredRequests.length === 0 ? (
                    <TableRow><TableCell colSpan={7} align="center">No requests found</TableCell></TableRow>
                  ) : (
                    filteredRequests.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((req) => (
                      <TableRow key={req._id} hover>
                        <TableCell><Typography sx={{ fontWeight: 'bold', color: '#3b82f6' }}>{req.itemId}</Typography></TableCell>
                        <TableCell>{req.itemName}</TableCell>
                        <TableCell>{req.department}</TableCell>
                        <TableCell align="right"><Typography sx={{ fontWeight: 'bold' }}>{req.requestedQuantity}</Typography></TableCell>
                        <TableCell>{req.useFor}</TableCell>
                        <TableCell>
                          <Chip 
                            label={req.status} 
                            size="small"
                            color={
                              req.status === 'Unseen' ? 'warning' :
                              req.status === 'Approved' ? 'success' :
                              req.status === 'Rejected' ? 'error' :
                              'default'
                            }
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton size="small" onClick={(e) => handleMenuOpen(e, req)}><MoreVertIcon /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination component="div" count={filteredRequests.length} page={page} onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} />
          </Paper>

          {/* Menu */}
          <Box
            component="div"
            sx={{
              position: 'fixed',
              top: anchorEl?.getBoundingClientRect().top,
              left: anchorEl?.getBoundingClientRect().left,
              zIndex: 1300,
            }}
          >
            {anchorEl && (
              <Paper sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 3 }}>
                <Box sx={{ p: 1 }}>
                  <Button
                    fullWidth
                    size="small"
                    onClick={() => {
                      setSelectedRequest(menuRequest);
                      setViewDialogOpen(true);
                      handleMenuClose();
                    }}
                    sx={{ justifyContent: 'flex-start', mb: 1 }}
                  >
                    <ViewIcon sx={{ mr: 1 }} /> View
                  </Button>
                  <Button
                    fullWidth
                    size="small"
                    color="error"
                    onClick={() => menuRequest && handleDeleteRequest(menuRequest._id)}
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    <DeleteIcon sx={{ mr: 1 }} /> Delete
                  </Button>
                </Box>
              </Paper>
            )}
          </Box>

          {/* Request Dialog */}
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
              Request Item
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
                    value={selectedItem}
                    onChange={(e, newValue) => {
                      setSelectedItem(newValue);
                      if (newValue) {
                        setFormData((prev) => ({ ...prev, itemId: newValue.itemId, itemName: newValue.itemName, category: newValue.category }));
                      } else {
                        setFormData((prev) => ({ ...prev, itemId: '', itemName: '', category: '' }));
                      }
                    }}
                    renderInput={(params) => <TextField {...params} label="Select Item" required />}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField label="Requested Quantity" name="requestedQuantity" type="number" value={formData.requestedQuantity} onChange={handleChange} fullWidth required
                    InputProps={{ inputProps: { min: 1 } }} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField label="Department" name="department" value={formData.department} onChange={handleChange} fullWidth required />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField label="Number of Patients (Optional)" name="numberOfPatients" type="number" value={formData.numberOfPatients} onChange={handleChange} fullWidth
                    InputProps={{ inputProps: { min: 0 } }} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField label="Use For" name="useFor" value={formData.useFor} onChange={handleChange} fullWidth required multiline rows={2} />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, borderTop: '1px solid #e5e7eb' }}>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button variant="contained" onClick={handleSubmit} disabled={submitLoading} startIcon={<SendIcon />}
                sx={{ background: 'linear-gradient(135deg, #001488 0%, #1a3a9e 100%)', borderRadius: 2 }}>
                {submitLoading ? 'Submitting...' : 'Submit Request'}
              </Button>
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
              }
            }}
          >
            <DialogTitle sx={{ bgcolor: '#f1f5f9', fontWeight: 'bold' }}>Request Details</DialogTitle>
            <DialogContent dividers sx={{ pt: 3 }}>
              {selectedRequest && (
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Item Code</Typography><Typography fontWeight="bold">{selectedRequest.itemId}</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Item Name</Typography><Typography fontWeight="bold">{selectedRequest.itemName}</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Category</Typography><Typography>{selectedRequest.category}</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Quantity</Typography><Typography>{selectedRequest.requestedQuantity}</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Department</Typography><Typography>{selectedRequest.department}</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Requested By</Typography><Typography>{selectedRequest.requestedBy}</Typography></Grid>
                  {selectedRequest.numberOfPatients && (
                    <Grid size={{ xs: 6 }}><Typography color="textSecondary">Number of Patients</Typography><Typography>{selectedRequest.numberOfPatients}</Typography></Grid>
                  )}
                  <Grid size={{ xs: 12 }}><Typography color="textSecondary">Use For</Typography><Typography>{selectedRequest.useFor}</Typography></Grid>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Status</Typography><Chip label={selectedRequest.status} size="small" color={selectedRequest.status === 'Unseen' ? 'warning' : selectedRequest.status === 'Approved' ? 'success' : 'error'} /></Grid>
                  <Grid size={{ xs: 6 }}><Typography color="textSecondary">Date</Typography><Typography>{new Date(selectedRequest.createdAt).toLocaleDateString()}</Typography></Grid>
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
