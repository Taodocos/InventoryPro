'use client';

import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Avatar,
  Skeleton,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Assignment as IssueIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  ArrowForward as ArrowForwardIcon,
  Refresh as RefreshIcon,
  AttachMoney as MoneyIcon,
  LocalShipping as ShippingIcon,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';

interface Stats {
  totalItems: number;
  totalQuantity: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalIssuedRecords: number;
  activeIssues: number;
  totalIssuedValue: number;
}

interface RecentItem {
  _id: string;
  itemId: string;
  itemName: string;
  category: string;
  quantity: number;
  status: string;
  createdAt: string;
}

interface RecentIssue {
  _id: string;
  itemCode: string;
  itemName: string;
  issuedTo: string;
  issuedQuantity: number;
  status: string;
  createdAt: string;
}

interface ExpiringItem {
  _id: string;
  itemId: string;
  itemName: string;
  category: string;
  quantity: number;
  unitMeasurement: string;
  expiryDate: string;
  daysRemaining: number;
  expiryStatus: 'expired' | 'critical' | 'warning';
}

interface ExpiringSummary {
  total: number;
  expired: number;
  critical: number;
  warning: number;
}

interface LocationStats {
  _id: string;
  totalItems: number;
  totalQuantity: number;
  totalValue: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [recentIssues, setRecentIssues] = useState<RecentIssue[]>([]);
  const [expiringItems, setExpiringItems] = useState<ExpiringItem[]>([]);
  const [expiringSummary, setExpiringSummary] = useState<ExpiringSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [itemStatusData, setItemStatusData] = useState<any[]>([]);
  const [approvalStatusData, setApprovalStatusData] = useState<any[]>([]);
  const [locationStats, setLocationStats] = useState<LocationStats[]>([]);

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
      fetchData();
    } catch (err) {
      router.push('/auth/login');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, itemsRes, issuesRes, expiringRes, locationRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/items'),
        fetch('/api/issues'),
        fetch('/api/items/expiring'),
        fetch('/api/stats/by-location'),
      ]);

      const statsData = await statsRes.json();
      const itemsData = await itemsRes.json();
      const issuesData = await issuesRes.json();
      const expiringData = await expiringRes.json();
      const locationData = await locationRes.json();

      setStats(statsData);
      setRecentItems(itemsData.slice(0, 5));
      setRecentIssues(issuesData.slice(0, 5));
      setExpiringItems(expiringData.items || []);
      setExpiringSummary(expiringData.summary || null);
      setLocationStats(locationData);

      // Calculate item status data for pie chart
      const inStockCount = statsData.totalItems - statsData.lowStockItems - statsData.outOfStockItems;
      setItemStatusData([
        { name: 'In Stock', value: inStockCount, color: '#10b981' },
        { name: 'Low Stock', value: statsData.lowStockItems, color: '#f59e0b' },
        { name: 'Out of Stock', value: statsData.outOfStockItems, color: '#ef4444' },
      ]);

      // Calculate approval status data for pie chart
      const approvedCount = statsData.totalIssuedRecords - statsData.activeIssues - (issuesData.filter((i: any) => i.approvalStatus === 'Rejected').length || 0);
      const rejectedCount = issuesData.filter((i: any) => i.approvalStatus === 'Rejected').length || 0;
      setApprovalStatusData([
        { name: 'Pending', value: statsData.activeIssues, color: '#f59e0b' },
        { name: 'Approved', value: approvedCount, color: '#10b981' },
        { name: 'Rejected', value: rejectedCount, color: '#ef4444' },
      ]);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getExpiryLabel = (daysRemaining: number) => {
    if (daysRemaining <= 0) return `Expired ${Math.abs(daysRemaining)} days ago`;
    if (daysRemaining === 1) return '1 day left';
    if (daysRemaining <= 30) return `${daysRemaining} days left`;
    const months = Math.floor(daysRemaining / 30);
    const days = daysRemaining % 30;
    return `${months}m ${days}d left`;
  };

  const StatCard = ({ title, value, icon: Icon, gradient, iconBg }: any) => (
    <Card sx={{ 
      borderRadius: 4, 
      background: gradient,
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1, fontWeight: 500 }}>{title}</Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              {loading ? <Skeleton width={80} sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} /> : value}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: iconBg, width: 56, height: 56 }}>
            <Icon sx={{ fontSize: 28 }} />
          </Avatar>
        </Box>
      </CardContent>
      <Box sx={{ position: 'absolute', bottom: -20, right: -20, width: 100, height: 100, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)' }} />
    </Card>
  );

  return (
    <>
      <Sidebar />
      <Box sx={{ flexGrow: 1, ml: { xs: 0, md: '260px' }, minHeight: '100vh', bgcolor: '#f1f5f9' }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#0f172a', mb: 0.5 }}>
                Welcome back! Here's your inventory overview.
              </Typography>
            </Box>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon sx={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />}
              onClick={fetchData}
              disabled={loading}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Refresh
            </Button>
          </Box>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard 
                title="Total Items" 
                value={stats?.totalItems || 0}
                icon={InventoryIcon}
                gradient="linear-gradient(135deg, #001488 0%, #000d5c 100%)"
                iconBg="rgba(255,255,255,0.2)"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard 
                title="Total Quantity" 
                value={stats?.totalQuantity?.toLocaleString() || 0}
                icon={ShippingIcon}
                gradient="linear-gradient(135deg, #001488 0%, #1a3a9e 100%)"
                iconBg="rgba(255,255,255,0.2)"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard 
                title="Inventory Value" 
                value={`${(stats?.totalValue || 0).toLocaleString()}`}
                icon={MoneyIcon}
                gradient="linear-gradient(135deg, #1a3a9e 0%, #001488 100%)"
                iconBg="rgba(255,255,255,0.2)"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard 
                title="Low Stock Alert" 
                value={stats?.lowStockItems || 0}
                icon={WarningIcon}
                gradient="linear-gradient(135deg, #0026d4 0%, #001488 100%)"
                iconBg="rgba(255,255,255,0.2)"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#dbeafe', width: 48, height: 48 }}>
                  <IssueIcon sx={{ color: '#3b82f6' }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
                    {loading ? <Skeleton width={40} /> : stats?.totalIssuedRecords || 0}
                  </Typography>
                  <Typography variant="body2" color="#64748b">Total Issues</Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#fef3c7', width: 48, height: 48 }}>
                  <TrendingUpIcon sx={{ color: '#f59e0b' }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
                    {loading ? <Skeleton width={40} /> : stats?.activeIssues || 0}
                  </Typography>
                  <Typography variant="body2" color="#64748b">Pending Approvals</Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#fee2e2', width: 48, height: 48 }}>
                  <MoneyIcon sx={{ color: '#ef4444' }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
                    ${loading ? <Skeleton width={60} /> : (stats?.totalIssuedValue || 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="#64748b">Total Issued Value</Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ borderRadius: 4, p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Item Status Distribution</Typography>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                    <Skeleton variant="circular" width={200} height={200} />
                  </Box>
                ) : itemStatusData.length > 0 && itemStatusData.some(d => d.value > 0) ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={itemStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {itemStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} items`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, color: '#64748b' }}>
                    <Typography>No item data available</Typography>
                  </Box>
                )}
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ borderRadius: 4, p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Approval Status Distribution</Typography>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                    <Skeleton variant="circular" width={200} height={200} />
                  </Box>
                ) : approvalStatusData.length > 0 && approvalStatusData.some(d => d.value > 0) ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={approvalStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {approvalStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} items`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, color: '#64748b' }}>
                    <Typography>No approval data available</Typography>
                  </Box>
                )}
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12 }}>
              <Card sx={{ borderRadius: 4, p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Inventory by Location</Typography>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                    <Skeleton variant="rectangular" width="100%" height={300} />
                  </Box>
                ) : locationStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={locationStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="_id" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="totalItems" fill="#3b82f6" name="Total Items" />
                      <Bar dataKey="inStock" fill="#10b981" name="In Stock" />
                      <Bar dataKey="lowStock" fill="#f59e0b" name="Low Stock" />
                      <Bar dataKey="outOfStock" fill="#ef4444" name="Out of Stock" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, color: '#64748b' }}>
                    <Typography>No location data available</Typography>
                  </Box>
                )}
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ borderRadius: 4, p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Total Value by Location</Typography>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                    <Skeleton variant="circular" width={200} height={200} />
                  </Box>
                ) : locationStats.length > 0 && locationStats.some(l => l.totalValue > 0) ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={locationStats.map(loc => ({ name: loc._id, value: loc.totalValue }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value.toLocaleString()}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {locationStats.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][index % 6]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${(value as number).toLocaleString()}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, color: '#64748b' }}>
                    <Typography>No value data available</Typography>
                  </Box>
                )}
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ borderRadius: 4, p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Total Quantity by Location</Typography>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                    <Skeleton variant="circular" width={200} height={200} />
                  </Box>
                ) : locationStats.length > 0 && locationStats.some(l => l.totalQuantity > 0) ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={locationStats.map(loc => ({ name: loc._id, value: loc.totalQuantity }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {locationStats.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][index % 6]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} units`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, color: '#64748b' }}>
                    <Typography>No quantity data available</Typography>
                  </Box>
                )}
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card 
                sx={{ 
                  borderRadius: 4, 
                  background: 'linear-gradient(135deg, #001488 0%, #000d5c 100%)',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': { transform: 'scale(1.02)', boxShadow: '0 20px 40px rgba(0, 20, 136, 0.4)' }
                }}
                onClick={() => router.push('/forms/newItem')}
              >
                <CardContent sx={{ p: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>Register New Item</Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>Add new items to your inventory</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 64, height: 64 }}>
                    <InventoryIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card 
                sx={{ 
                  borderRadius: 4, 
                  background: 'linear-gradient(135deg, #1a3a9e 0%, #001488 100%)',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': { transform: 'scale(1.02)', boxShadow: '0 20px 40px rgba(26, 58, 158, 0.4)' }
                }}
                onClick={() => router.push('/forms/issueItem')}
              >
                <CardContent sx={{ p: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>Issue Item</Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>Issue items to departments</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 64, height: 64 }}>
                    <IssueIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {expiringSummary && expiringSummary.total > 0 && (
            <Paper sx={{ borderRadius: 4, overflow: 'hidden', mb: 4, border: '2px solid #ef4444' }}>
              <Box sx={{ p: 3, bgcolor: '#fef2f2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#fee2e2', width: 48, height: 48 }}>
                    <WarningIcon sx={{ color: '#ef4444' }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#dc2626' }}>Expiry Alerts</Typography>
                    <Typography variant="body2" color="#64748b">
                      {expiringSummary.expired > 0 && <Chip label={`${expiringSummary.expired} Expired`} size="small" sx={{ bgcolor: '#ef4444', color: 'white', mr: 1 }} />}
                      {expiringSummary.critical > 0 && <Chip label={`${expiringSummary.critical} Critical (<30 days)`} size="small" sx={{ bgcolor: '#f97316', color: 'white', mr: 1 }} />}
                      {expiringSummary.warning > 0 && <Chip label={`${expiringSummary.warning} Warning (<3 months)`} size="small" sx={{ bgcolor: '#eab308', color: 'white' }} />}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#fef2f2' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Quantity</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Expiry Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Time Remaining</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {expiringItems.slice(0, 5).map((item) => (
                      <TableRow key={item._id} hover sx={{ bgcolor: item.expiryStatus === 'expired' ? '#fef2f2' : 'inherit' }}>
                        <TableCell>
                          <Box>
                            <Typography sx={{ fontWeight: 500 }}>{item.itemName}</Typography>
                            <Typography variant="caption" color="textSecondary">{item.itemId}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell align="right">{item.quantity} {item.unitMeasurement}</TableCell>
                        <TableCell>{new Date(item.expiryDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip 
                            label={getExpiryLabel(item.daysRemaining)} 
                            size="small" 
                            sx={{ 
                              bgcolor: item.expiryStatus === 'expired' ? '#ef4444' : item.expiryStatus === 'critical' ? '#f97316' : '#eab308',
                              color: 'white',
                              fontWeight: 'bold'
                            }} 
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {expiringItems.length > 5 && (
                <Box sx={{ p: 2, textAlign: 'center', bgcolor: '#fef2f2' }}>
                  <Typography variant="body2" color="#64748b">
                    And {expiringItems.length - 5} more items expiring soon...
                  </Typography>
                </Box>
              )}
            </Paper>
          )}

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fafc' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#dbeafe' }}><InventoryIcon sx={{ color: '#3b82f6' }} /></Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Recent Items</Typography>
                  </Box>
                  <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => router.push('/forms/newItem')}>View All</Button>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Qty</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        [...Array(3)].map((_, i) => (
                          <TableRow key={i}>
                            <TableCell><Skeleton /></TableCell>
                            <TableCell><Skeleton /></TableCell>
                            <TableCell><Skeleton width={60} /></TableCell>
                          </TableRow>
                        ))
                      ) : recentItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} align="center" sx={{ py: 4, color: '#64748b' }}>
                            No items registered yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        recentItems.map((item) => (
                          <TableRow key={item._id} hover>
                            <TableCell>
                              <Box>
                                <Typography sx={{ fontWeight: 500 }}>{item.itemName}</Typography>
                                <Typography variant="caption" color="textSecondary">{item.itemId}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Typography sx={{ fontWeight: 600 }}>{item.quantity}</Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={item.status} 
                                size="small" 
                                color={item.status === 'In Stock' ? 'success' : item.status === 'Low Stock' ? 'warning' : 'error'}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fafc' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#fce7f3' }}><IssueIcon sx={{ color: '#ec4899' }} /></Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Recent Issues</Typography>
                  </Box>
                  <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => router.push('/forms/issueItem')}>View All</Button>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Issued To</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        [...Array(3)].map((_, i) => (
                          <TableRow key={i}>
                            <TableCell><Skeleton /></TableCell>
                            <TableCell><Skeleton /></TableCell>
                            <TableCell><Skeleton width={60} /></TableCell>
                          </TableRow>
                        ))
                      ) : recentIssues.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} align="center" sx={{ py: 4, color: '#64748b' }}>
                            No items issued yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        recentIssues.map((issue) => (
                          <TableRow key={issue._id} hover>
                            <TableCell>
                              <Box>
                                <Typography sx={{ fontWeight: 500 }}>{issue.itemName}</Typography>
                                <Typography variant="caption" color="textSecondary">{issue.itemCode}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{issue.issuedTo}</TableCell>
                            <TableCell>
                              <Chip 
                                label={issue.status} 
                                size="small" 
                                color={issue.status === 'Active' ? 'warning' : issue.status === 'Returned' ? 'success' : 'error'}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
