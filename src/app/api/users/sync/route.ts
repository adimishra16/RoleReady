import { NextResponse } from "next/server";
import { syncClerkUserAction } from "@/lib/actions/user.actions";

export const runtime = "nodejs";

function statusFor(result: { success: boolean; error?: string }) {
  if (result.success) return 200;
  if (result.error?.toLowerCase().includes("not signed in")) return 401;
  return 500;
}

/** Explicit sync endpoint — called on every Clerk sign-in / session restore. */
export async function POST() {
  const result = await syncClerkUserAction();
  return NextResponse.json(result, { status: statusFor(result) });
}

export async function GET() {
  const result = await syncClerkUserAction();
  return NextResponse.json(result, { status: statusFor(result) });
}
