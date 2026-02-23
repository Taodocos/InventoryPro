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
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Edit as EditIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface User {
  _id: string;
  username: string;
  email: string;
  location: string;
  isAdmin: boolean;
  isApprover: boolean;
  permissions: {
    canRegisterItems: boolean;
    canIssueItems: boolean;
    canRequestItems: boolean;
    canViewRequests: boolean;
    canManageLocations: boolean;
    canManageCategories: boolean;
    canApproveItems: boolean;
    canViewReports: boolean;
  };
  createdAt: string;
}

export default function UserManagementPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({
    username: '',
    email: '',
    location: '',
  });
  const [permissions, setPermissions] = useState({
    canRegisterItems: false,
    canIssueItems: false,
    canRequestItems: false,
    canViewRequests: false,
    canManageLocations: false,
    canManageCategories: false,
    canApproveItems: false,
    canViewReports: false,
  });
  const [isApprover, setIsApprover] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        router.push('/auth/login');
        return;
      }
      const data = await res.json();
      setCurrentUser(data.user);

      if (!data.user.isAdmin) {
        router.push('/');
        return;
      }

      fetchLocations();
      fetchUsers();
    } catch (err) {
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/locations');
      if (res.ok) {
        const data = await res.json();
        setLocations(data);
      }
    } catch (err) {
      console.error('Failed to fetch locations:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
        setFilteredUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users');
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      username: user.username,
      email: user.email,
      location: user.location,
    });
    setPermissions(user.permissions || {
      canRegisterItems: false,
      canIssueItems: false,
      canRequestItems: false,
      canViewRequests: false,
      canManageLocations: false,
      canManageCategories: false,
      canApproveItems: false,
      canViewReports: false,
    });
    setIsApprover(user.isApprover);
    setEditMode(false);
    setDialogOpen(true);
    setError('');
    setSuccess('');
  };

  const handlePermissionChange = (permission: keyof typeof permissions) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: !prev[permission]
    }));
  };

  const handleSave = async () => {
    if (!selectedUser) return;

    setSaving(true);
    try {
      const payload = {
        userId: selectedUser._id,
        ...(editMode && editFormData),
        permissions,
        isApprover,
      };
      
      console.log('Saving user with payload:', payload);
      
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const responseData = await res.json();
        console.log('Save response:', responseData);
        setSuccess(editMode ? 'User information updated successfully' : 'User permissions updated successfully');
        fetchUsers();
        setTimeout(() => {
          setDialogOpen(false);
          setSuccess('');
        }, 1500);
      } else {
        const data = await res.json();
        console.error('Save error response:', data);
        setError(data.error || 'Failed to update user');
      }
    } catch (err) {
      setError('Error updating user');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setSaving(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userToDelete._id,
        }),
      });

      if (res.ok) {
        setSuccess('User deleted successfully');
        fetchUsers();
        setDeleteDialogOpen(false);
        setUserToDelete(null);
        setTimeout(() => setSuccess(''), 2000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete user');
      }
    } catch (err) {
      setError('Error deleting user');
    } finally {
      setSaving(false);
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
              User Management
            </Typography>
            <Typography variant="body1" color="#64748b">
              Manage user roles and permissions
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          {/* Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ borderRadius: 3, bgcolor: '#001488', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>Total Users</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{users.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ borderRadius: 3, bgcolor: '#1a3a9e', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>Admins</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{users.filter(u => u.isAdmin).length}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ borderRadius: 3, bgcolor: '#0026d4', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>Approvers</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{users.filter(u => u.isApprover).length}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ borderRadius: 3, bgcolor: '#4f6cff', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>Regular Users</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{users.filter(u => !u.isAdmin && !u.isApprover).length}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Search Bar */}
          <Box sx={{ mb: 4 }}>
            <TextField
              fullWidth
              placeholder="Search by username, email, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

          {/* Users Table */}
          <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Permissions</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user._id} hover>
                        <TableCell>
                          <Typography sx={{ fontWeight: 'bold', color: '#001488' }}>
                            {user.username}
                          </Typography>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.location}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {user.isAdmin && <Chip label="Admin" size="small" color="error" />}
                            {user.isApprover && <Chip label="Approver" size="small" color="warning" />}
                            {!user.isAdmin && !user.isApprover && <Chip label="User" size="small" />}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {user.permissions?.canRegisterItems && <Chip label="Register Items" size="small" variant="outlined" />}
                            {user.permissions?.canIssueItems && <Chip label="Issue Items" size="small" variant="outlined" />}
                            {user.permissions?.canRequestItems && <Chip label="Request Items" size="small" variant="outlined" />}
                            {user.permissions?.canViewRequests && <Chip label="View Requests" size="small" variant="outlined" />}
                            {user.permissions?.canManageLocations && <Chip label="Manage Locations" size="small" variant="outlined" />}
                            {user.permissions?.canManageCategories && <Chip label="Manage Categories" size="small" variant="outlined" />}
                            {user.permissions?.canApproveItems && <Chip label="Approve Items" size="small" variant="outlined" />}
                            {user.permissions?.canViewReports && <Chip label="View Reports" size="small" variant="outlined" />}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => handleEditUser(user)}
                            sx={{ color: '#001488', mr: 1 }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            startIcon={<DeleteIcon />}
                            onClick={() => {
                              setUserToDelete(user);
                              setDeleteDialogOpen(true);
                            }}
                            sx={{ color: '#dc2626' }}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Edit Permissions Dialog */}
          <Dialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: '24px',
                overflow: 'hidden',
              }
            }}
          >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f1f5f9' }}>
              <Typography sx={{ fontWeight: 'bold' }}>
                {editMode ? 'Edit User Information' : 'Edit Permissions'} - {selectedUser?.username}
              </Typography>
              <Button onClick={() => setDialogOpen(false)} sx={{ minWidth: 'auto' }}>
                <CloseIcon />
              </Button>
            </DialogTitle>
            <DialogContent dividers sx={{ pt: 3 }}>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <Button
                  variant={editMode ? 'contained' : 'outlined'}
                  onClick={() => setEditMode(true)}
                  sx={{ 
                    bgcolor: editMode ? '#001488' : 'transparent',
                    color: editMode ? 'white' : '#001488',
                    borderColor: '#001488',
                  }}
                >
                  User Information
                </Button>
                <Button
                  variant={!editMode ? 'contained' : 'outlined'}
                  onClick={() => setEditMode(false)}
                  sx={{ 
                    bgcolor: !editMode ? '#001488' : 'transparent',
                    color: !editMode ? 'white' : '#001488',
                    borderColor: '#001488',
                  }}
                >
                  Permissions & Role
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {editMode ? (
                  <>
                    <TextField
                      label="Username"
                      value={editFormData.username}
                      onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                      fullWidth
                      disabled={saving}
                    />
                    <TextField
                      label="Email"
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      fullWidth
                      disabled={saving}
                    />
                    <FormControl fullWidth disabled={saving}>
                      <InputLabel>Location</InputLabel>
                      <Select
                        value={editFormData.location}
                        onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                        label="Location"
                      >
                        {locations.map((loc) => (
                          <MenuItem key={loc._id} value={loc.name}>
                            {loc.name} ({loc.code})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </>
                ) : (
                  <>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                      Role
                    </Typography>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isApprover}
                          onChange={(e) => setIsApprover(e.target.checked)}
                          disabled={saving}
                        />
                      }
                      label="Approver User"
                    />

                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1e293b', mt: 2 }}>
                      Permissions
                    </Typography>

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={permissions.canRegisterItems}
                          onChange={() => handlePermissionChange('canRegisterItems')}
                          disabled={saving}
                        />
                      }
                      label="Can Register Items"
                    />

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={permissions.canIssueItems}
                          onChange={() => handlePermissionChange('canIssueItems')}
                          disabled={saving}
                        />
                      }
                      label="Can Issue Items"
                    />

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={permissions.canRequestItems}
                          onChange={() => handlePermissionChange('canRequestItems')}
                          disabled={saving}
                        />
                      }
                      label="Can Request Items"
                    />

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={permissions.canViewRequests}
                          onChange={() => handlePermissionChange('canViewRequests')}
                          disabled={saving}
                        />
                      }
                      label="Can View Requests"
                    />

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={permissions.canManageLocations}
                          onChange={() => handlePermissionChange('canManageLocations')}
                          disabled={saving}
                        />
                      }
                      label="Can Manage Locations"
                    />

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={permissions.canManageCategories}
                          onChange={() => handlePermissionChange('canManageCategories')}
                          disabled={saving}
                        />
                      }
                      label="Can Manage Categories"
                    />

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={permissions.canApproveItems}
                          onChange={() => handlePermissionChange('canApproveItems')}
                          disabled={saving}
                        />
                      }
                      label="Can Approve Items"
                    />

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={permissions.canViewReports}
                          onChange={() => handlePermissionChange('canViewReports')}
                          disabled={saving}
                        />
                      }
                      label="Can View Reports"
                    />
                  </>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
              <Button onClick={() => setDialogOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
                sx={{ bgcolor: '#001488', '&:hover': { bgcolor: '#000d5c' } }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ fontWeight: 'bold' }}>
              Delete User
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
              <Typography>
                Are you sure you want to delete <strong>{userToDelete?.username}</strong>? This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
              <Button onClick={() => setDeleteDialogOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleDeleteUser}
                disabled={saving}
              >
                {saving ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </>
  );
}
