'use client';

import Sidebar from '@/app/components/Sidebar';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';

interface ItemRequest {
  _id: string;
  itemId: string;
  itemName: string;
  category: string;
  requestedQuantity: number;
  requestedBy: string;
  requestedByUserId: string;
  department: string;
  numberOfPatients?: number;
  useFor: string;
  location: string;
  status: string;
  createdAt: string;
}

export default function ViewRequestsPage() {
  const [requests, setRequests] = useState<ItemRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedRequest, setSelectedRequest] = useState<ItemRequest | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuRequest, setMenuRequest] = useState<ItemRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    fetchCurrentUser();
    fetchRequests();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        
        // Check permission
        if (!data.user.isAdmin && !data.user.permissions?.canViewRequests) {
          // Redirect if no permission
          window.location.href = '/dashboard';
        }
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

  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.itemId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.requestedBy?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || req.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalRequests = filteredRequests.length;
  const unseenRequests = filteredRequests.filter(r => r.status === 'Unseen').length;
  const approvedRequests = filteredRequests.filter(r => r.status === 'Approved').length;
  const rejectedRequests = filteredRequests.filter(r => r.status === 'Rejected').length;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, request: ItemRequest) => {
    setAnchorEl(event.currentTarget);
    setMenuRequest(request);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuRequest(null);
  };

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      fetchRequests();
      handleMenuClose();
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  return (
    <>
      <Sidebar />
      <Box sx={{ flexGrow: 1, ml: { xs: 0, md: '260px' }, minHeight: '100vh', bgcolor: '#f8fafc' }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1e293b' }}>View Requests</Typography>
            <Typography variant="body1" color="#64748b">Review and manage item requests from your location</Typography>
          </Box>

          {/* Search and Filter */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                fullWidth
                placeholder="Search by Item, Department, or Requester..."
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
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                select
                label="Filter by Status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
                sx={{ bgcolor: 'white', borderRadius: 2 }}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="Unseen">Unseen</MenuItem>
                <MenuItem value="Seen">Seen</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </TextField>
            </Grid>
          </Grid>

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
              <Card sx={{ borderRadius: 3, bgcolor: '#f59e0b', color: 'white' }}>
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
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ borderRadius: 3, bgcolor: '#ef4444', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>Rejected</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{rejectedRequests}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Requests Table */}
          <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Item Code</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Item Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Requested By</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Quantity</TableCell>
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
                        <TableCell>{req.requestedBy}</TableCell>
                        <TableCell align="right"><Typography sx={{ fontWeight: 'bold' }}>{req.requestedQuantity}</Typography></TableCell>
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

          {/* Actions Menu */}
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={() => { setSelectedRequest(menuRequest); setViewDialogOpen(true); handleMenuClose(); }}>
              <ViewIcon sx={{ mr: 1 }} /> View Details
            </MenuItem>
            <MenuItem onClick={() => menuRequest && handleStatusChange(menuRequest._id, 'Seen')}>
              View Details
            </MenuItem>
            <MenuItem onClick={() => menuRequest && handleStatusChange(menuRequest._id, 'Approved')} sx={{ color: 'success.main' }}>
              <ApproveIcon sx={{ mr: 1 }} /> Approve
            </MenuItem>
            <MenuItem onClick={() => menuRequest && handleStatusChange(menuRequest._id, 'Rejected')} sx={{ color: 'error.main' }}>
              <RejectIcon sx={{ mr: 1 }} /> Reject
            </MenuItem>
          </Menu>

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
