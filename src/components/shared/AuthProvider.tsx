"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { isAppwriteConfigured } from "@/lib/appwrite/config";

export type ClientAuthUser = {
  id: string;
  email: string;
  name: string;
  imageUrl?: string;
};

type AuthContextValue = {
  user: ClientAuthUser | null;
  userId: string | null;
  isSignedIn: boolean;
  isLoaded: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ClientAuthUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(!isAppwriteConfigured());

  const refresh = useCallback(async () => {
    if (!isAppwriteConfigured()) {
      setUser(null);
      setIsLoaded(true);
      return;
    }
    try {
      const res = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
      const data = (await res.json()) as { user?: ClientAuthUser | null };
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/sign-out", { method: "POST", credentials: "include" });
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      userId: user?.id ?? null,
      isSignedIn: Boolean(user),
      isLoaded,
      refresh,
      signOut,
    }),
    [user, isLoaded, refresh, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

export function useUser() {
  const { user, isLoaded } = useAuth();
  return {
    user: user
      ? {
          id: user.id,
          fullName: user.name,
          firstName: user.name?.split(" ")[0] || user.name,
          username: user.email?.split("@")[0],
          primaryEmailAddress: { emailAddress: user.email },
          emailAddresses: [{ emailAddress: user.email }],
          imageUrl: user.imageUrl,
        }
      : null,
    isLoaded,
  };
}
