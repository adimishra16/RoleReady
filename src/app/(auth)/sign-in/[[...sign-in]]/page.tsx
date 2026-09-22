"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useAuth } from "@/components/shared/AuthProvider";
import { isAppwriteConfigured } from "@/lib/appwrite/config";

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

function SignInForm() {
  const router = useRouter();
  const { isSignedIn, isLoaded, refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!data.success) {
        setError(data.error || "Sign in failed");
        return;
      }
      await refresh();
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <form
        onSubmit={onSubmit}
        className="w-full p-6 bg-card border rounded-2xl shadow-lg space-y-4"
      >
        <div className="space-y-1 text-center">
          <h1 className="text-lg font-semibold">Sign in</h1>
          <p className="text-xs text-muted-foreground">Use your RoleReady account</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-700 hover:bg-teal-800 text-white"
        >
          {loading ? "Signing in…" : "Sign in"}
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          No account?{" "}
          <Link href="/sign-up" className="text-teal-700 dark:text-teal-400 font-medium">
            Create one
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default function SignInPage() {
  if (!isAppwriteConfigured()) {
    return (
      <AuthShell>
        <div className="w-full p-6 bg-card border rounded-2xl shadow-lg text-center space-y-4">
          <h2 className="text-lg font-bold">Sign In (Demo Mode)</h2>
          <p className="text-xs text-muted-foreground">
            Appwrite keys are not set yet. Add{" "}
            <code className="text-[10px]">NEXT_PUBLIC_APPWRITE_*</code> and{" "}
            <code className="text-[10px]">APPWRITE_API_KEY</code> in{" "}
            <code className="text-[10px]">.env.local</code>, or continue in demo mode.
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

  return <SignInForm />;
}
