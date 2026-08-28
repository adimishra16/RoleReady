import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * Required so auth() / currentUser() work in Server Actions & Route Handlers.
 * Without this, client can show signed-in while server sync sees no session.
 */
export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
