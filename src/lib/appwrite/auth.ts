import { cookies } from "next/headers";
import type { Models } from "node-appwrite";
import {
  APPWRITE_SESSION_COOKIE,
  isAppwriteApiKeyConfigured,
  isAppwriteConfigured,
} from "@/lib/appwrite/config";
import { createAdminClient, createSessionClient, ID } from "@/lib/appwrite/server";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

function mapAccount(user: Models.User<Models.Preferences>): AuthUser {
  return {
    id: user.$id,
    email: user.email,
    name: user.name || user.email?.split("@")[0] || "User",
  };
}

export async function getSessionSecret(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(APPWRITE_SESSION_COOKIE)?.value ?? null;
}

export async function setSessionCookie(secret: string, expire: string) {
  const jar = await cookies();
  jar.set(APPWRITE_SESSION_COOKIE, secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expire),
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(APPWRITE_SESSION_COOKIE);
}

/** Current Appwrite Auth user from SSR cookie, or null. */
export async function getLoggedInUser(): Promise<AuthUser | null> {
  if (!isAppwriteConfigured()) return null;
  try {
    const session = await createSessionClient();
    if (!session) return null;
    const user = await session.account.get();
    return mapAccount(user);
  } catch {
    return null;
  }
}

/** Clerk-compatible shape used across server actions. */
export async function auth(): Promise<{ userId: string | null }> {
  const user = await getLoggedInUser();
  return { userId: user?.id ?? null };
}

export async function currentUser(): Promise<AuthUser | null> {
  return getLoggedInUser();
}

export async function requireUser(): Promise<
  { ok: true; user: AuthUser } | { ok: false; error: string }
> {
  const user = await getLoggedInUser();
  if (!user) return { ok: false, error: "Sign in required" };
  return { ok: true, user };
}

export async function createEmailSession(email: string, password: string) {
  if (!isAppwriteApiKeyConfigured()) {
    throw new Error("APPWRITE_API_KEY is required for sign-in");
  }
  const { account } = createAdminClient();
  return account.createEmailPasswordSession(email, password);
}

export async function createEmailAccount(input: {
  email: string;
  password: string;
  name: string;
}) {
  if (!isAppwriteApiKeyConfigured()) {
    throw new Error("APPWRITE_API_KEY is required for sign-up");
  }
  const { account } = createAdminClient();
  const user = await account.create(ID.unique(), input.email, input.password, input.name);
  const session = await account.createEmailPasswordSession(input.email, input.password);
  return { user, session };
}

export async function destroyCurrentSession() {
  try {
    const session = await createSessionClient();
    if (session) {
      await session.account.deleteSession("current");
    }
  } catch {
    // ignore
  }
  await clearSessionCookie();
}

export { isAppwriteConfigured };
