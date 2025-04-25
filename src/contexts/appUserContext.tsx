import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import { useApiToken } from "./apiTokenContext";
import { getJson, postJson } from "../util";
import { useAuth0 } from "@auth0/auth0-react";
import { RegisteredUserResponse, UserInfoResponse } from "../types";

export interface AppUser {
  loading: boolean;
  userId?: string;
  name?: string;
}

const AppUserContext = createContext<AppUser | undefined>(undefined);

export const AppUserProvider = ({ children }: React.PropsWithChildren) => {
  const { apiToken } = useApiToken();
  const { user } = useAuth0();
  const [value, setValue] = useState<AppUser>({ loading: true });

  const registerNewUser = useCallback(async () => {
    const data = await postJson<RegisteredUserResponse>(
      '/api/register',
      {
        name: user?.preferred_username ?? user?.nickname ?? user?.name,
        email: user?.email,
      }, apiToken);

    setValue({
      loading: false,
      userId: data.userId,
      name: data.name,
    });
  }, [user, apiToken]);

  useEffect(() => {
    if (apiToken === undefined) return;

    getJson<UserInfoResponse>('/api/userinfo', apiToken)
      .then(data => {
        const exists = data.exists;
        if (!exists) {
          void registerNewUser();
        }
        else {
          setValue({
            loading: false,
            userId: data.userId,
            name: data.name,
          });
        }
      })
      .catch((err: unknown) => {
        console.log(err);
      });
  }, [apiToken, registerNewUser]);

  return (
    <AppUserContext.Provider value={value}>{children}</AppUserContext.Provider>
  );
};

export function useAppUser(): AppUser {
  const value = useContext(AppUserContext);
  if (value === undefined) {
    throw new Error("useAppUser must be within an AppUserProvider");
  }

  return value;
}
