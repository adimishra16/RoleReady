import { NextResponse } from "next/server";
import {
  createEmailSession,
  setSessionCookie,
} from "@/lib/appwrite/auth";
import {
  isAppwriteApiKeyConfigured,
  isAppwriteConfigured,
} from "@/lib/appwrite/config";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    if (!isAppwriteConfigured() || !isAppwriteApiKeyConfigured()) {
      return NextResponse.json(
        { success: false, error: "Appwrite auth is not configured yet" },
        { status: 503 }
      );
    }

    const body = (await req.json()) as { email?: string; password?: string };
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const session = await createEmailSession(email, password);
    await setSessionCookie(session.secret, session.expire);

    return NextResponse.json({ success: true, userId: session.userId });
  } catch (error: any) {
    console.error("sign-in error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Invalid email or password",
      },
      { status: 401 }
    );
  }
}
