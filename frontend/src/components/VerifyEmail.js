import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import axios from 'axios';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userEmail, setUserEmail] = useState('');
  
  // Password form states
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Resend email states
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);

  // Extract token from URL
  const getTokenFromUrl = () => {
    const params = new URLSearchParams(location.search);
    return params.get('token');
  };

  // Check token validity on component mount
  useEffect(() => {
    const checkToken = async () => {
      const token = getTokenFromUrl();
      
      if (!token) {
        setError('Invalid verification link. No token found.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/users/check-token/?token=${token}`
        );
        
        if (response.data.valid) {
          setTokenValid(true);
          setUserEmail(response.data.email || '');
        } else {
          setError(response.data.error || 'Invalid or expired verification token.');
          setUserEmail(response.data.email || '');
        }
      } catch (err) {
        setError(
          err.response?.data?.error || 
          'Failed to validate token. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    checkToken();
  }, [location.search]);

  // Handle password submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const token = getTokenFromUrl();
    setSubmitting(true);

    try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/users/verify-email/`,
      {
        token: token,
        password: password,
      }
    );

      setSuccess(response.data.message || 'Email verified successfully!');
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Email verified! Please log in with your new password.',
            email: userEmail 
          } 
        });
      }, 2000);
      
    } catch (err) {
      setError(
        err.response?.data?.error || 
        'Failed to verify email. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handle resend verification email
  const handleResend = async () => {
    if (!resendEmail) {
      setError('Please enter your email address.');
      return;
    }

    setResending(true);
    setError('');
    setSuccess('');

    try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/users/resend-verification/`,
      { email: resendEmail }
    );

      setSuccess(response.data.message || 'Verification email sent! Please check your inbox.');
      setResendEmail('');
      
    } catch (err) {
      setError(
        err.response?.data?.error || 
        'Failed to resend verification email. Please try again.'
      );
    } finally {
      setResending(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Validating your verification link...
          </Typography>
        </Paper>
      </Container>
    );
  }

  // Valid token - show password setup form
  if (tokenValid) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Welcome to Task Management!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {userEmail && `Verifying: ${userEmail}`}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Please set your password to complete verification
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              margin="normal"
              helperText="Minimum 8 characters"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              type={showConfirmPassword ? 'text' : 'password'}
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={submitting}
              sx={{ mt: 3, mb: 2 }}
            >
              {submitting ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  Verifying...
                </>
              ) : (
                'Set Password & Verify Email'
              )}
            </Button>
          </form>
        </Paper>
      </Container>
    );
  }

  // Invalid or expired token - show resend option
  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <ErrorIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Verification Link Expired
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {error || 'This verification link has expired or is invalid.'}
          </Typography>
        </Box>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {error && !success && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Request New Verification Email
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter your email address to receive a new verification link
          </Typography>

          <TextField
            fullWidth
            type="email"
            label="Email Address"
            value={resendEmail}
            onChange={(e) => setResendEmail(e.target.value)}
            placeholder={userEmail || 'your.email@example.com'}
            margin="normal"
          />

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleResend}
            disabled={resending}
            sx={{ mt: 2 }}
          >
            {resending ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Sending...
              </>
            ) : (
              'Send New Verification Email'
            )}
          </Button>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={() => navigate('/login')}
            sx={{ mt: 2 }}
          >
            Back to Login
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default VerifyEmail;
