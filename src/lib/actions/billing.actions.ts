"use server";

import { auth, currentUser } from "@/lib/appwrite/auth";
import { getUserById, isDbConfigured, updateUser } from "@/lib/appwrite/db";
import {
  BILLING_PLANS,
  getPlan,
  getRazorpayPlanId,
  type PlanId,
} from "@/lib/billing/plans";
import { getRazorpayClient, getRazorpayKeyId, isRazorpayConfigured } from "@/lib/billing/razorpay";
import { syncAppwriteUserAction } from "@/lib/actions/user.actions";

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
  if (!isDbConfigured()) {
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

    const row = await getUserById(session.userId);

    return {
      success: true,
      plan: row?.plan || "free",
      subscriptionStatus: row?.subscriptionStatus || "none",
      periodEnd: row?.subscriptionCurrentPeriodEnd
        ? row.subscriptionCurrentPeriodEnd.toISOString()
        : null,
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

    await syncAppwriteUserAction();
    const appUser = await currentUser();
    const email = appUser?.email;
    if (!email) {
      return { success: false, error: "Account email required for billing" };
    }

    const name = appUser?.name || email.split("@")[0] || "User";

    if (!isDbConfigured()) {
      return { success: false, error: "Database not configured" };
    }

    const razorpay = getRazorpayClient();
    const keyId = getRazorpayKeyId();
    if (!razorpay || !keyId) {
      return { success: false, error: "Razorpay client unavailable" };
    }

    const existing = await getUserById(session.userId);

    if (existing?.subscriptionStatus === "active" && existing.plan === planId) {
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
      await updateUser(session.userId, { razorpayCustomerId: customerId });
    }

    const plan = BILLING_PLANS[planId];
    const subscription = await razorpay.subscriptions.create({
      plan_id: razorpayPlanId,
      total_count: 120,
      customer_notify: 1,
      notes: {
        userId: session.userId,
        planId,
        app: "roleready",
      },
    });

    await updateUser(session.userId, {
      plan: planId,
      subscriptionStatus: "created",
      razorpaySubscriptionId: subscription.id,
      razorpayCustomerId: customerId,
    });

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
