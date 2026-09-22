import { NextResponse } from "next/server";
import { getLoggedInUser } from "@/lib/appwrite/auth";

export const runtime = "nodejs";

export async function GET() {
  const user = await getLoggedInUser();
  if (!user) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
}
