"use client";

import React, { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { AuthNavActions, isClerkConfigured } from "@/components/brand/AuthNavActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  getMyProfileAction,
  updateMyProfileAction,
  type UserProfile,
} from "@/lib/actions/user.actions";
import {
  ArrowLeft,
  Check,
  Loader2,
  UserRound,
} from "lucide-react";

const INDUSTRY_OPTIONS = [
  "Tech & Software",
  "Finance & Fintech",
  "Healthcare",
  "Education",
  "Marketing & Media",
  "Consulting",
  "Retail & E‑commerce",
  "Manufacturing",
  "Government & Public Sector",
  "Other",
] as const;

export default function ProfilePage() {
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [targetJobTitle, setTargetJobTitle] = useState("");
  const [industry, setIndustry] = useState("Tech & Software");
  const [customIndustry, setCustomIndustry] = useState("");

  const applyProfile = (profile: UserProfile) => {
    setEmail(profile.email);
    setName(profile.name);
    setTargetJobTitle(profile.targetJobTitle);
    const known = INDUSTRY_OPTIONS.includes(
      profile.industry as (typeof INDUSTRY_OPTIONS)[number]
    );
    if (profile.industry && !known) {
      setIndustry("Other");
      setCustomIndustry(profile.industry);
    } else {
      setIndustry(profile.industry || "Tech & Software");
      setCustomIndustry("");
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!isClerkConfigured()) {
      setNeedsAuth(true);
      setLoading(false);
      return;
    }

    const res = await getMyProfileAction();
    if (!res.success || !res.profile) {
      if (res.error === "Sign in required") {
        setNeedsAuth(true);
      } else {
        setError(res.error || "Could not load profile");
      }
      setLoading(false);
      return;
    }

    applyProfile(res.profile);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = () => {
    setSaved(false);
    setError(null);
    const industryValue =
      industry === "Other" ? customIndustry.trim() || "Other" : industry;

    startTransition(async () => {
      const res = await updateMyProfileAction({
        name,
        targetJobTitle,
        industry: industryValue,
      });
      if (!res.success) {
        setError(res.error || "Save failed");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-teal-700" />
      </div>
    );
  }

  if (needsAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 bg-background text-center">
        <UserRound className="h-10 w-10 text-muted-foreground" />
        <h1 className="text-xl font-bold">Sign in to edit your profile</h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          Your name, target role, and industry are stored with your RoleReady account.
        </p>
        <div className="flex gap-2">
          <Link href="/sign-in">
            <Button className="bg-teal-700 hover:bg-teal-800 text-white">Sign In</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-md px-4 sm:px-6 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <BrandLogo size="sm" />
          </div>
          <AuthNavActions showDashboardLink compact />
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="space-y-1">
          <Badge
            variant="outline"
            className="border-teal-700/20 text-teal-800 dark:text-teal-300 mb-1"
          >
            Account
          </Badge>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <UserRound className="h-6 w-6 text-teal-700" />
            Your profile
          </h1>
          <p className="text-sm text-muted-foreground">
            Update basic details used for onboarding and AI context. Role and AI limits are managed
            separately.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-sm px-3 py-2">
            {error}
          </div>
        )}

        <section className="rounded-2xl border bg-card p-5 sm:p-6 space-y-5 shadow-xs">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Email
            </label>
            <Input value={email} disabled className="bg-muted/40" />
            <p className="text-[11px] text-muted-foreground mt-1">
              Managed by your sign-in provider — not editable here.
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Full name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Alex Morgan"
              maxLength={255}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Target job title
            </label>
            <Input
              value={targetJobTitle}
              onChange={(e) => setTargetJobTitle(e.target.value)}
              placeholder="e.g., Senior Full Stack Engineer"
              maxLength={255}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Industry
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {INDUSTRY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {industry === "Other" && (
              <Input
                className="mt-2"
                value={customIndustry}
                onChange={(e) => setCustomIndustry(e.target.value)}
                placeholder="Describe your industry"
                maxLength={255}
              />
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
            <Button
              onClick={handleSave}
              disabled={pending || !name.trim()}
              className="bg-teal-700 hover:bg-teal-800 text-white gap-2"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : saved ? (
                <Check className="h-4 w-4" />
              ) : null}
              {pending ? "Saving…" : saved ? "Saved" : "Save profile"}
            </Button>
            <Link href="/dashboard" className="sm:ml-auto">
              <Button variant="outline" className="w-full sm:w-auto">
                Back to dashboard
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
