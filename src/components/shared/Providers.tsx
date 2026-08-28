"use client";

import React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { EnsureUserSynced } from "@/components/shared/EnsureUserSynced";
import { clerkAppearance } from "@/lib/clerk-appearance";

interface Props {
  children: React.ReactNode;
  clerkPublishableKey?: string;
}

export function Providers({ children, clerkPublishableKey }: Props) {
  const isClerkActive =
    clerkPublishableKey && !clerkPublishableKey.includes("placeholder");

  const content = (
    <ThemeProvider>
      {isClerkActive ? <EnsureUserSynced /> : null}
      {children}
    </ThemeProvider>
  );

  if (isClerkActive) {
    return (
      <ClerkProvider publishableKey={clerkPublishableKey} appearance={clerkAppearance}>
        {content}
      </ClerkProvider>
    );
  }

  return content;
}
