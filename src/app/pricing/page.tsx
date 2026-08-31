"use client";

import React, { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { AuthNavActions, isClerkConfigured } from "@/components/brand/AuthNavActions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLAN_LIST, type PlanId } from "@/lib/billing/plans";
import {
  createSubscriptionCheckoutAction,
  getMyBillingStatusAction,
} from "@/lib/actions/billing.actions";
import { Check, Loader2, Sparkles, ArrowLeft } from "lucide-react";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function PricingPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [billing, setBilling] = useState<{
    plan: string;
    subscriptionStatus: string;
    razorpayConfigured: boolean;
  } | null>(null);

  const refreshBilling = useCallback(async () => {
    const res = await getMyBillingStatusAction();
    if (res.success) {
      setBilling({
        plan: res.plan,
        subscriptionStatus: res.subscriptionStatus,
        razorpayConfigured: res.razorpayConfigured,
      });
    } else {
      setBilling({
        plan: "free",
        subscriptionStatus: "none",
        razorpayConfigured: res.razorpayConfigured,
      });
    }
  }, []);

  useEffect(() => {
    void refreshBilling();
  }, [refreshBilling]);

  const startCheckout = (planId: PlanId) => {
    if (!isClerkConfigured()) {
      setError("Sign in is required before checkout.");
      return;
    }
    setError(null);
    setLoadingPlan(planId);
    startTransition(async () => {
      const res = await createSubscriptionCheckoutAction(planId);
      if (!res.success || !res.checkout) {
        setError(res.error || "Could not start checkout");
        setLoadingPlan(null);
        return;
      }

      if (!window.Razorpay) {
        setError("Razorpay checkout script not loaded. Refresh and try again.");
        setLoadingPlan(null);
        return;
      }

      const { checkout } = res;
      const rzp = new window.Razorpay({
        key: checkout.keyId,
        subscription_id: checkout.subscriptionId,
        name: "RoleReady",
        description: `${checkout.planName} — ₹${checkout.amountInr}/month`,
        prefill: checkout.prefill,
        theme: { color: "#0d9488" },
        handler: async () => {
          setLoadingPlan(null);
          await refreshBilling();
          router.push("/dashboard?upgraded=1");
        },
        modal: {
          ondismiss: () => setLoadingPlan(null),
        },
      });
      rzp.open();
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-md px-4 sm:px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <BrandLogo size="sm" />
          </div>
          <AuthNavActions showDashboardLink />
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">
          <div className="space-y-3 max-w-2xl mx-auto text-center">
          <Badge
            variant="outline"
            className="border-teal-700/20 text-teal-800 dark:text-teal-300"
          >
            AI subscription · INR
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Unlock AI from ₹59/month
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            AI Starter unlocks rewrites, role-based ATS (AI check), job match, and cover letters.
            Upgrade to Pro when you need higher monthly limits.
          </p>
          {billing?.subscriptionStatus === "active" && (
            <p className="text-xs text-teal-800 dark:text-teal-300 font-medium">
              Current plan: <span className="uppercase">{billing.plan}</span> (active)
            </p>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-sm px-3 py-2 max-w-2xl mx-auto">
            {error}
          </div>
        )}

        {!billing?.razorpayConfigured && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs px-3 py-2 max-w-2xl mx-auto">
            Razorpay keys are not set yet. Add <code>RAZORPAY_KEY_ID</code>,{" "}
            <code>RAZORPAY_KEY_SECRET</code>, and plan IDs in <code>.env.local</code> to enable
            checkout.
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {PLAN_LIST.map((plan) => {
            const isCurrent =
              billing?.plan === plan.id && billing.subscriptionStatus === "active";
            const loading = loadingPlan === plan.id && pending;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border bg-card p-6 sm:p-7 flex flex-col ${
                  plan.popular
                    ? "border-teal-600/50 shadow-lg shadow-teal-900/10 ring-1 ring-teal-600/20"
                    : ""
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider bg-teal-700 text-white px-2.5 py-1 rounded-full">
                    Most popular
                  </span>
                )}

                <div className="space-y-1 mb-5">
                  <h2 className="text-lg font-bold">{plan.name}</h2>
                  <p className="text-xs text-muted-foreground">{plan.tagline}</p>
                </div>

                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-4xl font-black tracking-tight">₹{plan.priceInr}</span>
                  <span className="text-sm text-muted-foreground">/ month</span>
                </div>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2 text-xs text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-teal-600 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={
                    plan.popular
                      ? "w-full bg-teal-700 hover:bg-teal-800 text-white gap-2"
                      : "w-full gap-2"
                  }
                  variant={plan.popular ? "default" : "outline"}
                  disabled={loading || isCurrent || !billing?.razorpayConfigured}
                  onClick={() => startCheckout(plan.id)}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {isCurrent
                    ? "Current plan"
                    : loading
                      ? "Opening Razorpay…"
                      : `Subscribe · ₹${plan.priceInr}/mo`}
                </Button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-[11px] text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Payments are processed securely by Razorpay (UPI, cards, netbanking). Platform fee is
          charged by Razorpay on successful payments — RoleReady does not store card details.
        </p>
      </main>
    </div>
  );
}
