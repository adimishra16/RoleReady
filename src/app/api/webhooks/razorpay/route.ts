import { createHmac, timingSafeEqual } from "crypto";
import { eq } from "drizzle-orm";
import { db, isDbConfigured } from "@/db";
import { billingEvents, users } from "@/db/schema";
import {
  activateUserSubscription,
  downgradeToFree,
  markSubscriptionCancelled,
} from "@/lib/billing/entitlements";
import type { PlanId } from "@/lib/billing/plans";

export const runtime = "nodejs";

function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function resolvePlanId(notes: Record<string, any> | undefined, fallback?: string): PlanId | null {
  const raw = notes?.planId || notes?.plan || fallback;
  if (raw === "starter" || raw === "pro") return raw;
  return null;
}

async function findUserIdFromSubscription(sub: Record<string, any>): Promise<string | null> {
  const fromNotes = sub?.notes?.userId;
  if (typeof fromNotes === "string" && fromNotes) return fromNotes;

  if (!db || !sub?.id) return null;
  const [row] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.razorpaySubscriptionId, sub.id))
    .limit(1);
  return row?.id || null;
}

export async function POST(req: Request) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET missing — rejecting webhook");
      return new Response(JSON.stringify({ error: "Webhook not configured" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!isDbConfigured || !db) {
      return new Response(JSON.stringify({ error: "Database not configured" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    }

    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const event = JSON.parse(rawBody) as {
      event?: string;
      id?: string;
      payload?: Record<string, any>;
    };

    const eventType = event.event || "unknown";
    const payload = event.payload || {};

    await db.insert(billingEvents).values({
      eventType,
      razorpayEventId: event.id || null,
      payload,
      userId: null,
    });

    const subscriptionEntity =
      payload.subscription?.entity || payload.subscription || null;
    const paymentEntity = payload.payment?.entity || payload.payment || null;

    if (
      eventType === "subscription.activated" ||
      eventType === "subscription.charged"
    ) {
      const sub = subscriptionEntity;
      if (sub) {
        const userId = await findUserIdFromSubscription(sub);
        const planId = resolvePlanId(sub.notes);
        if (userId && planId) {
          const periodEnd = sub.current_end
            ? new Date(Number(sub.current_end) * 1000)
            : null;
          await activateUserSubscription({
            userId,
            planId,
            razorpaySubscriptionId: sub.id,
            razorpayCustomerId: sub.customer_id,
            periodEnd,
          });
        }
      }
    }

    if (eventType === "subscription.cancelled" || eventType === "subscription.completed") {
      const sub = subscriptionEntity;
      if (sub) {
        const userId = await findUserIdFromSubscription(sub);
        if (userId) {
          await markSubscriptionCancelled(userId);
        }
      }
    }

    if (eventType === "subscription.halted") {
      const sub = subscriptionEntity;
      if (sub) {
        const userId = await findUserIdFromSubscription(sub);
        if (userId) {
          await downgradeToFree(userId);
        }
      }
    }

    // First auth payment sometimes arrives as payment.captured with subscription notes
    if (eventType === "payment.captured" && paymentEntity?.notes?.userId) {
      const planId = resolvePlanId(paymentEntity.notes);
      const userId = String(paymentEntity.notes.userId);
      if (planId && userId) {
        await activateUserSubscription({
          userId,
          planId,
          razorpaySubscriptionId: paymentEntity.notes.subscriptionId,
        });
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return new Response(JSON.stringify({ error: "Webhook handler failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
