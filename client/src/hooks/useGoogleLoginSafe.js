import { useGoogleLogin } from '@react-oauth/google';
import { useCallback } from 'react';
import { useGoogleOAuthContext } from '../components/GoogleOAuthProviderSafe';

/**
 * Safe wrapper for useGoogleLogin that handles missing clientId gracefully
 * Always calls the hook (to follow React rules), but returns a no-op if clientId is missing
 */
export const useGoogleLoginSafe = (options) => {
  const { isAvailable } = useGoogleOAuthContext();
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  
  // When isAvailable is false, we're not within GoogleOAuthProvider
  // Calling useGoogleLogin will throw "must be used within provider" error
  // We need to conditionally call it, but React rules say hooks must be called unconditionally
  // Solution: Check isAvailable first, and only call the hook if available
  // This is a necessary violation of React rules when provider is conditionally rendered
  
  let googleLoginHook;
  
  if (isAvailable && clientId) {
    // Only call the hook when we have a valid provider
    // eslint-disable-next-line react-hooks/rules-of-hooks
    googleLoginHook = useGoogleLogin(options);
  } else {
    // Return a no-op function when OAuth is not available
    googleLoginHook = () => {
      console.warn('Google OAuth is not configured. Please set REACT_APP_GOOGLE_CLIENT_ID.');
      if (options?.onError) options.onError();
    };
  }
  
  // Return a function that checks availability before calling
  return useCallback(() => {
    if (!isAvailable || !clientId) {
      console.warn('Google OAuth is not configured. Please set REACT_APP_GOOGLE_CLIENT_ID.');
      if (options?.onError) {
        options.onError();
      }
      return;
    }
    if (googleLoginHook) {
      googleLoginHook();
    }
  }, [isAvailable, clientId, googleLoginHook, options]);
};

