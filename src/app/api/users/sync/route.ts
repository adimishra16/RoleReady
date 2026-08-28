import { NextResponse } from "next/server";
import { syncClerkUserAction } from "@/lib/actions/user.actions";

export const runtime = "nodejs";

/** Explicit sync endpoint — called after Clerk sign-in. */
export async function POST() {
  const result = await syncClerkUserAction();
  return NextResponse.json(result, {
    status: result.success ? 200 : result.error === "Not signed in" ? 401 : 500,
  });
}

export async function GET() {
  const result = await syncClerkUserAction();
  return NextResponse.json(result, {
    status: result.success ? 200 : result.error === "Not signed in" ? 401 : 500,
  });
}
