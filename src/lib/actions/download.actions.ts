"use server";

import { auth } from "@clerk/nextjs/server";

export type DownloadAuthResult = {
  allowed: boolean;
  authenticated: boolean;
  message?: string;
};

/** PDF download is available only to signed-in users. */
export async function requireSignedInForDownload(): Promise<DownloadAuthResult> {
  try {
    const session = await auth();
    if (session.userId) {
      return { allowed: true, authenticated: true };
    }
  } catch {
    // Clerk unavailable
  }

  return {
    allowed: false,
    authenticated: false,
    message: "Sign in to download your PDF.",
  };
}
