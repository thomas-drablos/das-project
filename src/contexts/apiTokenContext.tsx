import { useAuth0 } from "@auth0/auth0-react";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface ApiTokenResult {
  apiToken?: string,
  needsConsent: boolean,
  getConsent: () => void,
  authError: string
}

interface ApiTokenContextType {
  result: ApiTokenResult,
  changeNumRequiresAuth: (n:number) => void
}

const ApiTokenContext = createContext<ApiTokenContextType|undefined>(undefined);

export const ApiTokenProvider = ({children}: React.PropsWithChildren) => {
  const { getAccessTokenSilently, getAccessTokenWithPopup, isAuthenticated } = useAuth0();
  const [apiToken, setApiToken] = useState<string|undefined>(undefined);
  const [needsConsent, setNeedsConsent] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');

  const [numRequiresAuth, setNumRequiresAuth] = useState<number>(0);
  const requiresAuth = numRequiresAuth > 0;

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
        setAuthError(`Error linking account: ${error.error}`);
        console.log(`Error getting consent to link account: ${error?.error}`);
        console.log(error);
      });
  };

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

        if (error.error === 'login_required') {
          if (requiresAuth) {
            console.log('Page requires auth, but user not logged in. Should enforce authentication on this route');
            setAuthError('Please log-in');
          }
        }
        else if (error.error === 'consent_required' && isAuthenticated) {
          setNeedsConsent(true);
          setAuthError('');
        }
        else {
          setAuthError(`Log-in error: ${error.error}`);
          console.log(`Log-in error: ${error.error}`);
          console.log(error);
        }
        console.log(error);
      })
  }, [getAccessTokenSilently, isAuthenticated]);

  const value: ApiTokenContextType = {
    result: {
      apiToken,
      needsConsent,
      getConsent,
      authError,
    },
    changeNumRequiresAuth: n => {
      setNumRequiresAuth(numRequiresAuth + n);
    }
  };
  return <ApiTokenContext.Provider value={value}>{children}</ApiTokenContext.Provider>;
}

export function useApiToken(requiresAuth=false): ApiTokenResult {
  const value = useContext(ApiTokenContext);
  if (value === undefined) {
    throw new Error('useApiToken must be used within an ApiTokenProvider');
  }

  useEffect(() => {
    if (requiresAuth) {
      value.changeNumRequiresAuth(1);
      return () => { value.changeNumRequiresAuth(-1); };
    }
  }, [requiresAuth]);

  return value.result;
}
