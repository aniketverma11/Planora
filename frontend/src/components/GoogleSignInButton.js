import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { googleAuth } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const GoogleSignInButton = ({ onError }) => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      console.log('✅ Google Sign-In successful, sending token to backend');
      
      // Send the Google credential to our backend
      const response = await googleAuth(credentialResponse.credential);
      
      console.log('✅ Backend authentication successful:', response.data);
      
      // Store the token and user data
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Update auth context
      login(response.data);
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('❌ Google authentication failed:', error);
      if (onError) {
        onError(error.response?.data?.error || 'Google authentication failed. Please try again.');
      }
    }
  };

  const handleGoogleError = () => {
    console.error('❌ Google Sign-In failed');
    if (onError) {
      onError('Google Sign-In failed. Please try again.');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        useOneTap={false}
        theme="filled_blue"
        size="large"
        width="100%"
        text="continue_with"
        shape="rectangular"
      />
    </Box>
  );
};

export default GoogleSignInButton;
