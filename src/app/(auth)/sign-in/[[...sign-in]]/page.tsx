"use client";

import { useEffect } from "react";
import { SignIn, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { isClerkConfigured } from "@/components/brand/AuthNavActions";

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md flex flex-col items-center">
        <Link href="/" className="mb-6">
          <BrandLogo size="md" showTagline />
        </Link>
        {children}
      </div>
    </div>
  );
}

function ClerkSignIn() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  if (isLoaded && isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Taking you to your dashboard…</p>
      </div>
    );
  }

  return (
    <AuthShell>
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        forceRedirectUrl="/dashboard"
        fallbackRedirectUrl="/dashboard"
        appearance={clerkAppearance}
      />
    </AuthShell>
  );
}

export default function SignInPage() {
  if (!isClerkConfigured()) {
    return (
      <AuthShell>
        <div className="w-full p-6 bg-card border rounded-2xl shadow-lg text-center space-y-4">
          <h2 className="text-lg font-bold">Sign In (Demo Mode)</h2>
          <p className="text-xs text-muted-foreground">
            Clerk authentication keys are not set yet. You can proceed directly to the dashboard or
            builder in demo mode.
          </p>
          <Link href="/dashboard" className="block">
            <Button className="w-full bg-teal-700 hover:bg-teal-800 text-white">
              Continue to Dashboard
            </Button>
          </Link>
        </div>
      </AuthShell>
    );
  }

  return <ClerkSignIn />;
}
