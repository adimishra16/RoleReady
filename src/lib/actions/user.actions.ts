"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { db, isDbConfigured } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export type SyncUserResult = {
  success: boolean;
  userId?: string;
  created?: boolean;
  error?: string;
};

/**
 * Upsert the signed-in Clerk user into Neon `users`.
 * Requires Clerk middleware so the session cookie is visible to auth().
 */
export async function syncClerkUserAction(): Promise<SyncUserResult> {
  try {
    if (!isDbConfigured || !db) {
      return { success: false, error: "Database not configured" };
    }

    const session = await auth();
    if (!session.userId) {
      return {
        success: false,
        error: "Not signed in (server session missing — ensure middleware is running)",
      };
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return { success: false, error: "Clerk user not found via API" };
    }

    const email =
      clerkUser.primaryEmailAddress?.emailAddress ||
      clerkUser.emailAddresses?.[0]?.emailAddress;

    if (!email) {
      return { success: false, error: "Clerk user has no email address" };
    }

    const name =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
      clerkUser.username ||
      email.split("@")[0] ||
      "User";

    const existingById = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (existingById.length > 0) {
      await db
        .update(users)
        .set({
          email,
          name,
          updatedAt: new Date(),
        })
        .where(eq(users.id, session.userId));
      return { success: true, userId: session.userId, created: false };
    }

    // Email may already exist under a different id (old demo row) — reclaim or insert
    const existingByEmail = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingByEmail.length > 0 && existingByEmail[0].id !== session.userId) {
      // Prefer Clerk id: delete orphan row only if it looks like a demo placeholder
      const orphanId = existingByEmail[0].id;
      if (orphanId.startsWith("user_demo") || orphanId === "demo") {
        await db.delete(users).where(eq(users.id, orphanId));
      } else {
        // Keep data: update email on orphan to free unique constraint, then insert
        await db
          .update(users)
          .set({
            email: `archived+${orphanId.slice(0, 8)}@roleready.local`,
            updatedAt: new Date(),
          })
          .where(eq(users.id, orphanId));
      }
    }

    await db.insert(users).values({
      id: session.userId,
      email,
      name,
    });

    return { success: true, userId: session.userId, created: true };
  } catch (error: any) {
    console.error("syncClerkUserAction error:", error);
    return { success: false, error: error.message || "Failed to sync user" };
  }
}

export async function saveUserOnboardingAction({
  userId,
  email,
  name,
  targetJobTitle,
  industry,
}: {
  userId: string;
  email: string;
  name: string;
  targetJobTitle: string;
  industry: string;
}) {
  try {
    let ownerId = userId;
    let ownerEmail = email;
    let ownerName = name;

    try {
      const session = await auth();
      const clerkUser = session.userId ? await currentUser() : null;
      if (session.userId) {
        ownerId = session.userId;
      }
      if (clerkUser) {
        ownerEmail =
          clerkUser.primaryEmailAddress?.emailAddress ||
          clerkUser.emailAddresses?.[0]?.emailAddress ||
          ownerEmail;
        ownerName =
          [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
          name ||
          ownerName;
      }
    } catch {
      // Demo mode without Clerk
    }

    // Always sync identity first when possible
    if (ownerId && ownerId !== "user_demo") {
      await syncClerkUserAction();
    }

    if (isDbConfigured && db) {
      await db
        .insert(users)
        .values({
          id: ownerId,
          email: ownerEmail,
          name: ownerName,
          targetJobTitle,
          industry,
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            email: ownerEmail,
            name: ownerName,
            targetJobTitle,
            industry,
            updatedAt: new Date(),
          },
        });
    }
    return { success: true, userId: ownerId };
  } catch (error: any) {
    console.error("Save User Onboarding Error:", error);
    return { success: false, error: error.message };
  }
}
