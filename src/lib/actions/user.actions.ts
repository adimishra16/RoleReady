"use server";

import { auth, currentUser } from "@/lib/appwrite/auth";
import {
  ensureAppUserLinked,
  getUserById,
  isDbConfigured,
  updateUser,
  upsertUser,
} from "@/lib/appwrite/db";

export type SyncUserResult = {
  success: boolean;
  userId?: string;
  created?: boolean;
  error?: string;
};

/**
 * Upsert / re-link the signed-in Appwrite Auth user into the `users` collection.
 * Migrated rows keyed by old ids are matched by email and copied onto the Auth user id.
 */
export async function syncAppwriteUserAction(): Promise<SyncUserResult> {
  try {
    if (!isDbConfigured()) {
      return { success: false, error: "Database not configured" };
    }

    const session = await auth();
    if (!session.userId) {
      return {
        success: false,
        error: "Not signed in (server session missing)",
      };
    }

    const appUser = await currentUser();
    if (!appUser) {
      return { success: false, error: "Appwrite Auth user not found" };
    }

    const email = (appUser.email || `${session.userId}@users.appwrite.roleready.local`)
      .trim()
      .toLowerCase();
    const name = appUser.name || (email.includes("@") ? email.split("@")[0] : null) || "User";

    const before = await getUserById(session.userId);
    await ensureAppUserLinked({
      authUserId: session.userId,
      email,
      name,
    });

    return {
      success: true,
      userId: session.userId,
      created: !before,
    };
  } catch (error: any) {
    console.error("syncAppwriteUserAction error:", error);
    const msg = String(error?.message || error || "Failed to sync user");
    if (
      msg.includes("documents.write") ||
      msg.includes("documents.read") ||
      msg.includes("documentsdb") ||
      msg.includes("missing scopes")
    ) {
      return {
        success: false,
        error:
          "Appwrite API key scopes issue. For this project use rows.read + rows.write (TablesDB). Click Update on the key, then restart npm run dev.",
      };
    }
    return { success: false, error: msg };
  }
}

export async function saveUserOnboardingAction({
  name,
  targetJobTitle,
  industry,
}: {
  /** @deprecated Ignored — Auth session id is used when DB is configured. */
  userId?: string;
  /** @deprecated Ignored — Appwrite Auth email is used when DB is configured. */
  email?: string;
  name: string;
  targetJobTitle: string;
  industry: string;
}) {
  try {
    const trimmedName = String(name || "").trim().slice(0, 255) || "User";
    const trimmedTitle = String(targetJobTitle || "").trim().slice(0, 255);
    const trimmedIndustry = String(industry || "").trim().slice(0, 255);

    // Demo / no-DB: allow local onboarding without a session
    if (!isDbConfigured()) {
      return { success: true, userId: "user_demo" };
    }

    const session = await auth();
    if (!session.userId) {
      return { success: false, error: "Sign in required" };
    }

    const appUser = await currentUser();
    if (!appUser) {
      return { success: false, error: "Appwrite Auth user not found" };
    }

    // Always bind identity from the verified session — never from client-supplied email/id
    const ownerId = session.userId;
    const ownerEmail = (appUser.email || `${ownerId}@users.appwrite.roleready.local`)
      .trim()
      .toLowerCase();
    const ownerName = trimmedName || appUser.name || "User";

    await ensureAppUserLinked({
      authUserId: ownerId,
      email: ownerEmail,
      name: ownerName,
    });
    await upsertUser(ownerId, {
      email: ownerEmail,
      name: ownerName,
      targetJobTitle: trimmedTitle || null,
      industry: trimmedIndustry || null,
    });

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
  role: string;
};

export async function getMyProfileAction(): Promise<{
  success: boolean;
  profile?: UserProfile;
  error?: string;
}> {
  try {
    if (!isDbConfigured()) {
      return { success: false, error: "Database not configured" };
    }

    const session = await auth();
    if (!session.userId) {
      return { success: false, error: "Sign in required" };
    }

    const appUser = await currentUser();
    const email = (appUser?.email || "").trim().toLowerCase();
    const name = appUser?.name || "";

    const sync = await syncAppwriteUserAction();
    if (!sync.success) {
      return { success: false, error: sync.error || "Could not sync profile" };
    }

    let row = await getUserById(session.userId);
    if (!row && email) {
      row = await ensureAppUserLinked({
        authUserId: session.userId,
        email,
        name,
      });
    }

    if (!row) {
      return {
        success: false,
        error:
          "Profile could not be created in Appwrite. Check API key scopes (documents.read/write) and that the users collection attributes match.",
      };
    }

    return {
      success: true,
      profile: {
        id: row.id,
        email: row.email || email,
        name: row.name || name || "",
        targetJobTitle: row.targetJobTitle || "",
        industry: row.industry || "",
        role: row.role || "user",
      },
    };
  } catch (error: any) {
    console.error("getMyProfileAction error:", error);
    return { success: false, error: error.message || "Failed to load profile" };
  }
}

export async function updateMyProfileAction(input: {
  name: string;
  targetJobTitle: string;
  industry: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isDbConfigured()) {
      return { success: false, error: "Database not configured" };
    }

    const session = await auth();
    if (!session.userId) {
      return { success: false, error: "Sign in required" };
    }

    const appUser = await currentUser();
    await ensureAppUserLinked({
      authUserId: session.userId,
      email: appUser?.email || `${session.userId}@users.appwrite.roleready.local`,
      name: appUser?.name || input.name,
    });

    const name = String(input.name || "").trim().slice(0, 255);
    const targetJobTitle = String(input.targetJobTitle || "").trim().slice(0, 255);
    const industry = String(input.industry || "").trim().slice(0, 255);

    if (!name) {
      return { success: false, error: "Name is required" };
    }

    await updateUser(session.userId, {
      name,
      targetJobTitle: targetJobTitle || null,
      industry: industry || null,
    });

    return { success: true };
  } catch (error: any) {
    console.error("updateMyProfileAction error:", error);
    return { success: false, error: error.message || "Failed to save profile" };
  }
}
