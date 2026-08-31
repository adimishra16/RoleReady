import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { BILLING_PLANS, type PlanId } from "@/lib/billing/plans";

export async function activateUserSubscription(opts: {
  userId: string;
  planId: PlanId;
  razorpaySubscriptionId?: string;
  razorpayCustomerId?: string;
  periodEnd?: Date | null;
}) {
  if (!db) return;
  const plan = BILLING_PLANS[opts.planId];

  const patch: Record<string, unknown> = {
    plan: opts.planId,
    subscriptionStatus: "active",
    aiEnabled: plan.entitlements.aiEnabled,
    aiRewriteLimit: plan.entitlements.aiRewriteLimit,
    aiOtherLimit: plan.entitlements.aiOtherLimit,
    aiRewriteUsed: 0,
    aiOtherUsed: 0,
    updatedAt: new Date(),
  };

  if (opts.razorpaySubscriptionId) {
    patch.razorpaySubscriptionId = opts.razorpaySubscriptionId;
  }
  if (opts.razorpayCustomerId) {
    patch.razorpayCustomerId = opts.razorpayCustomerId;
  }
  if (opts.periodEnd !== undefined) {
    patch.subscriptionCurrentPeriodEnd = opts.periodEnd;
  }

  await db.update(users).set(patch).where(eq(users.id, opts.userId));
}

export async function markSubscriptionCancelled(userId: string) {
  if (!db) return;
  await db
    .update(users)
    .set({
      subscriptionStatus: "cancelled",
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

export async function downgradeToFree(userId: string) {
  if (!db) return;
  await db
    .update(users)
    .set({
      plan: "free",
      subscriptionStatus: "none",
      aiEnabled: false,
      razorpaySubscriptionId: null,
      subscriptionCurrentPeriodEnd: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}
