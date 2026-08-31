"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db, isDbConfigured } from "@/db";
import { users } from "@/db/schema";
import {
  BILLING_PLANS,
  getPlan,
  getRazorpayPlanId,
  type PlanId,
} from "@/lib/billing/plans";
import { getRazorpayClient, getRazorpayKeyId, isRazorpayConfigured } from "@/lib/billing/razorpay";
import { syncClerkUserAction } from "@/lib/actions/user.actions";

export type SubscriptionCheckoutPayload = {
  keyId: string;
  subscriptionId: string;
  planId: PlanId;
  planName: string;
  amountInr: number;
  prefill: { name: string; email: string };
};

export async function getMyBillingStatusAction(): Promise<{
  success: boolean;
  plan: string;
  subscriptionStatus: string;
  periodEnd: string | null;
  razorpayConfigured: boolean;
  error?: string;
}> {
  const razorpayConfigured = isRazorpayConfigured();
  if (!isDbConfigured || !db) {
    return {
      success: false,
      plan: "free",
      subscriptionStatus: "none",
      periodEnd: null,
      razorpayConfigured,
      error: "Database not configured",
    };
  }

  try {
    const session = await auth();
    if (!session.userId) {
      return {
        success: true,
        plan: "free",
        subscriptionStatus: "none",
        periodEnd: null,
        razorpayConfigured,
      };
    }

    const [row] = await db
      .select({
        plan: users.plan,
        subscriptionStatus: users.subscriptionStatus,
        periodEnd: users.subscriptionCurrentPeriodEnd,
      })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    return {
      success: true,
      plan: row?.plan || "free",
      subscriptionStatus: row?.subscriptionStatus || "none",
      periodEnd: row?.periodEnd ? row.periodEnd.toISOString() : null,
      razorpayConfigured,
    };
  } catch (e: any) {
    return {
      success: false,
      plan: "free",
      subscriptionStatus: "none",
      periodEnd: null,
      razorpayConfigured,
      error: e.message || "Failed to load billing",
    };
  }
}

export async function createSubscriptionCheckoutAction(
  planId: PlanId
): Promise<{
  success: boolean;
  checkout?: SubscriptionCheckoutPayload;
  error?: string;
}> {
  try {
    if (!getPlan(planId)) {
      return { success: false, error: "Invalid plan" };
    }
    if (!isRazorpayConfigured()) {
      return {
        success: false,
        error: "Razorpay is not configured. Add keys in .env.local.",
      };
    }

    const razorpayPlanId = getRazorpayPlanId(planId);
    if (!razorpayPlanId) {
      return {
        success: false,
        error: `Missing Razorpay plan id for ${planId}. Set RAZORPAY_PLAN_ID_${planId.toUpperCase()} in env.`,
      };
    }

    const session = await auth();
    if (!session.userId) {
      return { success: false, error: "Sign in required" };
    }

    await syncClerkUserAction();
    const clerkUser = await currentUser();
    const email =
      clerkUser?.primaryEmailAddress?.emailAddress ||
      clerkUser?.emailAddresses?.[0]?.emailAddress;
    if (!email) {
      return { success: false, error: "Account email required for billing" };
    }

    const name =
      [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
      clerkUser?.username ||
      email.split("@")[0] ||
      "User";

    if (!db) {
      return { success: false, error: "Database not configured" };
    }

    const razorpay = getRazorpayClient();
    const keyId = getRazorpayKeyId();
    if (!razorpay || !keyId) {
      return { success: false, error: "Razorpay client unavailable" };
    }

    const [existing] = await db
      .select({
        razorpayCustomerId: users.razorpayCustomerId,
        subscriptionStatus: users.subscriptionStatus,
        plan: users.plan,
      })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (
      existing?.subscriptionStatus === "active" &&
      existing.plan === planId
    ) {
      return { success: false, error: "You already have this plan active." };
    }

    let customerId = existing?.razorpayCustomerId || undefined;
    if (!customerId) {
      const customer = await razorpay.customers.create({
        name,
        email,
        notes: {
          userId: session.userId,
        },
      });
      customerId = customer.id;
      await db
        .update(users)
        .set({
          razorpayCustomerId: customerId,
          updatedAt: new Date(),
        })
        .where(eq(users.id, session.userId));
    }

    const plan = BILLING_PLANS[planId];
    const subscription = await razorpay.subscriptions.create({
      plan_id: razorpayPlanId,
      total_count: 120, // ~10 years of monthly cycles; cancel anytime
      customer_notify: 1,
      notes: {
        userId: session.userId,
        planId,
        app: "roleready",
      },
    });

    await db
      .update(users)
      .set({
        plan: planId,
        subscriptionStatus: "created",
        razorpaySubscriptionId: subscription.id,
        razorpayCustomerId: customerId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.userId));

    return {
      success: true,
      checkout: {
        keyId,
        subscriptionId: subscription.id,
        planId,
        planName: plan.name,
        amountInr: plan.priceInr,
        prefill: { name, email },
      },
    };
  } catch (error: any) {
    console.error("createSubscriptionCheckoutAction:", error);
    return {
      success: false,
      error: error?.error?.description || error.message || "Could not start checkout",
    };
  }
}
