import React, { createContext, useContext, useState, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';
import LoginModal from '../components/LoginModal';
import { getTokenRemainingTime } from '../utils/tokenUtils';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expiryNotification, setExpiryNotification] = useState({
    show: false,
    message: '',
    severity: 'warning'
  });

  // Check for existing authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  // Listen for token expiration events
  useEffect(() => {
    const handleTokenExpired = () => {
      setUser(null);
      setIsAuthenticated(false);
      setShowLoginModal(true);
    };

    window.addEventListener('tokenExpired', handleTokenExpired);
    
    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpired);
    };
  }, []);

  // Check token expiry periodically and show notifications
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkTokenExpiry = () => {
      const token = localStorage.getItem('token');
      const timeLeft = getTokenRemainingTime(token);
      
      if (timeLeft) {
        const minutesLeft = Math.floor(timeLeft.total / (1000 * 60));
        
        // Show warning at 10 and 5 minutes
        if (minutesLeft === 10) {
          setExpiryNotification({
            show: true,
            message: 'Your session will expire in 10 minutes',
            severity: 'warning'
          });
        } else if (minutesLeft === 5) {
          setExpiryNotification({
            show: true,
            message: 'Your session will expire in 5 minutes',
            severity: 'error'
          });
        }
      }
    };

    // Check immediately and then every minute
    checkTokenExpiry();
    const interval = setInterval(checkTokenExpiry, 60000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const login = (userData) => {
    setUser(userData.user);
    setIsAuthenticated(true);
    setShowLoginModal(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const handleLoginModalClose = () => {
    setShowLoginModal(false);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    showLoginModal: () => setShowLoginModal(true)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <LoginModal
        open={showLoginModal}
        onClose={handleLoginModalClose}
        onLoginSuccess={login}
      />
      
      {/* Snackbar for token expiry notifications */}
      <Snackbar
        open={expiryNotification.show}
        autoHideDuration={6000}
        onClose={() => setExpiryNotification({ ...expiryNotification, show: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setExpiryNotification({ ...expiryNotification, show: false })} 
          severity={expiryNotification.severity}
          sx={{ width: '100%' }}
        >
          {expiryNotification.message}
        </Alert>
      </Snackbar>
    </AuthContext.Provider>
  );
};

export default AuthContext;