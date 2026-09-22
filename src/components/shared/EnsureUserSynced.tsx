"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/components/shared/AuthProvider";
import { isAppwriteConfigured } from "@/lib/appwrite/config";

/**
 * Whenever an Appwrite session is active, upsert the user into Appwrite DB `users`.
 */
export function EnsureUserSynced() {
  if (!isAppwriteConfigured()) return null;
  return <EnsureUserSyncedInner />;
}

function EnsureUserSyncedInner() {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const lastSuccessFor = useRef<string | null>(null);
  const inFlight = useRef(false);
  const attempt = useRef(0);

  useEffect(() => {
    if (!isLoaded) return;

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
          console.info("[RoleReady] Synced Appwrite user into DB:", data.userId);
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
        if (![...timers].length) {
          inFlight.current = false;
        }
      }
    };

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
        .catch(() => {});
    };

    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [isLoaded, isSignedIn, userId]);

  return null;
}
