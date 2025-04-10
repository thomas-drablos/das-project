import React, { createContext, useContext, useEffect, useState } from "react"
import useApiToken from "./hooks/useApiToken";
import { getJson, postJson } from "./util";
import { useAuth0 } from "@auth0/auth0-react";

export interface AppUser {
  loading: boolean,
  userId?: string,
  name?: string
}

const AppUserContext = createContext<AppUser|undefined>({loading: true});

export const AppUserProvider = ({children}: React.ProviderProps<AppUser|undefined>) => {
  const { apiToken } = useApiToken();
  const { user } = useAuth0();
  const [ value, setValue ] = useState<AppUser>({loading: true});

  const registerNewUser = async () => {
    const data = await postJson<any>('/api/register', {
      name: user?.preferred_username || user?.nickname || user?.name,
      email: user?.email,
    }, apiToken);

    setValue({
      loading: false,
      userId: data?.userId,
      name: data?.name,
    });
  };

  useEffect(() => {
    if (apiToken === undefined)
      return;

    getJson<any>('/api/userinfo', apiToken)
      .then(data => {
        const exists = data?.exists;
        if (exists === false) {
          registerNewUser();
        }

        else if (exists === true) {
          setValue({
            loading: false,
            userId: data?.userId,
            name: data?.name,
          });
        }
        else
          console.log('Bad userinfo response');
      })
      .catch(err => {
        console.log(err);
      });
  }, [apiToken]);

  return <AppUserContext.Provider value={value}>{children}</AppUserContext.Provider>
}

export function useAppUser() {
  const value = useContext(AppUserContext);
  if (value === undefined) {
    throw new Error('useAppUser must be within an AppUserProvider');
  }

  return value;
}
