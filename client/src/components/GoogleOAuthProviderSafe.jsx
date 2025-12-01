import React, { createContext, useContext } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Create a context to track if Google OAuth is actually available
const GoogleOAuthContext = createContext({ isAvailable: false });

export const useGoogleOAuthContext = () => useContext(GoogleOAuthContext);

/**
 * Safe wrapper for GoogleOAuthProvider that only initializes when clientId is valid
 * Uses Error Boundary to catch initialization errors when clientId is missing
 */
export const GoogleOAuthProviderSafe = ({ clientId, children }) => {
  const hasValidClientId = clientId && clientId.trim() !== '';
  
  if (hasValidClientId) {
    return (
      <GoogleOAuthProvider clientId={clientId}>
        <GoogleOAuthContext.Provider value={{ isAvailable: true }}>
          {children}
        </GoogleOAuthContext.Provider>
      </GoogleOAuthProvider>
    );
  }
  
  // When no valid clientId, don't provide GoogleOAuthProvider (it will error on initialization)
  // Just provide our context indicating OAuth is not available
  // Components should check isAvailable before using Google OAuth features
  return (
    <GoogleOAuthContext.Provider value={{ isAvailable: false }}>
      {children}
    </GoogleOAuthContext.Provider>
  );
};

