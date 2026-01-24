"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { User, AuthState } from "@/lib/types";

interface AuthContextType {
  isReady: boolean;
  refreshKey: number;
  authState: AuthState;
  redirectToPortal: (reason?: string) => void;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    error: null,
  });

  const portalUrl =
    process.env.NEXT_PUBLIC_AI_PORTAL_URL || "http://localhost:3000";

  const redirectToPortal = useCallback(
    (reason?: string) => {
      const params = new URLSearchParams();
      if (reason) {
        params.set("reason", reason);
      }
      // Redirect to portal with return URL
      const returnUrl = window.location.href;
      params.set("return", returnUrl);
      window.location.href = `${portalUrl}?${params.toString()}`;
    },
    [portalUrl]
  );

  const logout = useCallback(async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("[Auth] Logout error:", error);
    }

    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
    });

    // Redirect to portal after logout
    redirectToPortal("logged_out");
  }, [redirectToPortal]);

  const setUser = useCallback((user: User | null) => {
    setAuthState({
      isAuthenticated: !!user,
      user,
      isLoading: false,
      error: null,
    });
  }, []);

  // Initialize auth state
  useEffect(() => {
    async function initAuth() {
      try {
        const res = await fetch("/api/session", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          if (data.isAuthenticated && data.user) {
            setAuthState({
              isAuthenticated: true,
              user: data.user,
              isLoading: false,
              error: null,
            });
          } else {
            setAuthState({
              isAuthenticated: false,
              user: null,
              isLoading: false,
              error: null,
            });
          }
        } else {
          setAuthState({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error("[Auth] Init error:", error);
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: "Failed to initialize authentication",
        });
      } finally {
        setIsReady(true);
      }
    }

    initAuth();
  }, []);

  // Refresh auth state
  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isReady,
        refreshKey,
        authState,
        redirectToPortal,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
