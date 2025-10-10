import React, { createContext, useContext, useState, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';
import LoginModal from '../components/LoginModal';
import { getTokenRemainingTime, isTokenExpired } from '../utils/tokenUtils';

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
    console.log('🔄 AuthContext: Checking authentication on mount...');
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    console.log('📦 Token exists:', !!token);
    console.log('📦 User data exists:', !!userData);
    
    if (token && userData) {
      // Check if token is expired
      const expired = isTokenExpired(token);
      console.log('⏰ Token expired:', expired);
      
      if (expired) {
        // Token is expired, clear storage
        console.log('❌ Token expired on page load, clearing auth data');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoading(false);
        return;
      }
      
      // Token is valid, restore authentication
      try {
        const parsedUser = JSON.parse(userData);
        console.log('✅ Token valid, restoring user:', parsedUser.username);
        setUser(parsedUser);
        setIsAuthenticated(true);
        console.log('✅ Authentication restored successfully');
      } catch (error) {
        console.error('❌ Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      console.log('❌ No token or user data found in localStorage');
    }
    setIsLoading(false);
    console.log('✅ AuthContext initialization complete');
  }, []);

  // Listen for token expiration events
  useEffect(() => {
    const handleTokenExpired = () => {
      console.log('⚠️ tokenExpired event received');
      setUser(null);
      setIsAuthenticated(false);
      setShowLoginModal(true);
    };

    window.addEventListener('tokenExpired', handleTokenExpired);
    console.log('👂 Listening for tokenExpired events');
    
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
    console.log('🔐 Login called with user:', userData.user?.username);
    setUser(userData.user);
    setIsAuthenticated(true);
    setShowLoginModal(false);
    console.log('✅ User logged in successfully');
  };

  const logout = () => {
    console.log('🚪 Logout called');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    console.log('✅ User logged out successfully');
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