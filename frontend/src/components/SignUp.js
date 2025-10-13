import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
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
  PersonAdd as PersonAddIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  CheckCircle,
} from '@mui/icons-material';
import { signup } from '../services/api';
import GoogleSignInButton from './GoogleSignInButton';

const SignUp = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = formData;
      await signup(submitData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Signup failed:', error);
      if (error.response?.data?.username) {
        setError(`Username: ${error.response.data.username[0]}`);
      } else if (error.response?.data?.email) {
        setError(`Email: ${error.response.data.email[0]}`);
      } else if (error.response?.data?.password) {
        setError(`Password: ${error.response.data.password[0]}`);
      } else {
        setError('Registration failed. Please try again.');
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
      {/* Left Side - SignUp Form */}
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
              <PersonAddIcon sx={{ fontSize: 30, color: 'white' }} />
            </Box>
            <Typography component="h1" variant="h4" fontWeight={700} color="text.primary">
              Create Account
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Join us to get started with task management
            </Typography>
          </Box>

          {/* Form Section */}
          <Box sx={{ px: 4, pb: 5 }}>
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

            {success && (
              <Alert 
                severity="success" 
                icon={<CheckCircle />}
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  animation: 'slideDown 0.3s ease-out',
                }}
              >
                Account created successfully! Redirecting to login...
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
                disabled={loading || success}
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
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading || success}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
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
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading || success}
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
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading || success}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                disabled={loading || success}
                endIcon={loading ? null : <CheckCircle />}
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
                ) : success ? (
                  'Account Created!'
                ) : (
                  'Create Account'
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
                  Already have an account?{' '}
                </Typography>
                <Link
                  to="/login"
                  style={{
                    textDecoration: 'none',
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                  }}
                >
                  Sign In
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
        alt="Sign up illustration"
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
          Join Us Today!
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
          Start your journey with the best task management platform
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
              Free
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                fontSize: '0.95rem',
                opacity: 0.9,
              }}
            >
              Forever
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
              Easy
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                fontSize: '0.95rem',
                opacity: 0.9,
              }}
            >
              Setup
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
              24/7
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                fontSize: '0.95rem',
                opacity: 0.9,
              }}
            >
              Support
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  </Box>
  );
};

export default SignUp;
