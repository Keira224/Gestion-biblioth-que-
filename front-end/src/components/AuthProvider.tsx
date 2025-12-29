"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { clearAuth, getAccessToken, getStoredUser, storeUser } from "../lib/auth";
import type { UserProfile } from "../lib/auth";

type AuthContextValue = {
  user: UserProfile | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(() => getStoredUser());
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get<UserProfile>("/api/auth/me/");
      storeUser(response.data);
      setUser(response.data);
    } catch (error) {
      clearAuth();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    window.location.href = "/login";
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      refreshUser,
      logout,
    }),
    [user, loading, refreshUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
