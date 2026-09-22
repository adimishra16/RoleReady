import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { APPWRITE_SESSION_COOKIE, isAppwriteConfigured } from "@/lib/appwrite/config";

const PROTECTED_PREFIXES = ["/admin", "/profile"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsAuth = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (!needsAuth) {
    return NextResponse.next();
  }

  if (!isAppwriteConfigured()) {
    return NextResponse.next();
  }

  const session = req.cookies.get(APPWRITE_SESSION_COOKIE);
  if (!session?.value) {
    const signIn = new URL("/sign-in", req.url);
    signIn.searchParams.set("redirect_url", pathname);
    return NextResponse.redirect(signIn);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
