import {
  ensureAppUserLinked,
  getAppSetting,
  getUserById,
  isDbConfigured,
  updateUser,
  type AppUser,
} from "@/lib/appwrite/db";
import { auth, currentUser } from "@/lib/appwrite/auth";
import type { AiAccessStatus, AiFeature } from "@/lib/ai/access-types";

export type { AiAccessStatus, AiFeature } from "@/lib/ai/access-types";

const DEFAULT_REWRITE_LIMIT = Number(process.env.AI_REWRITE_DEFAULT_LIMIT || 15);
const DEFAULT_OTHER_LIMIT = Number(process.env.AI_OTHER_DEFAULT_LIMIT || 10);
/** Soft “unlimited” display for admins (never decremented). */
const ADMIN_UNLIMITED = 999_999;

function emptyStatus(
  partial: Partial<AiAccessStatus> & Pick<AiAccessStatus, "enabled" | "reason">
): AiAccessStatus {
  return {
    globallyEnabled: false,
    authenticated: false,
    isAdmin: false,
    userId: null,
    rewrite: { used: 0, limit: DEFAULT_REWRITE_LIMIT, remaining: 0 },
    other: { used: 0, limit: DEFAULT_OTHER_LIMIT, remaining: 0 },
    ...partial,
  };
}

async function resolveUserId(): Promise<string | null> {
  try {
    const session = await auth();
    if (session.userId) return session.userId;
  } catch {
    // Auth not configured
  }
  return null;
}

async function isGloballyEnabled(): Promise<boolean> {
  const value = await getAppSetting("ai_globally_enabled");
  if (!value) return false;
  return value === "true" || value === "1";
}

export async function getAiAccessStatus(): Promise<AiAccessStatus> {
  if (!isDbConfigured()) {
    return emptyStatus({ enabled: false, reason: "db_missing" });
  }

  const globallyEnabled = await isGloballyEnabled();
  const userId = await resolveUserId();

  if (!userId) {
    return emptyStatus({
      enabled: false,
      globallyEnabled,
      authenticated: false,
      reason: "not_signed_in",
    });
  }

  const user = await getUserById(userId);

  if (!user) {
    // Try email re-link once (migrated rows → Appwrite Auth id)
    try {
      const appUser = await currentUser();
      if (appUser?.email) {
        const linked = await ensureAppUserLinked({
          authUserId: userId,
          email: appUser.email,
          name: appUser.name,
        });
        return getAiAccessStatusForUser(linked, globallyEnabled);
      }
    } catch {
      // fall through
    }

    return emptyStatus({
      enabled: false,
      globallyEnabled,
      authenticated: true,
      userId,
      reason: "user_missing",
    });
  }

  return getAiAccessStatusForUser(user, globallyEnabled);
}

function getAiAccessStatusForUser(
  user: AppUser,
  globallyEnabled: boolean
): AiAccessStatus {

  const isAdmin = user.role === "admin";
  const userId = user.id;

  if (isAdmin) {
    return {
      enabled: true,
      globallyEnabled,
      authenticated: true,
      isAdmin: true,
      userId,
      rewrite: {
        used: user.aiRewriteUsed ?? 0,
        limit: ADMIN_UNLIMITED,
        remaining: ADMIN_UNLIMITED,
      },
      other: {
        used: user.aiOtherUsed ?? 0,
        limit: ADMIN_UNLIMITED,
        remaining: ADMIN_UNLIMITED,
      },
    };
  }

  const rewriteLimit = user.aiRewriteLimit ?? DEFAULT_REWRITE_LIMIT;
  const rewriteUsed = user.aiRewriteUsed ?? 0;
  const otherLimit = user.aiOtherLimit ?? DEFAULT_OTHER_LIMIT;
  const otherUsed = user.aiOtherUsed ?? 0;

  const rewrite = {
    used: rewriteUsed,
    limit: rewriteLimit,
    remaining: Math.max(0, rewriteLimit - rewriteUsed),
  };
  const other = {
    used: otherUsed,
    limit: otherLimit,
    remaining: Math.max(0, otherLimit - otherUsed),
  };

  if (!globallyEnabled) {
    return {
      enabled: false,
      globallyEnabled,
      authenticated: true,
      isAdmin: false,
      userId,
      reason: "globally_disabled",
      rewrite,
      other,
    };
  }

  if (!user.aiEnabled) {
    return {
      enabled: false,
      globallyEnabled,
      authenticated: true,
      isAdmin: false,
      userId,
      reason: "user_disabled",
      rewrite,
      other,
    };
  }

  return {
    enabled: true,
    globallyEnabled,
    authenticated: true,
    isAdmin: false,
    userId,
    rewrite,
    other,
  };
}

