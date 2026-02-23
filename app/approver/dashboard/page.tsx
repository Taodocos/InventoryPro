'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  TextField,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';

interface IssuedItem {
  _id: string;
  itemCode: string;
  itemName: string;
  issuedQuantity: number;
  issuedTo: string;
  issueDate: string;
  issuedBy: string;
  purpose?: string;
  approvalStatus: string;
  createdAt: string;
}

export default function ApproverDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [allApprovals, setAllApprovals] = useState<IssuedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<IssuedItem | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        router.push('/auth/login');
        return;
      }
      const data = await res.json();
      setCurrentUser(data.user);

      if (!data.user.isApprover) {
        router.push('/');
        return;
      }

      fetchPendingApprovals();
    } catch (err) {
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      const res = await fetch('/api/approvals/pending');
      if (res.ok) {
        const data = await res.json();
        setAllApprovals(data);
      }
    } catch (err) {
      console.error('Failed to fetch approvals:', err);
      setError('Failed to load approvals');
    }
  };

  const handleApprove = async (itemId: string) => {
    setApproving(true);
    try {
      const res = await fetch(`/api/approvals/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalStatus: 'Approved' }),
      });

      if (res.ok) {
        setSuccess('Item approved successfully');
        fetchPendingApprovals();
        setViewDialogOpen(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to approve item');
      }
    } catch (err) {
      setError('Error approving item');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async (itemId: string) => {
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    setApproving(true);
    try {
      const res = await fetch(`/api/approvals/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          approvalStatus: 'Rejected',
          rejectionReason: rejectionReason
        }),
      });

      if (res.ok) {
        setSuccess('Item rejected successfully');
        fetchPendingApprovals();
        setViewDialogOpen(false);
        setRejectDialogOpen(false);
        setRejectionReason('');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to reject item');
      }
    } catch (err) {
      setError('Error rejecting item');
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Sidebar />
      <Box sx={{ flexGrow: 1, ml: { xs: 0, md: '260px' }, minHeight: '100vh', bgcolor: '#f8fafc' }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
              Approvals Dashboard
            </Typography>
            <Typography variant="body1" color="#64748b">
              Review and approve issued items for {currentUser?.location}
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          {/* Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ borderRadius: 3, bgcolor: '#001488', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>Pending Approvals</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{allApprovals.filter(a => a.approvalStatus === 'Pending').length}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ borderRadius: 3, bgcolor: '#10b981', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>Approved</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{allApprovals.filter(a => a.approvalStatus === 'Approved').length}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ borderRadius: 3, bgcolor: '#ef4444', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>Rejected</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{allApprovals.filter(a => a.approvalStatus === 'Rejected').length}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ borderRadius: 3, bgcolor: '#1a3a9e', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>Your Location</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{currentUser?.location}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Approvals Table */}
          <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Item Code</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Item Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Quantity</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Issued To</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Issued By</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Issue Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allApprovals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        No records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    allApprovals.map((item) => (
                      <TableRow key={item._id} hover>
                        <TableCell>
                          <Typography sx={{ fontWeight: 'bold', color: '#001488' }}>
                            {item.itemCode}
                          </Typography>
                        </TableCell>
                        <TableCell>{item.itemName}</TableCell>
                        <TableCell align="right">{item.issuedQuantity}</TableCell>
                        <TableCell>{item.issuedTo}</TableCell>
                        <TableCell>{item.issuedBy}</TableCell>
                        <TableCell>{new Date(item.issueDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip 
                            label={item.approvalStatus} 
                            size="small"
                            color={
                              item.approvalStatus === 'Pending' ? 'warning' :
                              item.approvalStatus === 'Approved' ? 'success' :
                              'error'
                            }
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            startIcon={<ViewIcon />}
                            onClick={() => {
                              setSelectedItem(item);
                              setViewDialogOpen(true);
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* View & Approve Dialog */}
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
            <DialogTitle sx={{ bgcolor: '#f1f5f9', fontWeight: 'bold' }}>
              Item Details
            </DialogTitle>
            <DialogContent dividers sx={{ pt: 3 }}>
              {selectedItem && (
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography color="textSecondary">Item Code</Typography>
                    <Typography fontWeight="bold">{selectedItem.itemCode}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography color="textSecondary">Item Name</Typography>
                    <Typography fontWeight="bold">{selectedItem.itemName}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography color="textSecondary">Quantity</Typography>
                    <Typography>{selectedItem.issuedQuantity}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography color="textSecondary">Issued To</Typography>
                    <Typography>{selectedItem.issuedTo}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography color="textSecondary">Issued By</Typography>
                    <Typography>{selectedItem.issuedBy}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography color="textSecondary">Issue Date</Typography>
                    <Typography>{new Date(selectedItem.issueDate).toLocaleDateString()}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography color="textSecondary">Status</Typography>
                    <Chip 
                      label={selectedItem.approvalStatus} 
                      size="small"
                      color={
                        selectedItem.approvalStatus === 'Pending' ? 'warning' :
                        selectedItem.approvalStatus === 'Approved' ? 'success' :
                        'error'
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography color="textSecondary">Purpose</Typography>
                    <Typography>{selectedItem.purpose || '-'}</Typography>
                  </Grid>
                </Grid>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
              <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
              {selectedItem?.approvalStatus === 'Pending' && (
                <>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<RejectIcon />}
                    onClick={() => setRejectDialogOpen(true)}
                    disabled={approving}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<ApproveIcon />}
                    onClick={() => selectedItem && handleApprove(selectedItem._id)}
                    disabled={approving}
                  >
                    Approve
                  </Button>
                </>
              )}
            </DialogActions>
          </Dialog>

          {/* Rejection Reason Dialog */}
          <Dialog
            open={rejectDialogOpen}
            onClose={() => {
              setRejectDialogOpen(false);
              setRejectionReason('');
            }}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: '24px',
                overflow: 'hidden',
              }
            }}
          >
            <DialogTitle sx={{ bgcolor: '#f1f5f9', fontWeight: 'bold' }}>
              Reject Item
            </DialogTitle>
            <DialogContent dividers sx={{ pt: 3 }}>
              <Typography sx={{ mb: 2 }}>
                Please provide a reason for rejecting this item:
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                variant="outlined"
              />
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
              <Button 
                onClick={() => {
                  setRejectDialogOpen(false);
                  setRejectionReason('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => selectedItem && handleReject(selectedItem._id)}
                disabled={approving || !rejectionReason.trim()}
              >
                Confirm Rejection
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </>
  );
}
