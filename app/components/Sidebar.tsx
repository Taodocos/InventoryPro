'use client';

import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Collapse,
  Avatar,
  Button,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  Description as DescriptionIcon,
  ExpandLess,
  ExpandMore,
  Inventory2 as ReportIcon,
  Logout as LogoutIcon,
  PersonAdd as PersonAddIcon,
  Settings as SettingsIcon,
  LocationOn as LocationIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [reportsOpen, setReportsOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    fetchUser();
    
    // Refetch user data every 5 seconds to get updated permissions
    const interval = setInterval(fetchUser, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/auth/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: DashboardIcon, path: '/dashboard', requiresPermission: null },
    { text: 'Register Item', icon: InventoryIcon, path: '/forms/newItem', requiresPermission: 'canRegisterItems' },
    { text: 'Issue Item', icon: AssignmentIcon, path: '/forms/issueItem', requiresPermission: 'canIssueItems' },
    { text: 'Request Item', icon: DescriptionIcon, path: '/forms/requestItem', requiresPermission: 'canRequestItems' },
  ];

  const approverItems = currentUser?.isApprover ? [
    { text: 'Approvals', icon: AssessmentIcon, path: '/approver/dashboard' },
  ] : [];

  const reportItems = [
    { text: 'Registered Items', icon: DescriptionIcon, path: '/reports/registered', requiresPermission: 'canViewReports' },
    { text: 'Issued Items', icon: AssessmentIcon, path: '/reports/issued', requiresPermission: 'canViewReports' },
  ];

  const adminItems = [
    { text: 'Users', icon: PersonAddIcon, path: '/admin/users', requiresPermission: null },
    { text: 'Locations', icon: LocationIcon, path: '/admin/locations', requiresPermission: 'canManageLocations' },
    { text: 'Categories', icon: CategoryIcon, path: '/admin/categories', requiresPermission: 'canManageCategories' },
    { text: 'View Requests', icon: AssignmentIcon, path: '/admin/requests', requiresPermission: 'canViewRequests' },
  ];

  const hasPermission = (permission: string | null): boolean => {
    if (!permission) return true; // No permission required
    if (currentUser?.isAdmin) return true; // Admins have all permissions
    return currentUser?.permissions?.[permission as keyof typeof currentUser.permissions] || false;
  };

  const filterMenuItems = (items: any[]) => {
    return items.filter(item => hasPermission(item.requiresPermission));
  };

  const isActive = (path: string) => pathname === path;

  return (
    <Box
      sx={{
        width: 260,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        background: 'linear-gradient(180deg, #001488 0%, #000d5c 100%)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {/* Logo */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 42,
              height: 42,
              background: 'linear-gradient(135deg, #4f6cff 0%, #001488 100%)',
              fontSize: '1.2rem',
              fontWeight: 'bold',
            }}
          >
            IP
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.5px' }}>
              Inventory Pro
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              Management System
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, px: 2, py: 1 }}>
        <Typography variant="overline" sx={{ color: '#94a3b8', px: 1.5, fontSize: '0.65rem', letterSpacing: '1px' }}>
          Main Menu
        </Typography>
        
        <List sx={{ mt: 1 }}>
          {filterMenuItems(menuItems).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <ListItem
                key={item.text}
                component={Link}
                href={item.path}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  py: 1.2,
                  px: 1.5,
                  color: active ? '#fff' : '#94a3b8',
                  background: active ? 'linear-gradient(135deg, #1a3a9e 0%, #4f6cff 100%)' : 'transparent',
                  boxShadow: active ? '0 4px 15px rgba(79, 108, 255, 0.3)' : 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: active ? 'linear-gradient(135deg, #1a3a9e 0%, #4f6cff 100%)' : 'rgba(255,255,255,0.08)',
                    color: '#fff',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                  <Icon sx={{ fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  slotProps={{ primary: { sx: { fontSize: '0.875rem', fontWeight: active ? 600 : 400 } } }}
                />
              </ListItem>
            );
          })}
        </List>

        <Typography variant="overline" sx={{ color: '#94a3b8', px: 1.5, fontSize: '0.65rem', letterSpacing: '1px', mt: 3, display: 'block' }}>
          Reports
        </Typography>

        <List sx={{ mt: 1 }}>
          <ListItem
            component="div"
            onClick={() => setReportsOpen(!reportsOpen)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              py: 1.2,
              px: 1.5,
              color: '#94a3b8',
              cursor: 'pointer',
              '&:hover': { background: 'rgba(255,255,255,0.08)', color: '#fff' },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
              <ReportIcon sx={{ fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText primary="Reports" slotProps={{ primary: { sx: { fontSize: '0.875rem', fontWeight: 500 } } }} />
            {reportsOpen ? <ExpandLess sx={{ fontSize: 18 }} /> : <ExpandMore sx={{ fontSize: 18 }} />}
          </ListItem>

          <Collapse in={reportsOpen} timeout="auto">
            <List disablePadding sx={{ pl: 2 }}>
              {filterMenuItems(reportItems).map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <ListItem
                    key={item.text}
                    component={Link}
                    href={item.path}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      py: 1,
                      px: 1.5,
                      color: active ? '#4f6cff' : '#64748b',
                      background: active ? 'rgba(79, 108, 255, 0.15)' : 'transparent',
                      borderLeft: active ? '2px solid #4f6cff' : '2px solid transparent',
                      '&:hover': { background: 'rgba(79, 108, 255, 0.15)', color: '#4f6cff' },
                    }}
                  >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 32 }}>
                      <Icon sx={{ fontSize: 18 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      slotProps={{ primary: { sx: { fontSize: '0.8rem', fontWeight: active ? 600 : 400 } } }}
                    />
                  </ListItem>
                );
              })}
            </List>
          </Collapse>
        </List>

        {currentUser?.isApprover && (
          <>
            <Typography variant="overline" sx={{ color: '#94a3b8', px: 1.5, fontSize: '0.65rem', letterSpacing: '1px', mt: 3, display: 'block' }}>
              Approver
            </Typography>

            <List sx={{ mt: 1 }}>
              {approverItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <ListItem
                    key={item.text}
                    component={Link}
                    href={item.path}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      py: 1.2,
                      px: 1.5,
                      color: active ? '#fff' : '#94a3b8',
                      background: active ? 'linear-gradient(135deg, #1a3a9e 0%, #4f6cff 100%)' : 'transparent',
                      boxShadow: active ? '0 4px 15px rgba(79, 108, 255, 0.3)' : 'none',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: active ? 'linear-gradient(135deg, #1a3a9e 0%, #4f6cff 100%)' : 'rgba(255,255,255,0.08)',
                        color: '#fff',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                      <Icon sx={{ fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      slotProps={{ primary: { sx: { fontSize: '0.875rem', fontWeight: active ? 600 : 400 } } }}
                    />
                  </ListItem>
                );
              })}
            </List>
          </>
        )}

        {currentUser?.isAdmin && (
          <>
            <Typography variant="overline" sx={{ color: '#94a3b8', px: 1.5, fontSize: '0.65rem', letterSpacing: '1px', mt: 3, display: 'block' }}>
              Admin
            </Typography>

            <List sx={{ mt: 1 }}>
              {filterMenuItems(adminItems).map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <ListItem
                    key={item.text}
                    component={Link}
                    href={item.path}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      py: 1.2,
                      px: 1.5,
                      color: active ? '#fff' : '#94a3b8',
                      background: active ? 'linear-gradient(135deg, #1a3a9e 0%, #4f6cff 100%)' : 'transparent',
                      boxShadow: active ? '0 4px 15px rgba(79, 108, 255, 0.3)' : 'none',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: active ? 'linear-gradient(135deg, #1a3a9e 0%, #4f6cff 100%)' : 'rgba(255,255,255,0.08)',
                        color: '#fff',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                      <Icon sx={{ fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      slotProps={{ primary: { sx: { fontSize: '0.875rem', fontWeight: active ? 600 : 400 } } }}
                    />
                  </ListItem>
                );
              })}
            </List>
          </>
        )}

        {currentUser?.permissions?.canViewRequests && !currentUser?.isAdmin && (
          <>
            <Typography variant="overline" sx={{ color: '#94a3b8', px: 1.5, fontSize: '0.65rem', letterSpacing: '1px', mt: 3, display: 'block' }}>
              Requests
            </Typography>

            <List sx={{ mt: 1 }}>
              <ListItem
                component={Link}
                href="/admin/requests"
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  py: 1.2,
                  px: 1.5,
                  color: isActive('/admin/requests') ? '#fff' : '#94a3b8',
                  background: isActive('/admin/requests') ? 'linear-gradient(135deg, #1a3a9e 0%, #4f6cff 100%)' : 'transparent',
                  boxShadow: isActive('/admin/requests') ? '0 4px 15px rgba(79, 108, 255, 0.3)' : 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: isActive('/admin/requests') ? 'linear-gradient(135deg, #1a3a9e 0%, #4f6cff 100%)' : 'rgba(255,255,255,0.08)',
                    color: '#fff',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                  <AssignmentIcon sx={{ fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText
                  primary="View Requests"
                  slotProps={{ primary: { sx: { fontSize: '0.875rem', fontWeight: isActive('/admin/requests') ? 600 : 400 } } }}
                />
              </ListItem>
            </List>
          </>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ p: 3, pt: 2, mt: 'auto' }}>
        {currentUser && (
          <>
            <Box
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                p: 2,
                borderRadius: 3,
                background: 'rgba(79, 108, 255, 0.1)',
                border: '1px solid rgba(79, 108, 255, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': { background: 'rgba(79, 108, 255, 0.2)' },
                mb: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    background: 'linear-gradient(135deg, #4f6cff 0%, #001488 100%)',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                  }}
                >
                  {currentUser.username.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ color: '#f8fafc', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentUser.username}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    {currentUser.isAdmin ? 'Admin' : 'User'}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              {currentUser.isAdmin && [
                <MenuItem
                  key="register"
                  onClick={() => {
                    router.push('/auth/register');
                    setAnchorEl(null);
                  }}
                >
                  <PersonAddIcon sx={{ mr: 2, fontSize: 20 }} />
                  Register User
                </MenuItem>,
                <Divider key="divider" />,
              ]}
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 2, fontSize: 20 }} />
                Logout
              </MenuItem>
            </Menu>

            {currentUser.isAdmin && (
              <Button
                fullWidth
                variant="outlined"
                startIcon={<PersonAddIcon />}
                onClick={() => router.push('/auth/register')}
                sx={{
                  color: '#cbd5e1',
                  borderColor: 'rgba(79, 108, 255, 0.3)',
                  textTransform: 'none',
                  mb: 1,
                  '&:hover': {
                    borderColor: '#4f6cff',
                    background: 'rgba(79, 108, 255, 0.1)',
                  },
                }}
              >
                Register User
              </Button>
            )}

            <Button
              fullWidth
              variant="text"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                color: '#cbd5e1',
                textTransform: 'none',
                '&:hover': { background: 'rgba(255, 0, 0, 0.1)', color: '#ff6b6b' },
              }}
            >
              Logout
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
};

export default Sidebar;
