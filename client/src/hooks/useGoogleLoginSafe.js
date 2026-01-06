import { useGoogleLogin } from '@react-oauth/google';
import { useCallback } from 'react';
import { useGoogleOAuthContext } from '../components/GoogleOAuthProviderSafe';

/**
 * Safe wrapper for useGoogleLogin that handles missing clientId gracefully.
 * Always calls the hook unconditionally (required by React rules), but only
 * invokes the returned function if Google OAuth is properly configured.
 */
export const useGoogleLoginSafe = (options) => {
  const { isAvailable } = useGoogleOAuthContext();
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  
  // Always call the hook unconditionally. The hook is safe even when GoogleOAuthProvider
  // is conditionally rendered, as long as this component is rendered within the provider.
  const googleLogin = useGoogleLogin(options);
  
  // Return a wrapper that checks availability before invoking the real function
  return useCallback(() => {
    if (!isAvailable || !clientId?.trim()) {
      console.warn('Google OAuth is not configured. Please set REACT_APP_GOOGLE_CLIENT_ID.');
      if (options?.onError) {
        options.onError();
      }
      return;
    }
    googleLogin();
  }, [isAvailable, clientId, googleLogin, options]);
};

