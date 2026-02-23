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
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';

interface IssuedItem {
  _id: string;
  itemCode: string;
  itemName: string;
  issuedTo: string;
  issuedQuantity: number;
  unitPrice?: number;
  issueDate: string;
  issuedBy: string;
  approvedBy?: string;
  approvalStatus?: string;
  approvalDate?: string;
  rejectionReason?: string;
  warehouseLocation?: string;
  dateRecorded: string;
  purpose?: string;
  status: string;
}

export default function IssuedItemsReport() {
  const [items, setItems] = useState<IssuedItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<IssuedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('issueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    let filtered = items.filter(
      (item) =>
        item.itemName.toLowerCase().includes(search.toLowerCase()) ||
        item.itemCode.toLowerCase().includes(search.toLowerCase()) ||
        item.issuedTo.toLowerCase().includes(search.toLowerCase()) ||
        item.issuedBy.toLowerCase().includes(search.toLowerCase()) ||
        (item.approvedBy && item.approvedBy.toLowerCase().includes(search.toLowerCase()))
    );

    // Filter by approval status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((item) => item.approvalStatus === filterStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: any = a[sortBy as keyof IssuedItem];
      let bVal: any = b[sortBy as keyof IssuedItem];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredItems(filtered);
    setPage(0);
  }, [search, items, sortBy, sortOrder, filterStatus]);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/issues');
      const data = await response.json();
      setItems(data);
      setFilteredItems(data);
    } catch (err) {
      console.error('Failed to fetch issued items:', err);
    } finally {
      setLoading(false);
    }
  };

  const pendingApprovals = items.filter((item) => item.approvalStatus === 'Pending').length;
  const approvedItems = items.filter((item) => item.approvalStatus === 'Approved').length;
  const rejectedItems = items.filter((item) => item.approvalStatus === 'Rejected').length;
  const totalQuantity = items.reduce((sum, item) => sum + item.issuedQuantity, 0);

  const handleExportCSV = () => {
    const headers = ['Item Code', 'Item Name', 'Issued To', 'Quantity', 'Unit Price', 'Issue Date', 'Issued By', 'Approved By', 'Status', 'Approval Date', 'Location'];
    const rows = filteredItems.map((item) => [
      item.itemCode, item.itemName, item.issuedTo, item.issuedQuantity, item.unitPrice || 0,
      new Date(item.issueDate).toLocaleDateString(), item.issuedBy, item.approvedBy || '-', 
      item.approvalStatus || 'Pending', item.approvalDate ? new Date(item.approvalDate).toLocaleDateString() : '-', item.warehouseLocation || '-'
    ]);
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'issued_items_report.csv';
    a.click();
  };

  return (
    <>
      <Sidebar />
      <Box sx={{ flexGrow: 1, ml: { xs: 0, md: '260px' }, minHeight: '100vh', bgcolor: '#f8fafc' }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1e293b' }}>Issued Items Report</Typography>
              <Typography variant="body1" color="#64748b">Track all issued items</Typography>
            </Box>
            <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleExportCSV}
              sx={{ bgcolor: '#001488', '&:hover': { bgcolor: '#000d5c' }, borderRadius: 2 }}>
              Export CSV
            </Button>
          </Box>

          {/* Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ borderRadius: 3, bgcolor: '#001488', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>Total Issues</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{items.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ borderRadius: 3, bgcolor: '#1a3a9e', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>Pending</Typography>
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
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{totalQuantity}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Search and Filters */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth placeholder="Search by item name, code, issued to, or issued by..." value={search} onChange={(e) => setSearch(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField select fullWidth label="Sort By" value={sortBy} onChange={(e) => setSortBy(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                  <MenuItem value="issueDate">Issue Date</MenuItem>
                  <MenuItem value="itemCode">Item Code</MenuItem>
                  <MenuItem value="itemName">Item Name</MenuItem>
                  <MenuItem value="issuedTo">Issued To</MenuItem>
                  <MenuItem value="issuedBy">Issued By</MenuItem>
                  <MenuItem value="approvalStatus">Status</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField select fullWidth label="Order" value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                  <MenuItem value="asc">Ascending</MenuItem>
                  <MenuItem value="desc">Descending</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField select fullWidth label="Status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Paper>

          {/* Table */}
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
                    <TableCell sx={{ fontWeight: 'bold' }}>Approved By</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Approval Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={11} align="center">Loading...</TableCell></TableRow>
                  ) : filteredItems.length === 0 ? (
                    <TableRow><TableCell colSpan={11} align="center">No issued items found</TableCell></TableRow>
                  ) : (
                    filteredItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item) => (
                      <TableRow key={item._id} hover>
                        <TableCell><Typography sx={{ fontWeight: 'bold', color: '#3b82f6' }}>{item.itemCode}</Typography></TableCell>
                        <TableCell>{item.itemName}</TableCell>
                        <TableCell>{item.issuedTo}</TableCell>
                        <TableCell align="right"><Typography sx={{ fontWeight: 'bold' }}>{item.issuedQuantity}</Typography></TableCell>
                        <TableCell align="right">{(item.unitPrice || 0).toLocaleString()}</TableCell>
                        <TableCell>{new Date(item.issueDate).toLocaleDateString()}</TableCell>
                        <TableCell>{item.issuedBy}</TableCell>
                        <TableCell>{item.approvedBy || '-'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={item.approvalStatus || 'Pending'} 
                            size="small" 
                            color={item.approvalStatus === 'Approved' ? 'success' : item.approvalStatus === 'Rejected' ? 'error' : 'warning'} 
                          />
                        </TableCell>
                        <TableCell>{item.approvalDate ? new Date(item.approvalDate).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>{item.warehouseLocation || '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination component="div" count={filteredItems.length} page={page} onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} />
          </Paper>
        </Container>
      </Box>
    </>
  );
}
