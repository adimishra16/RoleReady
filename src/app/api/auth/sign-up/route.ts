import { NextResponse } from "next/server";
import {
  createEmailAccount,
  setSessionCookie,
} from "@/lib/appwrite/auth";
import {
  isAppwriteApiKeyConfigured,
  isAppwriteConfigured,
} from "@/lib/appwrite/config";
import { isDbConfigured, upsertUser } from "@/lib/appwrite/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    if (!isAppwriteConfigured() || !isAppwriteApiKeyConfigured()) {
      return NextResponse.json(
        { success: false, error: "Appwrite auth is not configured yet" },
        { status: 503 }
      );
    }

    const body = (await req.json()) as {
      email?: string;
      password?: string;
      name?: string;
    };
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const password = String(body.password || "");
    const name = String(body.name || "").trim() || email.split("@")[0] || "User";

    if (!email || password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "Valid email and password (min 8 chars) are required",
        },
        { status: 400 }
      );
    }

    const { user, session } = await createEmailAccount({ email, password, name });
    await setSessionCookie(session.secret, session.expire);

    if (isDbConfigured()) {
      try {
        await upsertUser(user.$id, { email, name });
      } catch (e) {
        console.warn("Failed to create users document on sign-up:", e);
      }
    }

    return NextResponse.json({ success: true, userId: user.$id });
  } catch (error: any) {
    console.error("sign-up error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Could not create account",
      },
      { status: 400 }
    );
  }
}
