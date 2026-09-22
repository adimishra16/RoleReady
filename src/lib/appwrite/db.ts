import { ID, Query } from "node-appwrite";
import {
  APPWRITE_DATABASE_ID,
  COLLECTIONS,
  isDbConfigured,
} from "@/lib/appwrite/config";
import { createAdminClient, createDatabasesClient } from "@/lib/appwrite/server";
import {
  type AppUser,
  type AppSettingDoc,
  type BillingEventDoc,
  type ResumeDoc,
  type ResumeSectionDoc,
  type SharedLinkDoc,
  type UserDoc,
  mapUserDoc,
  parseJsonField,
  toUserAttributes,
} from "@/lib/appwrite/types";

export { isDbConfigured };
export type { AppUser };

function dbId() {
  return APPWRITE_DATABASE_ID;
}

async function databases() {
  const d = await createDatabasesClient();
  if (!d) throw new Error("Database client unavailable — set APPWRITE_API_KEY or sign in");
  return d;
}

function nowIso() {
  return new Date().toISOString();
}

// ── Users ───────────────────────────────────────────────────────────────────

export async function getUserById(userId: string): Promise<AppUser | null> {
  if (!isDbConfigured()) return null;
  try {
    const d = await databases();
    const doc = (await d.getDocument(dbId(), COLLECTIONS.users, userId)) as unknown as UserDoc;
    return mapUserDoc(doc);
  } catch {
    return null;
  }
}

/**
 * Resolve the Appwrite Auth user to a `users` row.
 * Migrated rows often keep old Clerk ids — match by email, free the unique email,
 * then create a row under the Auth user id.
 *
 * Security: never copy `role` from an email-matched row. Admins must be set on the
 * Auth-id document in Appwrite Console. Billing/AI quotas may transfer for the same
 * verified Auth email so paid users keep access after re-link.
 */
export async function ensureAppUserLinked(input: {
  authUserId: string;
  email: string;
  name?: string | null;
}): Promise<AppUser> {
  const email = input.email.trim().toLowerCase();
  const name = input.name ?? null;

  const byId = await getUserById(input.authUserId);
  if (byId) {
    // Already linked — refresh name only (avoid unique email fights)
    if (name && name !== byId.name) {
      return (await updateUser(input.authUserId, { name })) || byId;
    }
    return byId;
  }

  const byEmail = email ? await getUserByEmail(email) : null;

  // Migrated row under a different id — must free email BEFORE creating the Auth-id row
  if (byEmail && byEmail.id !== input.authUserId) {
    const archivedEmail = `archived+${byEmail.id.slice(0, 12)}-${Date.now()}@roleready.local`;
    await updateUser(byEmail.id, { email: archivedEmail });

    const linked = await upsertUser(input.authUserId, {
      email,
      name: name || byEmail.name,
      // Never inherit privileged role from email match — promote admins in Console only
      role: "user",
      targetJobTitle: byEmail.targetJobTitle,
      industry: byEmail.industry,
      // Do not transfer admin AI unlock; paid plan quotas may still transfer
      aiEnabled: byEmail.role === "admin" ? false : Boolean(byEmail.aiEnabled),
      aiRewriteLimit:
        byEmail.role === "admin"
          ? Number(process.env.AI_REWRITE_DEFAULT_LIMIT || 15)
          : byEmail.aiRewriteLimit,
      aiRewriteUsed: byEmail.role === "admin" ? 0 : byEmail.aiRewriteUsed,
      aiOtherLimit:
        byEmail.role === "admin"
          ? Number(process.env.AI_OTHER_DEFAULT_LIMIT || 10)
          : byEmail.aiOtherLimit,
      aiOtherUsed: byEmail.role === "admin" ? 0 : byEmail.aiOtherUsed,
      plan: byEmail.role === "admin" ? "free" : byEmail.plan,
      subscriptionStatus: byEmail.role === "admin" ? "none" : byEmail.subscriptionStatus,
      razorpayCustomerId: byEmail.role === "admin" ? null : byEmail.razorpayCustomerId,
      razorpaySubscriptionId: byEmail.role === "admin" ? null : byEmail.razorpaySubscriptionId,
      subscriptionCurrentPeriodEnd:
        byEmail.role === "admin" ? null : byEmail.subscriptionCurrentPeriodEnd,
    });

    // Point existing resumes at the new Auth user id
    try {
      await reassignUserResumes(byEmail.id, input.authUserId);
    } catch (e) {
      console.warn("reassignUserResumes failed:", e);
    }

    return linked;
  }

  return upsertUser(input.authUserId, {
    email: email || `${input.authUserId}@users.appwrite.roleready.local`,
    name,
    role: "user",
    aiEnabled: false,
    aiRewriteLimit: Number(process.env.AI_REWRITE_DEFAULT_LIMIT || 15),
    aiRewriteUsed: 0,
    aiOtherLimit: Number(process.env.AI_OTHER_DEFAULT_LIMIT || 10),
    aiOtherUsed: 0,
    plan: "free",
    subscriptionStatus: "none",
  });
}

