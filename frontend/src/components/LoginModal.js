import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Backdrop
} from '@mui/material';
import { login } from '../services/api';

const LoginModal = ({ open, onClose, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await login(formData);
      
      // Store the token and user data
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Reset form
      setFormData({ email: '', password: '' });
      setError('');
      
      // Call success callback
      onLoginSuccess(response.data);
      
      // Close modal
      onClose();
    } catch (error) {
      console.error('Login error:', error);
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

  const handleClose = () => {
    if (!loading) {
      setFormData({ email: '', password: '' });
      setError('');
      onClose();
    }
  };

  return (
    <>
      {/* Blurred background backdrop */}
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
        }}
        open={open}
      />
      
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            zIndex: (theme) => theme.zIndex.drawer + 2,
          }
        }}
        disableEscapeKeyDown={loading}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            Session Expired
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Please log in again to continue
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ px: 3, py: 2 }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 1 }}>
                  {error}
                </Alert>
              )}
              
              <TextField
                name="email"
                label="Email"
                type="email"
                fullWidth
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                autoFocus
                variant="outlined"
              />
              
              <TextField
                name="password"
                label="Password"
                type="password"
                fullWidth
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                variant="outlined"
              />
            </Box>
          </form>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !formData.email || !formData.password}
            sx={{
              minWidth: 100,
              position: 'relative'
            }}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              'Login'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LoginModal;