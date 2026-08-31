"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { isClerkConfigured } from "@/components/brand/AuthNavActions";

/**
 * Whenever a Clerk session is active, push the user into Neon.
 * Retries until success — login must land in the database.
 */
export function EnsureUserSynced() {
  if (!isClerkConfigured()) return null;
  return <EnsureUserSyncedInner />;
}

function EnsureUserSyncedInner() {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const lastSuccessFor = useRef<string | null>(null);
  const inFlight = useRef(false);
  const attempt = useRef(0);

  useEffect(() => {
    if (!isLoaded) return;

    // Cleared on logout so the next login always syncs again
    if (!isSignedIn || !userId) {
      lastSuccessFor.current = null;
      attempt.current = 0;
      return;
    }

    if (lastSuccessFor.current === userId) return;
    if (inFlight.current) return;

    let cancelled = false;
    const timers = new Set<number>();

    const schedule = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
    };

    const syncOnce = async (): Promise<boolean> => {
      const res = await fetch("/api/users/sync", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
        created?: boolean;
        userId?: string;
      };

      if (data.success) {
        lastSuccessFor.current = userId;
        attempt.current = 0;
        if (data.created) {
          console.info("[RoleReady] Synced new Clerk user into Neon:", data.userId);
        }
        return true;
      }

      console.warn("[RoleReady] User sync failed:", data.error || res.statusText);
      return false;
    };

    const runWithRetry = async () => {
      if (cancelled || inFlight.current) return;
      inFlight.current = true;
      try {
        const ok = await syncOnce();
        if (ok || cancelled) return;

        attempt.current += 1;
        const delay = Math.min(15_000, 500 * 2 ** Math.min(attempt.current - 1, 5));
        schedule(() => {
          inFlight.current = false;
          void runWithRetry();
        }, delay);
      } catch (err) {
        console.warn("[RoleReady] User sync request error:", err);
        attempt.current += 1;
        const delay = Math.min(15_000, 500 * 2 ** Math.min(attempt.current - 1, 5));
        schedule(() => {
          inFlight.current = false;
          void runWithRetry();
        }, delay);
      } finally {
        // Only clear if we are not waiting on a scheduled retry
        if (![...timers].length) {
          inFlight.current = false;
        }
      }
    };

    // Short delay so Clerk cookies settle after redirect / hard refresh
    schedule(() => {
      void runWithRetry();
    }, 200);

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
      timers.clear();
      inFlight.current = false;
    };
  }, [isLoaded, isSignedIn, userId]);

  // Re-sync when tab becomes visible if earlier attempts never succeeded
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) return;

    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (lastSuccessFor.current === userId) return;

      void fetch("/api/users/sync", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      })
        .then(async (res) => {
          const data = (await res.json()) as { success?: boolean };
          if (data.success) lastSuccessFor.current = userId;
        })
        .catch(() => {
          /* main effect owns backoff */
        });
    };

    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [isLoaded, isSignedIn, userId]);

  return null;
}
