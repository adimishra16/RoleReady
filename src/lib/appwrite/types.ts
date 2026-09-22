/**
 * Domain types for Appwrite rows.
 * RoleReady tables use camelCase columns (migrated schema).
 */

export type UserDoc = {
  $id: string;
  email: string;
  name: string | null;
  role: string;
  target_job_title: string | null;
  industry: string | null;
  ai_enabled: boolean;
  ai_rewrite_limit: number;
  ai_rewrite_used: number;
  ai_other_limit: number;
  ai_other_used: number;
  plan: string;
  subscription_status: string;
  razorpay_customer_id: string | null;
  razorpay_subscription_id: string | null;
  subscription_current_period_end: string | null;
  created_at: string;
  updated_at: string;
};

export type ResumeDoc = {
  $id: string;
  user_id: string;
  title: string;
  template_id: string;
  theme_color: string;
  font_family: string;
  created_at: string;
  updated_at: string;
};

export type ResumeSectionDoc = {
  $id: string;
  resume_id: string;
  type: string;
  order: number;
  /** JSON string */
  content: string;
  created_at: string;
  updated_at: string;
};

export type SharedLinkDoc = {
  $id: string;
  resume_id: string;
  slug: string;
  is_public: boolean;
  created_at: string;
};

export type AppSettingDoc = {
  $id: string;
  key: string;
  value: string;
  updated_at: string;
};

export type BillingEventDoc = {
  $id: string;
  user_id: string | null;
  event_type: string;
  razorpay_event_id: string | null;
  /** JSON string */
  payload: string;
  created_at: string;
};

export type JobMatchDoc = {
  $id: string;
  resume_id: string;
  job_description: string;
  match_score: number;
  /** JSON string */
  missing_keywords: string;
  created_at: string;
};

/** App-facing user shape (camelCase), mapped from UserDoc. */
export type AppUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  targetJobTitle: string | null;
  industry: string | null;
  aiEnabled: boolean;
  aiRewriteLimit: number;
  aiRewriteUsed: number;
  aiOtherLimit: number;
  aiOtherUsed: number;
  plan: string;
  subscriptionStatus: string;
  razorpayCustomerId: string | null;
  razorpaySubscriptionId: string | null;
  subscriptionCurrentPeriodEnd: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

function pick<T>(
  doc: Record<string, unknown>,
  snake: string,
  camel: string,
  fallback: T
): T {
  if (doc[snake] !== undefined && doc[snake] !== null) return doc[snake] as T;
  if (doc[camel] !== undefined && doc[camel] !== null) return doc[camel] as T;
  return fallback;
}

/** Accepts snake_case or camelCase Appwrite attributes (migrated vs new). */
export function mapUserDoc(doc: UserDoc | Record<string, unknown>): AppUser {
  const d = doc as Record<string, unknown>;
  const id = String(d.$id || "");
  const periodEnd = pick<string | null>(d, "subscription_current_period_end", "subscriptionCurrentPeriodEnd", null);
  const created = pick<string | null>(d, "created_at", "createdAt", null);
  const updated = pick<string | null>(d, "updated_at", "updatedAt", null);

  return {
    id,
    email: String(pick(d, "email", "email", "")),
    name: (pick<string | null>(d, "name", "name", null) as string | null) ?? null,
    role: String(pick(d, "role", "role", "user") || "user"),
    targetJobTitle: pick<string | null>(d, "target_job_title", "targetJobTitle", null),
    industry: pick<string | null>(d, "industry", "industry", null),
    aiEnabled: Boolean(pick(d, "ai_enabled", "aiEnabled", false)),
    aiRewriteLimit: Number(pick(d, "ai_rewrite_limit", "aiRewriteLimit", 15)),
    aiRewriteUsed: Number(pick(d, "ai_rewrite_used", "aiRewriteUsed", 0)),
    aiOtherLimit: Number(pick(d, "ai_other_limit", "aiOtherLimit", 10)),
    aiOtherUsed: Number(pick(d, "ai_other_used", "aiOtherUsed", 0)),
    plan: String(pick(d, "plan", "plan", "free") || "free"),
    subscriptionStatus: String(
      pick(d, "subscription_status", "subscriptionStatus", "none") || "none"
    ),
    razorpayCustomerId: pick<string | null>(d, "razorpay_customer_id", "razorpayCustomerId", null),
    razorpaySubscriptionId: pick<string | null>(
      d,
      "razorpay_subscription_id",
      "razorpaySubscriptionId",
      null
    ),
    subscriptionCurrentPeriodEnd: periodEnd ? new Date(periodEnd) : null,
    createdAt: created ? new Date(created) : new Date(),
    updatedAt: updated ? new Date(updated) : new Date(),
  };
}

export function toUserAttributes(partial: Partial<AppUser> & { email?: string }): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (partial.email !== undefined) out.email = partial.email;
  if (partial.name !== undefined) out.name = partial.name;
  if (partial.role !== undefined) out.role = partial.role;
  if (partial.targetJobTitle !== undefined) out.targetJobTitle = partial.targetJobTitle;
  if (partial.industry !== undefined) out.industry = partial.industry;
  if (partial.aiEnabled !== undefined) out.aiEnabled = partial.aiEnabled;
  if (partial.aiRewriteLimit !== undefined) out.aiRewriteLimit = partial.aiRewriteLimit;
  if (partial.aiRewriteUsed !== undefined) out.aiRewriteUsed = partial.aiRewriteUsed;
  if (partial.aiOtherLimit !== undefined) out.aiOtherLimit = partial.aiOtherLimit;
  if (partial.aiOtherUsed !== undefined) out.aiOtherUsed = partial.aiOtherUsed;
  if (partial.plan !== undefined) out.plan = partial.plan;
  if (partial.subscriptionStatus !== undefined) {
    out.subscriptionStatus = partial.subscriptionStatus;
  }
  if (partial.razorpayCustomerId !== undefined) {
    out.razorpayCustomerId = partial.razorpayCustomerId;
  }
  if (partial.razorpaySubscriptionId !== undefined) {
    out.razorpaySubscriptionId = partial.razorpaySubscriptionId;
  }
  if (partial.subscriptionCurrentPeriodEnd !== undefined) {
    out.subscriptionCurrentPeriodEnd = partial.subscriptionCurrentPeriodEnd
      ? partial.subscriptionCurrentPeriodEnd.toISOString()
      : null;
  }
  out.updatedAt = new Date().toISOString();
  return out;
}

export function parseJsonField<T>(raw: unknown, fallback: T): T {
  if (raw == null || raw === "") return fallback;
  if (typeof raw === "object") return raw as T;
  try {
    return JSON.parse(String(raw)) as T;
  } catch {
    return fallback;
  }
}
