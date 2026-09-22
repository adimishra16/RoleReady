/**
 * Appwrite project + database configuration.
 * Fill NEXT_PUBLIC_* and APPWRITE_* in .env.local (API key can come later).
 */

export const APPWRITE_ENDPOINT =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.replace(/\/$/, "") || "";

export const APPWRITE_PROJECT_ID =
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "";

export const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || "";

export const APPWRITE_DATABASE_ID =
  process.env.APPWRITE_DATABASE_ID || "roleready";

/** Session cookie used for SSR (node-appwrite setSession). */
export const APPWRITE_SESSION_COOKIE = "a_session_roleready";

export const COLLECTIONS = {
  users: process.env.APPWRITE_COLLECTION_USERS || "users",
  resumes: process.env.APPWRITE_COLLECTION_RESUMES || "resumes",
  resumeSections: process.env.APPWRITE_COLLECTION_RESUME_SECTIONS || "resume_sections",
  jobMatches: process.env.APPWRITE_COLLECTION_JOB_MATCHES || "job_matches",
  sharedLinks: process.env.APPWRITE_COLLECTION_SHARED_LINKS || "shared_links",
  billingEvents: process.env.APPWRITE_COLLECTION_BILLING_EVENTS || "billing_events",
  appSettings: process.env.APPWRITE_COLLECTION_APP_SETTINGS || "app_settings",
} as const;

export function isAppwriteConfigured(): boolean {
  return Boolean(
    APPWRITE_ENDPOINT &&
      APPWRITE_PROJECT_ID &&
      !APPWRITE_PROJECT_ID.includes("placeholder") &&
      !APPWRITE_ENDPOINT.includes("placeholder")
  );
}

/** Server API key needed for SSR session create + admin DB writes. */
export function isAppwriteApiKeyConfigured(): boolean {
  return Boolean(APPWRITE_API_KEY && !APPWRITE_API_KEY.includes("placeholder"));
}

export function isDbConfigured(): boolean {
  return (
    isAppwriteConfigured() &&
    Boolean(APPWRITE_DATABASE_ID) &&
    !APPWRITE_DATABASE_ID.includes("placeholder")
  );
}
