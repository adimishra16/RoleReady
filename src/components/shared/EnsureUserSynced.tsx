"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { isClerkConfigured } from "@/components/brand/AuthNavActions";

/**
 * When a Clerk session is active, upsert the user into Neon once per browser tab session.
 */
export function EnsureUserSynced() {
  if (!isClerkConfigured()) return null;
  return <EnsureUserSyncedInner />;
}

function EnsureUserSyncedInner() {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const syncedFor = useRef<string | null>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) return;
    if (syncedFor.current === userId || inFlight.current) return;

    const storageKey = `roleready_user_synced_${userId}`;

    // Allow retry if a previous attempt failed (don't trust a stale "1" from an old buggy build)
    inFlight.current = true;

    const run = async () => {
      try {
        // Prefer API route (middleware attaches auth cookies reliably)
        const res = await fetch("/api/users/sync", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        const data = (await res.json()) as {
          success?: boolean;
          error?: string;
          created?: boolean;
          userId?: string;
        };

        if (data.success) {
          syncedFor.current = userId;
          try {
            sessionStorage.setItem(storageKey, "1");
          } catch {
            // ignore
          }
          if (data.created) {
            console.info("[RoleReady] Synced new Clerk user into Neon:", data.userId);
          }
        } else {
          console.warn("[RoleReady] User sync failed:", data.error || res.statusText);
          // Clear sticky success flag so a later navigation retries
          try {
            sessionStorage.removeItem(storageKey);
          } catch {
            // ignore
          }
        }
      } catch (err) {
        console.warn("[RoleReady] User sync request error:", err);
      } finally {
        inFlight.current = false;
      }
    };

    // Small delay so Clerk session cookie is fully settled after redirect
    const t = window.setTimeout(() => {
      void run();
    }, 300);

    return () => window.clearTimeout(t);
  }, [isLoaded, isSignedIn, userId]);

  return null;
}
