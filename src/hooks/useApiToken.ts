import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

function useApiToken(requiresAuth: boolean = false) {
  const { getAccessTokenSilently, getAccessTokenWithPopup, isAuthenticated } = useAuth0();
  const [apiToken, setApiToken] = useState<string|undefined>(undefined);
  const [needsConsent, setNeedsConsent] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');

  // Get consent from user to connect application account
  const getConsent = async () => {
    await getAccessTokenWithPopup({
      authorizationParams: {audience: 'http://api.cometcommerce.com'},
    })
      .then(token => {
        setApiToken(token);
        setNeedsConsent(false);
        setAuthError('');
      })
      .catch(error => {
        setAuthError(`Error linking account: ${error}`);
        console.log(`Error getting consent to link account: ${error?.error}`);
        console.log(error);
      });
  }

  useEffect(() => {
    getAccessTokenSilently({
      authorizationParams: {audience: 'http://api.cometcommerce.com'},
    })
      .then(token => {
        setApiToken(token);
        setNeedsConsent(false);
        setAuthError('');
      })
      .catch(error => {
        // We already have token, so disregard any latent errors
        if (apiToken !== undefined)
          return;

        if (error.error === 'login_required' && requiresAuth) {
          console.log('Page requires auth, but user not logged in. Should enforce authentication on this route');
          setAuthError('Please log-in');
        }
        else if (error.error === 'consent_required' && isAuthenticated) {
          setNeedsConsent(true);
        }
        else {
          setAuthError(`Log-in error: ${error}`);
          console.log(error);
        }
        console.log(error);
      })
  }, [getAccessTokenSilently, isAuthenticated]);

  return {
    apiToken,
    needsConsent,
    getConsent,
    authError,
  };
}

export default useApiToken;
