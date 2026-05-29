"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "./api";
import { tokenStore } from "./token-store";
import type { User } from "./types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount: verify stored token with the server.
  // If invalid/expired, clear the session so stale localStorage doesn't keep users "logged in".
  useEffect(() => {
    const storedUser = tokenStore.getUser();
    const accessToken = tokenStore.getAccess();

    if (!storedUser || !accessToken) {
      setLoading(false);
      return;
    }

    api.auth.me()
      .then((res) => {
        setUser(res.data as User);
      })
      .catch(() => {
        tokenStore.clear();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.auth.login(email, password);
    tokenStore.setTokens(res.data.accessToken, res.data.refreshToken);
    tokenStore.setUser(res.data.user);
    setUser(res.data.user);
  }, []);

  const logout = useCallback(async () => {
    const refresh = tokenStore.getRefresh();
    if (refresh) {
      try {
        await api.auth.logout(refresh);
      } catch {
        /* best effort */
      }
    }
    tokenStore.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
