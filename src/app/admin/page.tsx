"use client";

import React, { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { AuthNavActions } from "@/components/brand/AuthNavActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  listAdminUsersAction,
  setGlobalAiEnabledAction,
  updateUserAiPermissionsAction,
  grantUserSubscriptionAction,
  type AdminUserRow,
} from "@/lib/actions/admin.actions";
import { getMyRoleAction } from "@/lib/admin/require-admin";
import {
  ArrowLeft,
  Loader2,
  RefreshCw,
  Shield,
  Sparkles,
  RotateCcw,
  Crown,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [globallyEnabled, setGloballyEnabled] = useState(false);
  const [query, setQuery] = useState("");
  const [drafts, setDrafts] = useState<
    Record<string, { rewriteLimit: string; otherLimit: string }>
  >({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const role = await getMyRoleAction();
    if (!role.isAdmin) {
      setForbidden(true);
      setLoading(false);
      return;
    }

    const res = await listAdminUsersAction();
    if (!res.success) {
      setForbidden(res.error === "Forbidden");
      setError(res.error || "Failed to load");
      setLoading(false);
      return;
    }

    setUsers(res.users || []);
    setGloballyEnabled(Boolean(res.globallyEnabled));
    const nextDrafts: Record<string, { rewriteLimit: string; otherLimit: string }> = {};
    for (const u of res.users || []) {
      nextDrafts[u.id] = {
        rewriteLimit: String(u.aiRewriteLimit),
        otherLimit: String(u.aiOtherLimit),
      };
    }
    setDrafts(nextDrafts);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        (u.name || "").toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [users, query]);

  const toggleGlobal = (enabled: boolean) => {
    startTransition(async () => {
      const res = await setGlobalAiEnabledAction(enabled);
      if (res.success) {
        setGloballyEnabled(enabled);
      } else {
        setError(res.error || "Failed to update global AI");
      }
    });
  };

  const grantPlan = (userId: string, plan: "free" | "starter" | "pro") => {
    startTransition(async () => {
      const res = await grantUserSubscriptionAction({ userId, plan });
      if (res.success) {
        await load();
      } else {
        setError(res.error || "Failed to update subscription");
      }
    });
  };

  const saveUser = (
    userId: string,
    patch: {
      aiEnabled?: boolean;
      aiRewriteLimit?: number;
      aiOtherLimit?: number;
      resetRewriteUsed?: boolean;
      resetOtherUsed?: boolean;
    }
  ) => {
    startTransition(async () => {
      const res = await updateUserAiPermissionsAction({ userId, ...patch });
      if (!res.success) {
        setError(res.error || "Update failed");
        return;
      }
      await load();
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-teal-700" />
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 bg-background text-center">
        <Shield className="h-10 w-10 text-muted-foreground" />
        <h1 className="text-xl font-bold">Admin access required</h1>
        <p className="text-sm text-muted-foreground max-w-md">
          Your account is not an admin. Roles are set only in the database (Neon SQL), not from this
          app.
        </p>
        <Link href="/dashboard">
          <Button variant="outline">Back to dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-md px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <BrandLogo size="sm" />
            <Badge
              variant="outline"
              className="hidden sm:inline-flex border-teal-700/30 text-teal-800 dark:text-teal-300"
            >
              Admin
            </Badge>
          </div>
          <AuthNavActions showDashboardLink compact />
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
              <Shield className="h-6 w-6 text-teal-700" />
              Admin dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Grant AI access and set token limits. Role changes are SQL-only (
              <code className="text-[11px] bg-muted px-1 rounded">UPDATE users SET role = &apos;admin&apos; …</code>
              ).
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 self-start"
            onClick={() => void load()}
            disabled={pending}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${pending ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-sm px-3 py-2">
            {error}
          </div>
        )}

        {/* Global AI */}
        <section className="rounded-xl border bg-card p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-teal-700/10 text-teal-700 flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-semibold text-sm">Global AI switch</h2>
                <p className="text-xs text-muted-foreground">
                  Master kill-switch for all AI features (`app_settings.ai_globally_enabled`).
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={globallyEnabled ? "default" : "outline"}>
                {globallyEnabled ? "ON" : "OFF"}
              </Badge>
              <Button
                size="sm"
                variant={globallyEnabled ? "outline" : "default"}
                className={!globallyEnabled ? "bg-teal-700 hover:bg-teal-800 text-white" : ""}
                disabled={pending}
                onClick={() => toggleGlobal(!globallyEnabled)}
              >
                {globallyEnabled ? "Disable globally" : "Enable globally"}
              </Button>
            </div>
          </div>
        </section>

        {/* Users */}
        <section className="rounded-xl border bg-card overflow-hidden">
          <div className="p-4 sm:p-5 border-b flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <div>
              <h2 className="font-semibold text-sm">Users, plans & token rights</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Grant Starter or Pro to give someone the full subscription without Razorpay.
              </p>
              <p className="text-xs text-muted-foreground">{users.length} accounts</p>
            </div>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search email, name, role…"
              className="sm:max-w-xs h-9 text-sm"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[720px]">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 font-medium">User</th>
                  <th className="px-3 py-2.5 font-medium">Role</th>
                  <th className="px-3 py-2.5 font-medium">Plan</th>
                  <th className="px-3 py-2.5 font-medium">AI</th>
                  <th className="px-3 py-2.5 font-medium">Rewrite tokens</th>
                  <th className="px-3 py-2.5 font-medium">Other tokens</th>
                  <th className="px-4 py-2.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const draft = drafts[u.id] || {
                    rewriteLimit: String(u.aiRewriteLimit),
                    otherLimit: String(u.aiOtherLimit),
                  };
                  return (
                    <tr key={u.id} className="border-t align-top">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-foreground truncate max-w-[220px]">
                          {u.name || "—"}
                        </p>
                        <p className="text-muted-foreground truncate max-w-[220px]">{u.email}</p>
                      </td>
                      <td className="px-3 py-3">
                        <Badge
                          variant="outline"
                          className={
                            u.role === "admin"
                              ? "border-amber-500/40 text-amber-800 dark:text-amber-300"
                              : ""
                          }
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 space-y-1.5 min-w-[140px]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge
                            variant="outline"
                            className={
                              u.plan === "pro"
                                ? "border-teal-600/40 text-teal-800 dark:text-teal-300 capitalize"
                                : u.plan === "starter"
                                  ? "border-sky-500/40 text-sky-800 dark:text-sky-300 capitalize"
                                  : "capitalize"
                            }
                          >
                            {u.plan}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {u.subscriptionStatus}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <Button
                            size="sm"
                            variant={u.plan === "pro" ? "default" : "outline"}
                            className={`h-6 px-1.5 text-[10px] gap-0.5 ${
                              u.plan === "pro"
                                ? "bg-teal-700 hover:bg-teal-800 text-white"
                                : ""
                            }`}
                            disabled={pending}
                            title="Grant full AI Pro subscription (₹119 entitlements)"
                            onClick={() => grantPlan(u.id, "pro")}
                          >
                            <Crown className="h-2.5 w-2.5" />
                            Pro
                          </Button>
                          <Button
                            size="sm"
                            variant={u.plan === "starter" ? "secondary" : "outline"}
                            className="h-6 px-1.5 text-[10px]"
                            disabled={pending}
                            title="Grant AI Starter (₹59 entitlements)"
                            onClick={() => grantPlan(u.id, "starter")}
                          >
                            Starter
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-1.5 text-[10px] text-muted-foreground"
                            disabled={pending || u.plan === "free"}
                            title="Revoke subscription → free"
                            onClick={() => grantPlan(u.id, "free")}
                          >
                            Free
                          </Button>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <Button
                          size="sm"
                          variant={u.aiEnabled ? "default" : "outline"}
                          className={`h-7 text-[11px] ${
                            u.aiEnabled ? "bg-teal-700 hover:bg-teal-800 text-white" : ""
                          }`}
                          disabled={pending}
                          onClick={() => saveUser(u.id, { aiEnabled: !u.aiEnabled })}
                        >
                          {u.aiEnabled ? "Enabled" : "Disabled"}
                        </Button>
                      </td>
                      <td className="px-3 py-3 space-y-1.5">
                        <p className="text-muted-foreground">
                          Used {u.aiRewriteUsed} / limit
                        </p>
                        <div className="flex items-center gap-1.5">
                          <Input
                            type="number"
                            min={0}
                            className="h-7 w-20 text-xs"
                            value={draft.rewriteLimit}
                            onChange={(e) =>
                              setDrafts((prev) => ({
                                ...prev,
                                [u.id]: { ...draft, rewriteLimit: e.target.value },
                              }))
                            }
                          />
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-7 text-[11px]"
                            disabled={pending}
                            onClick={() =>
                              saveUser(u.id, {
                                aiRewriteLimit: Number(draft.rewriteLimit),
                              })
                            }
                          >
                            Save
                          </Button>
                        </div>
                      </td>
                      <td className="px-3 py-3 space-y-1.5">
                        <p className="text-muted-foreground">Used {u.aiOtherUsed} / limit</p>
                        <div className="flex items-center gap-1.5">
                          <Input
                            type="number"
                            min={0}
                            className="h-7 w-20 text-xs"
                            value={draft.otherLimit}
                            onChange={(e) =>
                              setDrafts((prev) => ({
                                ...prev,
                                [u.id]: { ...draft, otherLimit: e.target.value },
                              }))
                            }
                          />
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-7 text-[11px]"
                            disabled={pending}
                            onClick={() =>
                              saveUser(u.id, {
                                aiOtherLimit: Number(draft.otherLimit),
                              })
                            }
                          >
                            Save
                          </Button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-[11px] gap-1"
                          disabled={pending}
                          title="Reset usage counters to 0"
                          onClick={() =>
                            saveUser(u.id, {
                              resetRewriteUsed: true,
                              resetOtherUsed: true,
                            })
                          }
                        >
                          <RotateCcw className="h-3 w-3" />
                          Reset used
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                      No users match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Promote yourself once in Neon Console:
          <br />
          <code className="bg-muted px-1.5 py-0.5 rounded text-[10px]">
            UPDATE users SET role = &apos;admin&apos; WHERE email = &apos;your@email.com&apos;;
          </code>
        </p>
      </main>
    </div>
  );
}
