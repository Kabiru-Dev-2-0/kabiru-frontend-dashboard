"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import type { AuthorRole, DashboardSessionUser } from "@/types/auth";

export interface AuthContextValue {
  user: DashboardSessionUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  canCreateCustomModule: boolean;
  refreshSession: () => Promise<DashboardSessionUser | null>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<DashboardSessionUser | null>>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function canAuthorCustomModules(role?: AuthorRole | null): boolean {
  return role === "developer" || role === "admin";
}

export function AuthProvider({
  children,
  requireAuth = true,
}: {
  children: React.ReactNode;
  requireAuth?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = React.useState<DashboardSessionUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const refreshSession = React.useCallback(async (): Promise<DashboardSessionUser | null> => {
    try {
      const res = await apiFetch<{ user: DashboardSessionUser }>("/api/auth/session", {
        method: "GET",
        skipUnauthorizedRedirect: true,
      });
      const resolvedUser = res.data?.user ?? null;
      setUser(resolvedUser);
      return resolvedUser;
    } catch (error) {
      if (error instanceof ApiClientError && (error.status === 401 || error.status === 403)) {
        setUser(null);
        return null;
      }
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let active = true;
    setIsLoading(true);

    apiFetch<{ user: DashboardSessionUser }>("/api/auth/session", {
      method: "GET",
      skipUnauthorizedRedirect: true,
    })
      .then((res) => {
        if (!active) return;
        const resolvedUser = res.data?.user ?? null;
        setUser(resolvedUser);
        setIsLoading(false);

        if (!resolvedUser && requireAuth) {
          router.replace(`/login?redirect=${encodeURIComponent(pathname || "/dashboard")}`);
        }
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
        setIsLoading(false);

        if (requireAuth) {
          router.replace(`/login?redirect=${encodeURIComponent(pathname || "/dashboard")}`);
        }
      });

    return () => {
      active = false;
    };
  }, [requireAuth, pathname, router]);

  const logout = React.useCallback(async () => {
    try {
      await apiFetch("/api/auth/logout", {
        method: "POST",
        skipUnauthorizedRedirect: true,
      });
    } finally {
      setUser(null);
      router.replace("/login");
    }
  }, [router]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      canCreateCustomModule: canAuthorCustomModules(user?.role),
      refreshSession,
      logout,
      setUser,
    }),
    [user, isLoading, refreshSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth harus digunakan di dalam <AuthProvider>");
  }
  return ctx;
}
