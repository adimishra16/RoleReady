"use server";

import {
  getAppSetting,
  getUserById,
  isDbConfigured,
  listUsers,
  setAppSetting,
  updateUser,
} from "@/lib/appwrite/db";
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
  if (!isDbConfigured()) {
    return { success: false, error: "Database not configured" };
  }

  const rows = await listUsers();
  const globalValue = await getAppSetting("ai_globally_enabled");
  const globallyEnabled = globalValue === "true" || globalValue === "1";

  return {
    success: true,
    globallyEnabled,
    users: rows.map((r) => ({
      id: r.id,
      email: r.email,
      name: r.name,
      role: r.role || "user",
      plan: r.plan || "free",
      subscriptionStatus: r.subscriptionStatus || "none",
      aiEnabled: r.aiEnabled,
      aiRewriteLimit: r.aiRewriteLimit,
      aiRewriteUsed: r.aiRewriteUsed,
      aiOtherLimit: r.aiOtherLimit,
      aiOtherUsed: r.aiOtherUsed,
      createdAt: r.createdAt?.toISOString?.() ?? String(r.createdAt),
    })),
  };
}

export async function grantUserSubscriptionAction(input: {
  userId: string;
  plan: "free" | "starter" | "pro";
}): Promise<{ success: boolean; error?: string }> {
  const gate = await requireAdmin();
  if (!gate.ok) return { success: false, error: gate.error };
  if (!isDbConfigured()) return { success: false, error: "Database not configured" };

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
  if (!isDbConfigured()) {
    return { success: false, error: "Database not configured" };
  }

  await setAppSetting("ai_globally_enabled", enabled ? "true" : "false");

  revalidatePath("/admin");
  return { success: true };
}

/**
 * Update AI permissions / token limits for a user.
 * Does NOT accept or update `role` — promote admins only in Appwrite Console.
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
  if (!isDbConfigured()) return { success: false, error: "Database not configured" };

  const userId = String(input.userId || "").trim();
  if (!userId) return { success: false, error: "userId required" };

  const patch: Parameters<typeof updateUser>[1] = {};

  if (typeof input.aiEnabled === "boolean") {
    patch.aiEnabled = input.aiEnabled;
  }
  if (typeof input.aiRewriteLimit === "number" && Number.isFinite(input.aiRewriteLimit)) {
    patch.aiRewriteLimit = Math.max(0, Math.min(500_000, Math.floor(input.aiRewriteLimit)));
  }
  if (typeof input.aiOtherLimit === "number" && Number.isFinite(input.aiOtherLimit)) {
    patch.aiOtherLimit = Math.max(0, Math.min(500_000, Math.floor(input.aiOtherLimit)));
  }
  if (input.resetRewriteUsed) {
    patch.aiRewriteUsed = 0;
  }
  if (input.resetOtherUsed) {
    patch.aiOtherUsed = 0;
  }

  await updateUser(userId, patch);
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
  if (!isDbConfigured()) return { success: false, error: "Database not configured" };

  const delta = Math.floor(input.delta);
  if (!input.userId || !Number.isFinite(delta)) {
    return { success: false, error: "Invalid input" };
  }

  const user = await getUserById(input.userId);
  if (!user) return { success: false, error: "User not found" };

  if (input.bucket === "rewrite") {
    await updateUser(input.userId, {
      aiRewriteUsed: Math.max(0, user.aiRewriteUsed + delta),
    });
  } else {
    await updateUser(input.userId, {
      aiOtherUsed: Math.max(0, user.aiOtherUsed + delta),
    });
  }

  revalidatePath("/admin");
  return { success: true };
}
