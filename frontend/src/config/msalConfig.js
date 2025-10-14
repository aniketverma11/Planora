/**
 * MSAL (Microsoft Authentication Library) Configuration
 * Configure Microsoft OAuth authentication for the application
 */

import { PublicClientApplication } from '@azure/msal-browser';

// MSAL configuration
export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_MICROSOFT_CLIENT_ID || 'your-microsoft-client-id',
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_MICROSOFT_TENANT_ID || 'common'}`,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage', // Store tokens in session storage
    storeAuthStateInCookie: false,
  },
};

// Scopes for accessing Microsoft Graph API
export const loginRequest = {
  scopes: ['User.Read'],
};

// Create MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);

// Initialize MSAL
export const initializeMsal = async () => {
  try {
    await msalInstance.initialize();
    console.log('✅ MSAL initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing MSAL:', error);
  }
};
