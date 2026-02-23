'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      router.push('/');
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: InventoryIcon,
      title: 'Smart Inventory',
      description: 'Track items with real-time updates',
    },
    {
      icon: TrendingUpIcon,
      title: 'Analytics',
      description: 'Monitor stock levels and trends',
    },
    {
      icon: SecurityIcon,
      title: 'Secure',
      description: 'Enterprise-grade security',
    },
    {
      icon: SpeedIcon,
      title: 'Fast',
      description: 'Lightning-quick performance',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(135deg, #001488 0%, #000d5c 100%)',
      }}
    >
      {/* Left Side - Login Form */}
      <Box
        sx={{
          width: { xs: '100%', lg: '35%' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          minHeight: '100vh',
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 4,
            borderRadius: 4,
            background: 'white',
            width: '100%',
            maxWidth: 420,
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #001488 0%, #1a3a9e 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
                boxShadow: '0 8px 24px rgba(0, 20, 136, 0.3)',
              }}
            >
              <LockIcon sx={{ color: 'white', fontSize: 40 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#0f172a', mb: 1 }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Sign in to your inventory management system
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              margin="normal"
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: '#64748b', mr: 1 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#001488',
                  },
                },
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#64748b', mr: 1 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={loading}
                      size="small"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#001488',
                  },
                },
              }}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={loading || !username || !password}
              sx={{
                mt: 3,
                mb: 2,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #001488 0%, #000d5c 100%)',
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                py: 1.5,
                transition: 'all 0.3s ease',
                '&:hover:not(:disabled)': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 24px rgba(0, 20, 136, 0.4)',
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', pt: 2, borderTop: '1px solid #e2e8f0' }}>
            <Typography variant="body2" color="textSecondary">
              Don't have an account?
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
              Contact your administrator
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* Right Side - Features */}
      <Box
        sx={{
          width: { xs: '0%', lg: '65%' },
          display: { xs: 'none', lg: 'flex' },
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 6,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative background elements */}
        <Box
          sx={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(79, 108, 255, 0.1)',
            top: -100,
            right: -100,
            filter: 'blur(40px)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(26, 58, 158, 0.1)',
            bottom: -50,
            left: -50,
            filter: 'blur(40px)',
          }}
        />

        <Box sx={{ maxWidth: '100%', width: '100%', position: 'relative', zIndex: 1 }}>
          <Box sx={{ mb: 8 }}>
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 4,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <InventoryIcon sx={{ fontSize: 56, color: '#4f6cff' }} />
            </Box>
            <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 3, letterSpacing: '-1px', fontSize: { xs: '2rem', md: '3rem' } }}>
              Inventory Pro
            </Typography>
            <Typography variant="h5" sx={{ opacity: 0.85, fontWeight: 300, mb: 6, lineHeight: 1.8, fontSize: { xs: '1rem', md: '1.25rem' } }}>
              Professional inventory management system for modern businesses
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Grid size={{ xs: 12, sm: 6 }} key={index}>
                  <Card
                    sx={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.12)',
                        transform: 'translateY(-6px)',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.2)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Icon sx={{ fontSize: 44, mb: 2, color: '#4f6cff' }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, fontSize: '1.1rem' }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.75, lineHeight: 1.6 }}>
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          <Box sx={{ mt: 10, pt: 6, borderTop: '1px solid rgba(255, 255, 255, 0.15)' }}>
            <Typography variant="body1" sx={{ opacity: 0.6, textAlign: 'center', mb: 1, fontSize: '1rem' }}>
              Trusted by inventory managers worldwide
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.5, textAlign: 'center', display: 'block' }}>
              © 2026 Inventory Pro. All rights reserved.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
