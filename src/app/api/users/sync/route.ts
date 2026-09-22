import { NextResponse } from "next/server";
import { syncAppwriteUserAction } from "@/lib/actions/user.actions";

export const runtime = "nodejs";

function statusFor(result: { success: boolean; error?: string }) {
  if (result.success) return 200;
  if (result.error?.toLowerCase().includes("not signed in")) return 401;
  return 500;
}

/** Explicit sync endpoint — called on every Appwrite sign-in / session restore. */
export async function POST() {
  const result = await syncAppwriteUserAction();
  return NextResponse.json(result, { status: statusFor(result) });
}

export async function GET() {
  const result = await syncAppwriteUserAction();
  return NextResponse.json(result, { status: statusFor(result) });
}
