export type PlanId = "starter" | "pro";

export type BillingPlan = {
  id: PlanId;
  name: string;
  tagline: string;
  priceInr: number;
  amountPaise: number;
  interval: "monthly";
  popular?: boolean;
  features: string[];
  entitlements: {
    aiEnabled: boolean;
    aiRewriteLimit: number;
    aiOtherLimit: number;
  };
};

/** RoleReady subscriptions (INR / month) — AI features start at ₹59 */
export const BILLING_PLANS: Record<PlanId, BillingPlan> = {
  starter: {
    id: "starter",
    name: "AI Starter",
    tagline: "Unlock all AI features for your job hunt",
    priceInr: 59,
    amountPaise: 5900,
    interval: "monthly",
    popular: true,
    features: [
      "AI bullet rewriter (STAR / XYZ)",
      "Role-based ATS score (out of 100)",
      "AI ATS deep check",
      "Job Matcher + cover letter + summary",
      "30 rewrite tokens / month",
      "20 other AI tokens / month",
      "Up to 3 resumes · cancel anytime",
    ],
    entitlements: {
      aiEnabled: true,
      aiRewriteLimit: 30,
      aiOtherLimit: 20,
    },
  },
  pro: {
    id: "pro",
    name: "AI Pro",
    tagline: "Higher limits when you’re applying at scale",
    priceInr: 119,
    amountPaise: 11900,
    interval: "monthly",
    features: [
      "Everything in AI Starter",
      "100 rewrite tokens / month",
      "50 other AI tokens / month",
      "Best for active interview seasons",
      "Priority AI capacity",
      "Cancel anytime",
    ],
    entitlements: {
      aiEnabled: true,
      aiRewriteLimit: 100,
      aiOtherLimit: 50,
    },
  },
};

export const PLAN_LIST = Object.values(BILLING_PLANS);

export function getPlan(planId: string | null | undefined): BillingPlan | null {
  if (planId === "starter" || planId === "pro") return BILLING_PLANS[planId];
  return null;
}

export function getRazorpayPlanId(planId: PlanId): string | null {
  if (planId === "starter") {
    return process.env.RAZORPAY_PLAN_ID_STARTER || null;
  }
  return process.env.RAZORPAY_PLAN_ID_PRO || null;
}
