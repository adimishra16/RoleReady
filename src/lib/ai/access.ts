import { auth } from "@clerk/nextjs/server";
import { eq, sql } from "drizzle-orm";
import { db, isDbConfigured } from "@/db";
import { appSettings, users } from "@/db/schema";
import type { AiAccessStatus, AiFeature } from "@/lib/ai/access-types";

export type { AiAccessStatus, AiFeature } from "@/lib/ai/access-types";

const DEFAULT_REWRITE_LIMIT = Number(process.env.AI_REWRITE_DEFAULT_LIMIT || 15);
const DEFAULT_OTHER_LIMIT = Number(process.env.AI_OTHER_DEFAULT_LIMIT || 10);

function emptyStatus(partial: Partial<AiAccessStatus> & Pick<AiAccessStatus, "enabled" | "reason">): AiAccessStatus {
  return {
    globallyEnabled: false,
    authenticated: false,
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
    // Clerk not configured / middleware missing
  }
  return null;
}

async function isGloballyEnabled(): Promise<boolean> {
  if (!db) return false;
  const [row] = await db
    .select()
    .from(appSettings)
    .where(eq(appSettings.key, "ai_globally_enabled"))
    .limit(1);

  // Missing row defaults to OFF — you must enable in Neon
  if (!row) return false;
  return row.value === "true" || row.value === "1";
}

export async function getAiAccessStatus(): Promise<AiAccessStatus> {
  if (!isDbConfigured || !db) {
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

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  if (!user) {
    return emptyStatus({
      enabled: false,
      globallyEnabled,
      authenticated: true,
      userId,
      reason: "user_missing",
    });
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
      rewrite: status.rewrite,
      other: status.other,
    }),
    { status: http, headers: { "Content-Type": "application/json" } }
  );
}

/**
 * Call before spending tokens. Returns null + Response if blocked.
 * On success, increments the matching usage counter in Neon.
 */
export async function consumeAiAccess(
  feature: AiFeature
): Promise<{ ok: true; status: AiAccessStatus } | { ok: false; response: Response }> {
  const status = await getAiAccessStatus();

  if (!status.enabled || !status.userId || !db) {
    return { ok: false, response: aiDeniedResponse(status, feature) };
  }

  const bucket = featureBucket(feature);
  if (status[bucket].remaining <= 0) {
    return {
      ok: false,
      response: aiDeniedResponse({ ...status, reason: "limit_reached", enabled: false }, feature),
    };
  }

  if (bucket === "rewrite") {
    await db
      .update(users)
      .set({
        aiRewriteUsed: sql`${users.aiRewriteUsed} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, status.userId));
  } else {
    await db
      .update(users)
      .set({
        aiOtherUsed: sql`${users.aiOtherUsed} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, status.userId));
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
