import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Paper,
  InputAdornment,
  IconButton,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Login as LoginIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  ArrowForward,
} from '@mui/icons-material';
import { login as loginAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import GoogleSignInButton from './GoogleSignInButton';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check for success message from email verification
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      if (location.state.email) {
        setFormData(prev => ({ ...prev, username: location.state.email }));
      }
    }
  }, [location.state]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await loginAPI(formData);
      
      // Store the token and user data
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Update auth context
      login(response.data);
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else if (error.response?.data?.non_field_errors) {
        setError(error.response.data.non_field_errors[0]);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: '#f5f5f5',
        '@media (max-width: 900px)': {
          background: 'white',
        },
      }}
    >
      {/* Left Side - Login Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: { xs: 2, sm: 3, md: 4, lg: 5 },
          overflow: 'auto',
          minHeight: '100vh',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 500, mx: 'auto' }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              background: 'white',
              boxShadow: { 
                xs: 'none',
                md: '0 4px 20px rgba(0,0,0,0.08)',
              },
            }}
          >
          {/* Header Section */}
          <Box
            sx={{
              py: 5,
              px: 4,
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              <LoginIcon sx={{ fontSize: 30, color: 'white' }} />
            </Box>
            <Typography component="h1" variant="h4" fontWeight={700} color="text.primary">
              Welcome Back
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Sign in to continue to your account
            </Typography>
          </Box>

          {/* Form Section */}
          <Box sx={{ px: 4, pb: 5 }}>
            {successMessage && (
              <Alert 
                severity="success" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  animation: 'slideDown 0.3s ease-out',
                  '@keyframes slideDown': {
                    from: { opacity: 0, transform: 'translateY(-10px)' },
                    to: { opacity: 1, transform: 'translateY(0)' },
                  },
                }}
              >
                {successMessage}
              </Alert>
            )}

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  animation: 'slideDown 0.3s ease-out',
                  '@keyframes slideDown': {
                    from: { opacity: 0, transform: 'translateY(-10px)' },
                    to: { opacity: 1, transform: 'translateY(0)' },
                  },
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || !formData.username || !formData.password}
                endIcon={loading ? null : <ArrowForward />}
                sx={{
                  minHeight: 56,
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.6)}`,
                    transform: 'translateY(-2px)',
                  },
                  '&:disabled': {
                    background: theme.palette.action.disabledBackground,
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Sign In'
                )}
              </Button>

              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>

              <Box sx={{ mb: 3 }}>
                <GoogleSignInButton 
                  onError={(errorMessage) => setError(errorMessage)}
                />
              </Box>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" display="inline">
                  Don't have an account?{' '}
                </Typography>
                <Link
                  to="/signup"
                  style={{
                    textDecoration: 'none',
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                  }}
                >
                  Sign Up
                </Link>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>

    {/* Right Side - Image */}
    <Box
      sx={{
        flex: 1,
        display: { xs: 'none', md: 'flex' },
        position: 'relative',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Background Image */}
      <Box
        component="img"
        src="/login-image.png"
        alt="Login illustration"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
      
      {/* Overlay with content */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.85)} 0%, ${alpha(theme.palette.primary.dark, 0.85)} 100%)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          padding: 6,
          textAlign: 'center',
          zIndex: 1,
        }}
      >
        <Typography 
          variant="h2" 
          fontWeight={700} 
          sx={{ 
            mb: 3,
            fontSize: { md: '3rem', lg: '3.5rem' },
            textShadow: '0 2px 10px rgba(0,0,0,0.2)',
          }}
        >
          Welcome Back!
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 6, 
            maxWidth: 550, 
            opacity: 0.95,
            fontSize: '1.1rem',
            lineHeight: 1.6,
            textShadow: '0 1px 5px rgba(0,0,0,0.2)',
          }}
        >
          Manage your tasks efficiently with our powerful project management tool
        </Typography>
        <Box 
          sx={{ 
            display: 'flex', 
            gap: 4,
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Box sx={{ textAlign: 'center', minWidth: 120 }}>
            <Typography 
              variant="h3" 
              fontWeight={700}
              sx={{ 
                fontSize: '2.5rem',
                mb: 1,
                textShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              1000+
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                fontSize: '0.95rem',
                opacity: 0.9,
              }}
            >
              Active Users
            </Typography>
          </Box>
          
          <Divider 
            orientation="vertical" 
            flexItem 
            sx={{ 
              borderColor: 'rgba(255,255,255,0.4)',
              height: 60,
              alignSelf: 'center',
            }} 
          />
          
          <Box sx={{ textAlign: 'center', minWidth: 120 }}>
            <Typography 
              variant="h3" 
              fontWeight={700}
              sx={{ 
                fontSize: '2.5rem',
                mb: 1,
                textShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              5000+
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                fontSize: '0.95rem',
                opacity: 0.9,
              }}
            >
              Projects
            </Typography>
          </Box>
          
          <Divider 
            orientation="vertical" 
            flexItem 
            sx={{ 
              borderColor: 'rgba(255,255,255,0.4)',
              height: 60,
              alignSelf: 'center',
            }} 
          />
          
          <Box sx={{ textAlign: 'center', minWidth: 120 }}>
            <Typography 
              variant="h3" 
              fontWeight={700}
              sx={{ 
                fontSize: '2.5rem',
                mb: 1,
                textShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              99%
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                fontSize: '0.95rem',
                opacity: 0.9,
              }}
            >
              Satisfaction
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  </Box>
  );
};

export default Login;
