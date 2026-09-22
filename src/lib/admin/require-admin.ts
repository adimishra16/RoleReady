"use server";

import { auth, currentUser } from "@/lib/appwrite/auth";
import {
  ensureAppUserLinked,
  getUserById,
  isDbConfigured,
} from "@/lib/appwrite/db";

export type AppRole = "user" | "admin";

export type AdminGate =
  | { ok: true; userId: string; email: string; role: "admin" }
  | { ok: false; error: string };

/**
 * Server-only admin check. Role is read from the Auth-id `users` row only —
 * never from client input or email-matched legacy rows.
 */
export async function requireAdmin(): Promise<AdminGate> {
  if (!isDbConfigured()) {
    return { ok: false, error: "Database not configured" };
  }

  let userId: string | null = null;
  try {
    const session = await auth();
    userId = session.userId;
  } catch {
    return { ok: false, error: "Auth unavailable" };
  }

  if (!userId) {
    return { ok: false, error: "Sign in required" };
  }

  const appUser = await currentUser();
  const email = appUser?.email || "";

  try {
    await ensureAppUserLinked({
      authUserId: userId,
      email: email || `${userId}@users.appwrite.roleready.local`,
      name: appUser?.name || null,
    });
  } catch (e) {
    console.error("requireAdmin ensureAppUserLinked:", e);
  }

  // Authorize only the document keyed by the signed-in Auth user id
  const row = await getUserById(userId);

  if (!row) {
    return { ok: false, error: "User not found in database" };
  }

  if (row.role !== "admin") {
    return { ok: false, error: "Forbidden" };
  }

  return {
    ok: true,
    userId,
    email: row.email || email,
    role: "admin",
  };
}

export async function getMyRoleAction(): Promise<{
  role: AppRole | null;
  isAdmin: boolean;
  authenticated: boolean;
}> {
  if (!isDbConfigured()) {
    return { role: null, isAdmin: false, authenticated: false };
  }

  try {
    const session = await auth();
    if (!session.userId) {
      return { role: null, isAdmin: false, authenticated: false };
    }

    const appUser = await currentUser();
    try {
      await ensureAppUserLinked({
        authUserId: session.userId,
        email: appUser?.email || `${session.userId}@users.appwrite.roleready.local`,
        name: appUser?.name || null,
      });
    } catch {
      // fall through
    }

    const row = await getUserById(session.userId);
    const role = (row?.role === "admin" ? "admin" : row ? "user" : null) as AppRole | null;
    return {
      role,
      isAdmin: role === "admin",
      authenticated: true,
    };
  } catch {
    return { role: null, isAdmin: false, authenticated: false };
  }
}