/** Move resume ownership from an old migrated user id to the Appwrite Auth id. */
async function reassignUserResumes(fromUserId: string, toUserId: string): Promise<void> {
  const d = await databases();
  const res = await d.listDocuments(dbId(), COLLECTIONS.resumes, [
    Query.equal("userId", fromUserId),
    Query.limit(100),
  ]);
  for (const doc of res.documents) {
    await d.updateDocument(dbId(), COLLECTIONS.resumes, doc.$id, {
      userId: toUserId,
      updatedAt: nowIso(),
    });
  }
}

/**
 * Prefer Auth id document; fall back to email match (pre-link migration rows).
 */
export async function resolveAppUser(opts: {
  authUserId: string;
  email?: string | null;
}): Promise<AppUser | null> {
  const byId = await getUserById(opts.authUserId);
  if (byId) return byId;
  if (opts.email) {
    return getUserByEmail(opts.email.trim().toLowerCase());
  }
  return null;
}

export async function getUserByEmail(email: string): Promise<AppUser | null> {
  if (!isDbConfigured()) return null;
  try {
    const d = await databases();
    const res = await d.listDocuments(dbId(), COLLECTIONS.users, [
      Query.equal("email", email),
      Query.limit(1),
    ]);
    if (!res.documents.length) return null;
    return mapUserDoc(res.documents[0] as unknown as UserDoc);
  } catch {
    return null;
  }
}

export async function getUserByRazorpaySubscriptionId(
  subscriptionId: string
): Promise<AppUser | null> {
  if (!isDbConfigured()) return null;
  try {
    const d = await databases();
    const res = await d.listDocuments(dbId(), COLLECTIONS.users, [
      Query.equal("razorpaySubscriptionId", subscriptionId),
      Query.limit(1),
    ]);
    if (!res.documents.length) return null;
    return mapUserDoc(res.documents[0] as unknown as UserDoc);
  } catch {
    return null;
  }
}

export async function listUsers(): Promise<AppUser[]> {
  if (!isDbConfigured()) return [];
  const d = await databases();
  const res = await d.listDocuments(dbId(), COLLECTIONS.users, [
    Query.orderAsc("email"),
    Query.limit(500),
  ]);
  return res.documents.map((doc) => mapUserDoc(doc as unknown as UserDoc));
}

