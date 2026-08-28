"use client";

import { useCallback, useEffect, useState } from "react";
import type { AiAccessStatus } from "@/lib/ai/access-types";

const FALLBACK: AiAccessStatus = {
  enabled: false,
  globallyEnabled: false,
  authenticated: false,
  userId: null,
  reason: "db_missing",
  rewrite: { used: 0, limit: 0, remaining: 0 },
  other: { used: 0, limit: 0, remaining: 0 },
};

export function useAiAccess(isOpen: boolean) {
  const [status, setStatus] = useState<AiAccessStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/status");
      if (!res.ok) {
        setStatus(FALLBACK);
        return;
      }
      const data = (await res.json()) as AiAccessStatus;
      setStatus(data);
    } catch {
      setStatus(FALLBACK);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      void refresh();
    }
  }, [isOpen, refresh]);

  return { status, loading, refresh };
}

export function aiLockMessage(status: AiAccessStatus | null): string | null {
  if (!status) return null;
  if (status.enabled) return null;

  switch (status.reason) {
    case "not_signed_in":
      return "Sign in to unlock AI features.";
    case "user_missing":
      return "Finish onboarding so we can link AI access to your account.";
    case "globally_disabled":
      return "AI features are turned off by the admin.";
    case "user_disabled":
      return "AI is not enabled for your account yet.";
    case "limit_reached":
      return "You have used all of your AI credits.";
    case "db_missing":
      return "AI features are unavailable right now.";
    default:
      return "AI features are locked.";
  }
}

export async function readAiError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (typeof data?.error === "string") return data.error;
  } catch {
    // ignore
  }
  if (response.status === 429) return "AI usage limit reached.";
  if (response.status === 403) return "AI features are locked.";
  return "AI request failed.";
}
