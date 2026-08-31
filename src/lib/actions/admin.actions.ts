"use server";

import { db, isDbConfigured } from "@/db";
import { appSettings, users } from "@/db/schema";
import { asc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/require-admin";
import {
  activateUserSubscription,
  downgradeToFree,
} from "@/lib/billing/entitlements";

export type AdminUserRow = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  plan: string;
  subscriptionStatus: string;
  aiEnabled: boolean;
  aiRewriteLimit: number;
  aiRewriteUsed: number;
  aiOtherLimit: number;
  aiOtherUsed: number;
  createdAt: string;
};

export async function listAdminUsersAction(): Promise<{
  success: boolean;
  users?: AdminUserRow[];
  globallyEnabled?: boolean;
  error?: string;
}> {
  const gate = await requireAdmin();
  if (!gate.ok) {
    return { success: false, error: gate.error };
  }
  if (!db) {
    return { success: false, error: "Database not configured" };
  }

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      plan: users.plan,
      subscriptionStatus: users.subscriptionStatus,
      aiEnabled: users.aiEnabled,
      aiRewriteLimit: users.aiRewriteLimit,
      aiRewriteUsed: users.aiRewriteUsed,
      aiOtherLimit: users.aiOtherLimit,
      aiOtherUsed: users.aiOtherUsed,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(asc(users.email));

  const [globalRow] = await db
    .select()
    .from(appSettings)
    .where(eq(appSettings.key, "ai_globally_enabled"))
    .limit(1);

  const globallyEnabled =
    globalRow?.value === "true" || globalRow?.value === "1";

  return {
    success: true,
    globallyEnabled,
    users: rows.map((r) => ({
      ...r,
      name: r.name,
      role: r.role || "user",
      plan: r.plan || "free",
      subscriptionStatus: r.subscriptionStatus || "none",
      createdAt: r.createdAt?.toISOString?.() ?? String(r.createdAt),
    })),
  };
}

/**
 * Admin grant / revoke paid plans without Razorpay.
 * starter | pro → activates AI entitlements for that plan.
 * free → downgrades and turns AI off.
 */
export async function grantUserSubscriptionAction(input: {
  userId: string;
  plan: "free" | "starter" | "pro";
}): Promise<{ success: boolean; error?: string }> {
  const gate = await requireAdmin();
  if (!gate.ok) return { success: false, error: gate.error };
  if (!db) return { success: false, error: "Database not configured" };

  const userId = String(input.userId || "").trim();
  if (!userId) return { success: false, error: "userId required" };
  if (!["free", "starter", "pro"].includes(input.plan)) {
    return { success: false, error: "Invalid plan" };
  }

  if (input.plan === "free") {
    await downgradeToFree(userId);
  } else {
    await activateUserSubscription({ userId, planId: input.plan });
  }

  revalidatePath("/admin");
  revalidatePath("/pricing");
  return { success: true };
}

export async function setGlobalAiEnabledAction(
  enabled: boolean
): Promise<{ success: boolean; error?: string }> {
  const gate = await requireAdmin();
  if (!gate.ok) return { success: false, error: gate.error };
  if (!isDbConfigured || !db) {
    return { success: false, error: "Database not configured" };
  }

  await db
    .insert(appSettings)
    .values({
      key: "ai_globally_enabled",
      value: enabled ? "true" : "false",
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: {
        value: enabled ? "true" : "false",
        updatedAt: new Date(),
      },
    });

  revalidatePath("/admin");
  return { success: true };
}

/**
 * Update AI permissions / token limits for a user.
 * Intentionally does NOT accept or update `role` — promote admins only in Neon SQL.
 */
export async function updateUserAiPermissionsAction(input: {
  userId: string;
  aiEnabled?: boolean;
  aiRewriteLimit?: number;
  aiOtherLimit?: number;
  resetRewriteUsed?: boolean;
  resetOtherUsed?: boolean;
}): Promise<{ success: boolean; error?: string }> {
  const gate = await requireAdmin();
  if (!gate.ok) return { success: false, error: gate.error };
  if (!db) return { success: false, error: "Database not configured" };

  const userId = String(input.userId || "").trim();
  if (!userId) return { success: false, error: "userId required" };

  const patch: Partial<{
    aiEnabled: boolean;
    aiRewriteLimit: number;
    aiOtherLimit: number;
    aiRewriteUsed: number;
    aiOtherUsed: number;
    updatedAt: Date;
  }> = {
    updatedAt: new Date(),
  };

  if (typeof input.aiEnabled === "boolean") {
    patch.aiEnabled = input.aiEnabled;
  }
  if (typeof input.aiRewriteLimit === "number" && Number.isFinite(input.aiRewriteLimit)) {
    patch.aiRewriteLimit = Math.max(0, Math.min(10_000, Math.floor(input.aiRewriteLimit)));
  }
  if (typeof input.aiOtherLimit === "number" && Number.isFinite(input.aiOtherLimit)) {
    patch.aiOtherLimit = Math.max(0, Math.min(10_000, Math.floor(input.aiOtherLimit)));
  }
  if (input.resetRewriteUsed) {
    patch.aiRewriteUsed = 0;
  }
  if (input.resetOtherUsed) {
    patch.aiOtherUsed = 0;
  }

  await db.update(users).set(patch).where(eq(users.id, userId));
  revalidatePath("/admin");
  return { success: true };
}

export async function bumpUserAiUsageAction(input: {
  userId: string;
  bucket: "rewrite" | "other";
  delta: number;
}): Promise<{ success: boolean; error?: string }> {
  const gate = await requireAdmin();
  if (!gate.ok) return { success: false, error: gate.error };
  if (!db) return { success: false, error: "Database not configured" };

  const delta = Math.floor(input.delta);
  if (!input.userId || !Number.isFinite(delta)) {
    return { success: false, error: "Invalid input" };
  }

  if (input.bucket === "rewrite") {
    await db
      .update(users)
      .set({
        aiRewriteUsed: sql`GREATEST(0, ${users.aiRewriteUsed} + ${delta})`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, input.userId));
  } else {
    await db
      .update(users)
      .set({
        aiOtherUsed: sql`GREATEST(0, ${users.aiOtherUsed} + ${delta})`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, input.userId));
  }

  revalidatePath("/admin");
  return { success: true };
}
