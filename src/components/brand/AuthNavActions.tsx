"use client";

import Link from "next/link";
import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { LogOut, LogIn } from "lucide-react";
import { AdminNavLink } from "@/components/brand/AdminNavLink";

export function isClerkConfigured() {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  return Boolean(key && !key.includes("placeholder"));
}

export function AuthNavActions({
  primaryHref = "/sign-up",
  primaryLabel = "Get Started",
  showDashboardLink = true,
  compact = false,
}: {
  primaryHref?: string;
  primaryLabel?: string;
  showDashboardLink?: boolean;
  /** Tighter layout for builder header */
  compact?: boolean;
}) {
  if (!isClerkConfigured()) {
    return (
      <div className={`flex items-center ${compact ? "gap-1.5" : "gap-2"}`}>
        <ThemeToggle />
        <Link href="/sign-in">
          <Button variant="ghost" size="sm" className="text-xs gap-1.5">
            <LogIn className="h-3.5 w-3.5" />
            Sign In
          </Button>
        </Link>
        {!compact && (
          <Link href={primaryHref}>
            <Button size="sm" className="text-xs bg-teal-700 hover:bg-teal-800 text-white">
              {primaryLabel}
            </Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <ClerkAuthNav
      primaryHref={primaryHref}
      primaryLabel={primaryLabel}
      showDashboardLink={showDashboardLink}
      compact={compact}
    />
  );
}

function ClerkAuthNav({
  primaryHref,
  primaryLabel,
  showDashboardLink,
  compact,
}: {
  primaryHref: string;
  primaryLabel: string;
  showDashboardLink: boolean;
  compact: boolean;
}) {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();

  const displayName =
    user?.fullName ||
    user?.firstName ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "Account";

  const email = user?.primaryEmailAddress?.emailAddress || "";
  const imageUrl = user?.imageUrl;

  const handleLogout = async () => {
    await signOut({ redirectUrl: "/" });
  };

  return (
    <div className={`flex items-center shrink-0 min-w-0 ${compact ? "gap-1" : "gap-1.5 sm:gap-2"}`}>
      <ThemeToggle />
      {!isLoaded ? (
        <div className="h-8 w-20 sm:w-36 rounded-md bg-muted animate-pulse" />
      ) : isSignedIn && user ? (
        <>
          {showDashboardLink && (
            <Link href="/dashboard" className="shrink-0">
              <Button variant="ghost" size="sm" className="text-xs px-2 sm:px-3">
                <span className="sm:hidden">App</span>
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
            </Link>
          )}
          <AdminNavLink compact={compact} />

          <Link
            href="/profile"
            className={`flex items-center gap-2 rounded-full border bg-card/80 pl-0.5 sm:pl-1 py-0.5 sm:py-1 min-w-0 hover:bg-muted/50 transition-colors ${
              compact
                ? "pr-1 sm:pr-2 max-w-[9rem] md:max-w-[11rem]"
                : "pr-1.5 sm:pr-2.5 max-w-[2.25rem] sm:max-w-[10rem] md:max-w-[14rem]"
            }`}
            title="Edit profile"
          >
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt=""
                className="h-7 w-7 shrink-0 rounded-full object-cover border border-teal-700/20"
              />
            ) : (
              <div className="h-7 w-7 shrink-0 rounded-full bg-teal-700 text-white text-[11px] font-bold flex items-center justify-center">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 leading-tight hidden sm:block">
              <p className="text-[11px] font-semibold text-foreground truncate">{displayName}</p>
              {email && (
                <p className="text-[10px] text-muted-foreground truncate max-w-[7rem] md:max-w-[9rem] hidden md:block">
                  {email}
                </p>
              )}
            </div>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            aria-label="Log out"
            className="text-xs gap-1.5 px-2 sm:px-3 border-border text-foreground bg-background hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 shrink-0"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Log out</span>
          </Button>
        </>
      ) : (
        <>
          <Link href="/sign-in" className="shrink-0">
            <Button variant="ghost" size="sm" className="text-xs gap-1.5 px-2 sm:px-3">
              <LogIn className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign In</span>
            </Button>
          </Link>
          <Link href={primaryHref} className="shrink-0">
            <Button
              size="sm"
              className="text-xs bg-teal-700 hover:bg-teal-800 text-white shadow-sm px-2.5 sm:px-3"
            >
              <span className="sm:hidden">Start</span>
              <span className="hidden sm:inline">{primaryLabel}</span>
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}

/** Must only render under ClerkProvider. */
export function ClerkSignedInGate({
  children,
  fallback,
}: {
  children: (ctx: { isSignedIn: boolean; isLoaded: boolean }) => React.ReactNode;
  fallback?: React.ReactNode;
}) {
  if (!isClerkConfigured()) {
    return <>{fallback ?? children({ isSignedIn: false, isLoaded: true })}</>;
  }
  return <ClerkSignedInGateInner>{children}</ClerkSignedInGateInner>;
}

function ClerkSignedInGateInner({
  children,
}: {
  children: (ctx: { isSignedIn: boolean; isLoaded: boolean }) => React.ReactNode;
}) {
  const { isSignedIn, isLoaded } = useAuth();
  return <>{children({ isSignedIn: Boolean(isSignedIn), isLoaded })}</>;
}
