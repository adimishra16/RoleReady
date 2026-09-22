import { NextResponse } from "next/server";
import { destroyCurrentSession } from "@/lib/appwrite/auth";

export const runtime = "nodejs";

export async function POST() {
  await destroyCurrentSession();
  return NextResponse.json({ success: true });
}
