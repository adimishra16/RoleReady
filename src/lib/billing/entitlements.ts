import {
  getUserById,
  isDbConfigured,
  updateUser,
} from "@/lib/appwrite/db";
import { BILLING_PLANS, type PlanId } from "@/lib/billing/plans";

export async function activateUserSubscription(opts: {
  userId: string;
  planId: PlanId;
  razorpaySubscriptionId?: string;
  razorpayCustomerId?: string;
  periodEnd?: Date | null;
}) {
  if (!isDbConfigured()) return;
  const plan = BILLING_PLANS[opts.planId];

  await updateUser(opts.userId, {
    plan: opts.planId,
    subscriptionStatus: "active",
    aiEnabled: plan.entitlements.aiEnabled,
    aiRewriteLimit: plan.entitlements.aiRewriteLimit,
    aiOtherLimit: plan.entitlements.aiOtherLimit,
    aiRewriteUsed: 0,
    aiOtherUsed: 0,
    ...(opts.razorpaySubscriptionId
      ? { razorpaySubscriptionId: opts.razorpaySubscriptionId }
      : {}),
    ...(opts.razorpayCustomerId ? { razorpayCustomerId: opts.razorpayCustomerId } : {}),
    ...(opts.periodEnd !== undefined
      ? { subscriptionCurrentPeriodEnd: opts.periodEnd }
      : {}),
  });
}

export async function markSubscriptionCancelled(userId: string) {
  if (!isDbConfigured()) return;
  await updateUser(userId, { subscriptionStatus: "cancelled" });
}

export async function downgradeToFree(userId: string) {
  if (!isDbConfigured()) return;
  await updateUser(userId, {
    plan: "free",
    subscriptionStatus: "none",
    aiEnabled: false,
    razorpaySubscriptionId: null,
    subscriptionCurrentPeriodEnd: null,
  });
}

export async function getUserPlanRow(userId: string) {
  return getUserById(userId);
}
