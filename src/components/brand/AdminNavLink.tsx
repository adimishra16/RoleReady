"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getMyRoleAction } from "@/lib/admin/require-admin";
import { isClerkConfigured } from "@/components/brand/AuthNavActions";
import { Shield } from "lucide-react";

/** Shows Admin link only when Neon role === admin */
export function AdminNavLink({ compact = false }: { compact?: boolean }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!isClerkConfigured()) return;
    let cancelled = false;
    void (async () => {
      const res = await getMyRoleAction();
      if (!cancelled) setIsAdmin(res.isAdmin);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!isAdmin) return null;

  return (
    <Link href="/admin" className="shrink-0">
      <Button
        variant="ghost"
        size="sm"
        className="text-xs px-2 sm:px-3 gap-1 text-amber-800 dark:text-amber-300 hover:text-amber-900"
      >
        <Shield className="h-3.5 w-3.5" />
        <span className={compact ? "hidden sm:inline" : ""}>Admin</span>
      </Button>
    </Link>
  );
}
