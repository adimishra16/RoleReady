import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/require-admin";

/**
 * Server-side gate: only Appwrite users with role === "admin" can see /admin.
 * Regular signed-in users are redirected away (never see the dashboard UI).
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const gate = await requireAdmin();

  if (!gate.ok) {
    if (gate.error === "Sign in required" || gate.error === "Auth unavailable") {
      redirect("/sign-in?redirect_url=/admin");
    }
    // Forbidden / not in DB / not admin
    redirect("/dashboard?error=admin_required");
  }

  return <>{children}</>;
}
