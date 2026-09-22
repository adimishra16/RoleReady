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

function SignUpForm() {
  const router = useRouter();
  const { isSignedIn, isLoaded, refresh } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/onboarding");
    }
  }, [isLoaded, isSignedIn, router]);

  if (isLoaded && isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Taking you to onboarding…</p>
      </div>
    );
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!data.success) {
        setError(data.error || "Sign up failed");
        return;
      }
      await refresh();
      router.replace("/onboarding");
      router.refresh();
    } catch {
      setError("Sign up failed");
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
          <h1 className="text-lg font-semibold">Create account</h1>
          <p className="text-xs text-muted-foreground">Email and password — no phone required</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-700 hover:bg-teal-800 text-white"
        >
          {loading ? "Creating…" : "Create account"}
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-teal-700 dark:text-teal-400 font-medium">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default function SignUpPage() {
  if (!isAppwriteConfigured()) {
    return (
      <AuthShell>
        <div className="w-full p-6 bg-card border rounded-2xl shadow-lg text-center space-y-4">
          <h2 className="text-lg font-bold">Sign Up (Demo Mode)</h2>
          <p className="text-xs text-muted-foreground">
            Appwrite is not configured yet. You can still explore the app in demo mode.
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

  return <SignUpForm />;
}
