"use server";

import { auth } from "@clerk/nextjs/server";
import { db, isDbConfigured } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export type AppRole = "user" | "admin";

export type AdminGate =
  | { ok: true; userId: string; email: string; role: "admin" }
  | { ok: false; error: string };

/**
 * Server-only admin check. Role is read from Neon — never from the client.
 */
export async function requireAdmin(): Promise<AdminGate> {
  if (!isDbConfigured || !db) {
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

  const [row] = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!row) {
    return { ok: false, error: "User not found in database" };
  }

  if (row.role !== "admin") {
    return { ok: false, error: "Forbidden" };
  }

  return {
    ok: true,
    userId: row.id,
    email: row.email,
    role: "admin",
  };
}

export async function getMyRoleAction(): Promise<{
  role: AppRole | null;
  isAdmin: boolean;
  authenticated: boolean;
}> {
  if (!isDbConfigured || !db) {
    return { role: null, isAdmin: false, authenticated: false };
  }

  try {
    const session = await auth();
    if (!session.userId) {
      return { role: null, isAdmin: false, authenticated: false };
    }

    const [row] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

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
