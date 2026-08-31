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
 * Resolve email conflict so Clerk user id can always be inserted/upserted.
 * Demo rows are deleted; other orphans get an archived email to free the unique constraint.
 */
async function freeEmailForClerkUser(clerkUserId: string, email: string) {
  if (!db) return;

  const existingByEmail = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingByEmail.length === 0 || existingByEmail[0].id === clerkUserId) {
    return;
  }

  const orphanId = existingByEmail[0].id;
  if (orphanId.startsWith("user_demo") || orphanId === "demo") {
    await db.delete(users).where(eq(users.id, orphanId));
    return;
  }

  await db
    .update(users)
    .set({
      email: `archived+${orphanId.slice(0, 12)}-${Date.now()}@roleready.local`,
      updatedAt: new Date(),
    })
    .where(eq(users.id, orphanId));
}

/**
 * Upsert the signed-in Clerk user into Neon `users`.
 * Always pushes on login — insert or update, no skip paths when DB + session exist.
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
      clerkUser.emailAddresses?.[0]?.emailAddress ||
      // Last resort: never block login sync — placeholder still lands the Clerk id in Neon
      `${session.userId}@users.clerk.roleready.local`;

    const name =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
      clerkUser.username ||
      (email.includes("@") ? email.split("@")[0] : null) ||
      "User";

    const existingById = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    const alreadyExists = existingById.length > 0;

    await freeEmailForClerkUser(session.userId, email);

    await db
      .insert(users)
      .values({
        id: session.userId,
        email,
        name,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email,
          name,
          updatedAt: new Date(),
        },
      });

    return {
      success: true,
      userId: session.userId,
      created: !alreadyExists,
    };
  } catch (error: any) {
    console.error("syncClerkUserAction error:", error);
    // One more attempt after freeing email (race / unique violation)
    try {
      if (!isDbConfigured || !db) throw error;
      const session = await auth();
      const clerkUser = session.userId ? await currentUser() : null;
      if (!session.userId || !clerkUser) throw error;

      const email =
        clerkUser.primaryEmailAddress?.emailAddress ||
        clerkUser.emailAddresses?.[0]?.emailAddress ||
        `${session.userId}@users.clerk.roleready.local`;
      const name =
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
        clerkUser.username ||
        "User";

      await freeEmailForClerkUser(session.userId, email);
      await db
        .insert(users)
        .values({ id: session.userId, email, name })
        .onConflictDoUpdate({
          target: users.id,
          set: { email, name, updatedAt: new Date() },
        });

      return { success: true, userId: session.userId, created: false };
    } catch (retryError: any) {
      console.error("syncClerkUserAction retry failed:", retryError);
      return {
        success: false,
        error: retryError?.message || error?.message || "Failed to sync user",
      };
    }
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

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  targetJobTitle: string;
  industry: string;
};

/** Load signed-in user's basic profile (no role / AI fields). */
export async function getMyProfileAction(): Promise<{
  success: boolean;
  profile?: UserProfile;
  error?: string;
}> {
  try {
    if (!isDbConfigured || !db) {
      return { success: false, error: "Database not configured" };
    }

    const session = await auth();
    if (!session.userId) {
      return { success: false, error: "Sign in required" };
    }

    await syncClerkUserAction();

    const [row] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        targetJobTitle: users.targetJobTitle,
        industry: users.industry,
      })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!row) {
      return { success: false, error: "Profile not found" };
    }

    return {
      success: true,
      profile: {
        id: row.id,
        email: row.email,
        name: row.name || "",
        targetJobTitle: row.targetJobTitle || "",
        industry: row.industry || "",
      },
    };
  } catch (error: any) {
    console.error("getMyProfileAction error:", error);
    return { success: false, error: error.message || "Failed to load profile" };
  }
}

/**
 * Update basic profile only: name, target job title, industry.
 * Does not accept or change role, AI flags, or limits.
 */
export async function updateMyProfileAction(input: {
  name: string;
  targetJobTitle: string;
  industry: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isDbConfigured || !db) {
      return { success: false, error: "Database not configured" };
    }

    const session = await auth();
    if (!session.userId) {
      return { success: false, error: "Sign in required" };
    }

    const name = String(input.name || "").trim().slice(0, 255);
    const targetJobTitle = String(input.targetJobTitle || "").trim().slice(0, 255);
    const industry = String(input.industry || "").trim().slice(0, 255);

    if (!name) {
      return { success: false, error: "Name is required" };
    }

    await db
      .update(users)
      .set({
        name,
        targetJobTitle: targetJobTitle || null,
        industry: industry || null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.userId));

    return { success: true };
  } catch (error: any) {
    console.error("updateMyProfileAction error:", error);
    return { success: false, error: error.message || "Failed to save profile" };
  }
}