export async function upsertUser(
  userId: string,
  data: Partial<AppUser> & { email: string; name?: string | null }
): Promise<AppUser> {
  const d = await databases();
  const existing = await getUserById(userId);
  const attrs = toUserAttributes({
    email: data.email,
    name: data.name ?? null,
    targetJobTitle: data.targetJobTitle,
    industry: data.industry,
    role: data.role,
    aiEnabled: data.aiEnabled,
    aiRewriteLimit: data.aiRewriteLimit,
    aiRewriteUsed: data.aiRewriteUsed,
    aiOtherLimit: data.aiOtherLimit,
    aiOtherUsed: data.aiOtherUsed,
    plan: data.plan,
    subscriptionStatus: data.subscriptionStatus,
    razorpayCustomerId: data.razorpayCustomerId,
    razorpaySubscriptionId: data.razorpaySubscriptionId,
    subscriptionCurrentPeriodEnd: data.subscriptionCurrentPeriodEnd,
  });

  if (existing) {
    const doc = (await d.updateDocument(
      dbId(),
      COLLECTIONS.users,
      userId,
      attrs
    )) as unknown as UserDoc;
    return mapUserDoc(doc);
  }

  const createAttrs = {
    email: data.email,
    name: data.name ?? null,
    role: data.role ?? "user",
    targetJobTitle: data.targetJobTitle ?? null,
    industry: data.industry ?? null,
    aiEnabled: data.aiEnabled ?? false,
    aiRewriteLimit: data.aiRewriteLimit ?? Number(process.env.AI_REWRITE_DEFAULT_LIMIT || 15),
    aiRewriteUsed: data.aiRewriteUsed ?? 0,
    aiOtherLimit: data.aiOtherLimit ?? Number(process.env.AI_OTHER_DEFAULT_LIMIT || 10),
    aiOtherUsed: data.aiOtherUsed ?? 0,
    plan: data.plan ?? "free",
    subscriptionStatus: data.subscriptionStatus ?? "none",
    razorpayCustomerId: data.razorpayCustomerId ?? null,
    razorpaySubscriptionId: data.razorpaySubscriptionId ?? null,
    subscriptionCurrentPeriodEnd: data.subscriptionCurrentPeriodEnd
      ? data.subscriptionCurrentPeriodEnd.toISOString()
      : null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  const doc = (await d.createDocument(
    dbId(),
    COLLECTIONS.users,
    userId,
    createAttrs
  )) as unknown as UserDoc;

  return mapUserDoc(doc);
}

export async function updateUser(
  userId: string,
  patch: Partial<AppUser>
): Promise<AppUser | null> {
  if (!isDbConfigured()) return null;
  const d = await databases();
  const attrs = toUserAttributes(patch);
  const doc = (await d.updateDocument(
    dbId(),
    COLLECTIONS.users,
    userId,
    attrs
  )) as unknown as UserDoc;
  return mapUserDoc(doc);
}

export async function deleteUser(userId: string): Promise<void> {
  if (!isDbConfigured()) return;
  const d = await databases();
  await d.deleteDocument(dbId(), COLLECTIONS.users, userId);
}

export async function freeEmailForUser(userId: string, email: string): Promise<void> {
  const existing = await getUserByEmail(email);
  if (!existing || existing.id === userId) return;

  if (existing.id.startsWith("user_demo") || existing.id === "demo") {
    await deleteUser(existing.id);
    return;
  }

  await updateUser(existing.id, {
    email: `archived+${existing.id.slice(0, 12)}-${Date.now()}@roleready.local`,
  });
}

// ── App settings ────────────────────────────────────────────────────────────
// Setting "key" is stored as the row $id (e.g. ai_globally_enabled).

export async function getAppSetting(key: string): Promise<string | null> {
  if (!isDbConfigured()) return null;
  try {
    const d = await databases();
    const doc = (await d.getDocument(
      dbId(),
      COLLECTIONS.appSettings,
      key
    )) as unknown as { value?: string };
    return doc.value ?? null;
  } catch {
    return null;
  }
}

export async function setAppSetting(key: string, value: string): Promise<void> {
  const d = await databases();
  const updatedAt = nowIso();
  try {
    await d.updateDocument(dbId(), COLLECTIONS.appSettings, key, {
      value,
      updatedAt,
    });
  } catch {
    await d.createDocument(dbId(), COLLECTIONS.appSettings, key, {
      value,
      updatedAt,
    });
  }
}

// ── Resumes ─────────────────────────────────────────────────────────────────

export type ResumeRecord = {
  id: string;
  userId: string;
  title: string;
  templateId: string;
  themeColor: string;
  fontFamily: string;
  createdAt: Date;
  updatedAt: Date;
};

function mapResume(doc: Record<string, unknown>): ResumeRecord {
  return {
    id: String(doc.$id),
    userId: String(doc.userId ?? doc.user_id ?? ""),
    title: String(doc.title ?? ""),
    templateId: String(doc.templateId ?? doc.template_id ?? "modern"),
    themeColor: String(doc.themeColor ?? doc.theme_color ?? "#0d9488"),
    fontFamily: String(doc.fontFamily ?? doc.font_family ?? "IBM Plex Sans"),
    createdAt: new Date(String(doc.createdAt ?? doc.created_at ?? Date.now())),
    updatedAt: new Date(String(doc.updatedAt ?? doc.updated_at ?? Date.now())),
  };
}

export async function getResume(resumeId: string): Promise<ResumeRecord | null> {
  if (!isDbConfigured()) return null;
  try {
    const d = await databases();
    const doc = (await d.getDocument(
      dbId(),
      COLLECTIONS.resumes,
      resumeId
    )) as unknown as Record<string, unknown>;
    return mapResume(doc);
  } catch {
    return null;
  }
}

export async function countUserResumes(userId: string): Promise<number> {
  if (!isDbConfigured()) return 0;
  const d = await databases();
  const res = await d.listDocuments(dbId(), COLLECTIONS.resumes, [
    Query.equal("userId", userId),
    Query.limit(1),
  ]);
  return res.total;
}

export async function createResume(input: {
  userId: string;
  title: string;
  templateId: string;
  themeColor?: string;
  fontFamily?: string;
}): Promise<ResumeRecord> {
  const d = await databases();
  const createdAt = nowIso();
  const doc = (await d.createDocument(dbId(), COLLECTIONS.resumes, ID.unique(), {
    userId: input.userId,
    title: input.title,
    templateId: input.templateId,
    themeColor: input.themeColor || "#0d9488",
    fontFamily: input.fontFamily || "IBM Plex Sans",
    createdAt,
    updatedAt: createdAt,
  })) as unknown as Record<string, unknown>;
  return mapResume(doc);
}

export async function updateResume(
  resumeId: string,
  patch: {
    title?: string;
    templateId?: string;
    themeColor?: string;
    fontFamily?: string;
  }
): Promise<void> {
  const d = await databases();
  await d.updateDocument(dbId(), COLLECTIONS.resumes, resumeId, {
    ...(patch.title !== undefined ? { title: patch.title } : {}),
    ...(patch.templateId !== undefined ? { templateId: patch.templateId } : {}),
    ...(patch.themeColor !== undefined ? { themeColor: patch.themeColor } : {}),
    ...(patch.fontFamily !== undefined ? { fontFamily: patch.fontFamily } : {}),
    updatedAt: nowIso(),
  });
}

export async function deleteResume(resumeId: string): Promise<void> {
  const d = await databases();
  const sections = await d.listDocuments(dbId(), COLLECTIONS.resumeSections, [
    Query.equal("resumeId", resumeId),
    Query.limit(100),
  ]);
  for (const s of sections.documents) {
    await d.deleteDocument(dbId(), COLLECTIONS.resumeSections, s.$id);
  }
  await d.deleteDocument(dbId(), COLLECTIONS.resumes, resumeId);
}

export async function replaceResumeSections(
  resumeId: string,
  sections: Array<{ type: string; order: number; content: unknown }>
): Promise<void> {
  const d = await databases();
  const existing = await d.listDocuments(dbId(), COLLECTIONS.resumeSections, [
    Query.equal("resumeId", resumeId),
    Query.limit(100),
  ]);
  for (const s of existing.documents) {
    await d.deleteDocument(dbId(), COLLECTIONS.resumeSections, s.$id);
  }

  const ts = nowIso();
  for (const s of sections) {
    await d.createDocument(dbId(), COLLECTIONS.resumeSections, ID.unique(), {
      resumeId,
      type: s.type,
      order: s.order,
      content: typeof s.content === "string" ? s.content : JSON.stringify(s.content ?? {}),
      createdAt: ts,
      updatedAt: ts,
    });
  }
}

export async function createResumeSection(input: {
  resumeId: string;
  type: string;
  order: number;
  content: unknown;
}): Promise<void> {
  const d = await databases();
  const ts = nowIso();
  await d.createDocument(dbId(), COLLECTIONS.resumeSections, ID.unique(), {
    resumeId: input.resumeId,
    type: input.type,
    order: input.order,
    content:
      typeof input.content === "string"
        ? input.content
        : JSON.stringify(input.content ?? {}),
    createdAt: ts,
    updatedAt: ts,
  });
}

export async function listResumeSections(resumeId: string): Promise<
  Array<{ id: string; type: string; order: number; content: unknown }>
> {
  if (!isDbConfigured()) return [];
  const d = await databases();
  const res = await d.listDocuments(dbId(), COLLECTIONS.resumeSections, [
    Query.equal("resumeId", resumeId),
    Query.orderAsc("order"),
    Query.limit(100),
  ]);
  return res.documents.map((doc) => {
    const s = doc as unknown as Record<string, unknown>;
    return {
      id: String(s.$id),
      type: String(s.type ?? ""),
      order: Number(s.order ?? 0),
      content: parseJsonField(s.content, {}),
    };
  });
}

// ── Shared links ────────────────────────────────────────────────────────────

export async function upsertSharedLink(
  resumeId: string,
  slug: string
): Promise<string> {
  const d = await databases();
  const existing = await d.listDocuments(dbId(), COLLECTIONS.sharedLinks, [
    Query.equal("resumeId", resumeId),
    Query.limit(1),
  ]);
  if (existing.documents.length) {
    await d.updateDocument(dbId(), COLLECTIONS.sharedLinks, existing.documents[0].$id, {
      slug,
      isPublic: true,
    });
    return slug;
  }
  await d.createDocument(dbId(), COLLECTIONS.sharedLinks, ID.unique(), {
    resumeId,
    slug,
    isPublic: true,
    createdAt: nowIso(),
  });
  return slug;
}

export async function getSharedLinkBySlug(slug: string): Promise<SharedLinkDoc | null> {
  if (!isDbConfigured()) return null;
  try {
    const d = await databases();
    const res = await d.listDocuments(dbId(), COLLECTIONS.sharedLinks, [
      Query.equal("slug", slug),
      Query.limit(1),
    ]);
    if (!res.documents.length) return null;
    return res.documents[0] as unknown as SharedLinkDoc;
  } catch {
    return null;
  }
}

// ── Billing events ──────────────────────────────────────────────────────────

export async function insertBillingEvent(input: {
  userId?: string | null;
  eventType: string;
  razorpayEventId?: string | null;
  payload: unknown;
}): Promise<void> {
  if (!isDbConfigured()) return;
  const d = await databases();
  await d.createDocument(dbId(), COLLECTIONS.billingEvents, ID.unique(), {
    userId: input.userId ?? null,
    eventType: input.eventType,
    razorpayEventId: input.razorpayEventId ?? null,
    payload: typeof input.payload === "string" ? input.payload : JSON.stringify(input.payload ?? {}),
    createdAt: nowIso(),
  });
}

/** Admin verification helper — throws if API key missing when needed. */
export function assertAdminApiKey() {
  try {
    createAdminClient();
  } catch (e) {
    throw e;
  }
}
