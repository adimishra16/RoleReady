"use client";

import React from "react";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { AuthProvider } from "@/components/shared/AuthProvider";
import { EnsureUserSynced } from "@/components/shared/EnsureUserSynced";
import { isAppwriteConfigured } from "@/lib/appwrite/config";

export function Providers({ children }: { children: React.ReactNode }) {
  const appwriteOn = isAppwriteConfigured();

  return (
    <AuthProvider>
      <ThemeProvider>
        {appwriteOn ? <EnsureUserSynced /> : null}
        {children}
      </ThemeProvider>
    </AuthProvider>
  );
}