function featureBucket(feature: AiFeature): "rewrite" | "other" {
  return feature === "rewrite" ? "rewrite" : "other";
}

export function aiDeniedResponse(status: AiAccessStatus, feature: AiFeature): Response {
  const bucket = featureBucket(feature);
  const remaining = status[bucket].remaining;

  let message = "AI features are locked.";
  let code = "AI_LOCKED";
  let http = 403;

  switch (status.reason) {
    case "db_missing":
      message = "AI features require a connected database.";
      break;
    case "not_signed_in":
      message = "Sign in to use AI features.";
      break;
    case "user_missing":
      message = "Complete onboarding before using AI features.";
      break;
    case "globally_disabled":
      message = "AI features are currently disabled by the admin.";
      break;
    case "user_disabled":
      message = "AI features are not enabled for your account.";
      break;
    case "limit_reached":
      message =
        feature === "rewrite"
          ? `AI rewrite limit reached (${status.rewrite.used}/${status.rewrite.limit}).`
          : `AI usage limit reached (${status.other.used}/${status.other.limit}).`;
      code = "AI_LIMIT";
      http = 429;
      break;
    default:
      if (status.enabled && remaining <= 0) {
        message =
          feature === "rewrite"
            ? `AI rewrite limit reached (${status.rewrite.used}/${status.rewrite.limit}).`
            : `AI usage limit reached (${status.other.used}/${status.other.limit}).`;
        code = "AI_LIMIT";
        http = 429;
      }
  }

  return new Response(
    JSON.stringify({
      error: message,
      code,
      reason: status.reason,
      isAdmin: status.isAdmin,
      rewrite: status.rewrite,
      other: status.other,
    }),
    { status: http, headers: { "Content-Type": "application/json" } }
  );
}

/**
 * Call before spending tokens. Returns Response if blocked.
 * Admins never consume quota.
 */
export async function consumeAiAccess(
  feature: AiFeature
): Promise<{ ok: true; status: AiAccessStatus } | { ok: false; response: Response }> {
  const status = await getAiAccessStatus();

  if (!status.enabled || !status.userId || !isDbConfigured()) {
    return { ok: false, response: aiDeniedResponse(status, feature) };
  }

  // Admin: unlimited — do not decrement counters
  if (status.isAdmin) {
    return { ok: true, status };
  }

  const bucket = featureBucket(feature);
  if (status[bucket].remaining <= 0) {
    return {
      ok: false,
      response: aiDeniedResponse({ ...status, reason: "limit_reached", enabled: false }, feature),
    };
  }

  if (bucket === "rewrite") {
    await updateUser(status.userId, {
      aiRewriteUsed: status.rewrite.used + 1,
    });
  } else {
    await updateUser(status.userId, {
      aiOtherUsed: status.other.used + 1,
    });
  }

  const next =
    bucket === "rewrite"
      ? {
          ...status,
          rewrite: {
            ...status.rewrite,
            used: status.rewrite.used + 1,
            remaining: Math.max(0, status.rewrite.remaining - 1),
          },
        }
      : {
          ...status,
          other: {
            ...status.other,
            used: status.other.used + 1,
            remaining: Math.max(0, status.other.remaining - 1),
          },
        };

  return { ok: true, status: next };
}
