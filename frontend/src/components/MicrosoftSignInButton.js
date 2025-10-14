import React, { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../config/msalConfig';
import { microsoftAuth } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const MicrosoftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 23 23"
    width="18"
    height="18"
    style={{ marginRight: '8px' }}
  >
    <path fill="#f3f3f3" d="M0 0h23v23H0z" />
    <path fill="#f35325" d="M1 1h10v10H1z" />
    <path fill="#81bc06" d="M12 1h10v10H12z" />
    <path fill="#05a6f0" d="M1 12h10v10H1z" />
    <path fill="#ffba08" d="M12 12h10v10H12z" />
  </svg>
);

const MicrosoftSignInButton = ({ onSuccess, onError }) => {
  const navigate = useNavigate();
  const { instance } = useMsal();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleMicrosoftSignIn = async () => {
    try {
      setLoading(true);
      console.log('🔵 Starting Microsoft sign-in...');

      // Initiate Microsoft login popup
      const loginResponse = await instance.loginPopup(loginRequest);
      console.log('✅ Microsoft login successful:', loginResponse);

      // Get the access token
      const accessToken = loginResponse.accessToken;

      if (!accessToken) {
        throw new Error('No access token received from Microsoft');
      }

      console.log('📤 Sending token to backend...');
      
      // Send token to backend for verification and user creation/login
      const response = await microsoftAuth(accessToken);
      
      console.log('✅ Backend authentication successful:', response.data);

      // Store tokens and user data
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Update auth context
      login(response.data.user, response.data.access);

      // Navigate to dashboard
      navigate('/dashboard');

      if (onSuccess) {
        onSuccess(response.data);
      }

    } catch (error) {
      console.error('❌ Microsoft sign-in error:', error);
      
      let errorMessage = 'Failed to sign in with Microsoft';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      if (onError) {
        onError(errorMessage);
      } else {
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      fullWidth
      variant="outlined"
      onClick={handleMicrosoftSignIn}
      disabled={loading}
      sx={{
        mt: 2,
        py: 1.5,
        textTransform: 'none',
        fontSize: '1rem',
        borderColor: '#dadce0',
        color: '#3c4043',
        backgroundColor: 'white',
        '&:hover': {
          borderColor: '#d2e3fc',
          backgroundColor: '#f8f9fa',
        },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {loading ? (
        <CircularProgress size={24} />
      ) : (
        <>
          <MicrosoftIcon />
          Sign in with Microsoft
        </>
      )}
    </Button>
  );
};

export default MicrosoftSignInButton;
