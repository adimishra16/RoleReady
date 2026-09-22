"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { useAiAccess } from "@/lib/hooks/useAiAccess";
import { formatTokenCount, usagePercent } from "@/lib/ai/format-tokens";
import { cn } from "@/lib/utils";

type Props = {
  /** When false, skip fetching (e.g. signed-out shells). Default true. */
  enabled?: boolean;
  className?: string;
  compact?: boolean;
};

function UsageBar({
  label,
  icon,
  used,
  limit,
  remaining,
}: {
  label: string;
  icon: ReactNode;
  used: number;
  limit: number;
  remaining: number;
}) {
  const pct = usagePercent(used, limit);
  const nearlyOut = limit > 0 && remaining / limit <= 0.15;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
          {icon}
          {label}
        </span>
        <span className="tabular-nums text-muted-foreground">
          <span className={cn("font-semibold text-foreground", nearlyOut && "text-amber-600 dark:text-amber-400")}>
            {formatTokenCount(used)}
          </span>
          {" / "}
          {formatTokenCount(limit)}
          <span className="text-[10px] ml-1.5 opacity-80">used</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            nearlyOut ? "bg-amber-500" : "bg-teal-600"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground tabular-nums">
        {formatTokenCount(remaining)} remaining this month
      </p>
    </div>
  );
}

export function AiUsagePanel({ enabled = true, className, compact }: Props) {
  const { status, loading } = useAiAccess(enabled);

  if (!enabled) return null;

  if (loading && !status) {
    return (
      <div className={cn("rounded-2xl border bg-card p-4 flex items-center gap-2 text-sm text-muted-foreground", className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading AI usage…
      </div>
    );
  }

  if (!status?.authenticated) {
    return (
      <div className={cn("rounded-2xl border bg-card p-4 text-sm text-muted-foreground", className)}>
        <p>Sign in to see your AI token usage.</p>
        <Link href="/sign-in" className="text-teal-700 dark:text-teal-400 font-medium text-xs mt-1 inline-block hover:underline">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <section
      className={cn(
        "rounded-2xl border bg-card shadow-xs",
        compact ? "p-4 space-y-3" : "p-5 sm:p-6 space-y-4",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-teal-700" />
            AI usage this month
          </h2>
          {!compact && (
            <p className="text-[11px] text-muted-foreground">
              {status.isAdmin
                ? "Admin account — unlimited AI (usage not deducted)."
                : status.enabled
                  ? "Tokens reset with each billing cycle when you renew."
                  : "Unlock a plan to start using AI features."}
            </p>
          )}
        </div>
        {!status.enabled && !status.isAdmin && (
          <Link
            href="/pricing"
            className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 hover:underline shrink-0"
          >
            View plans
          </Link>
        )}
      </div>

      <div className={cn("grid gap-4", compact ? "grid-cols-1" : "sm:grid-cols-2")}>
        <UsageBar
          label="Rewrites"
          icon={<Wand2 className="h-3.5 w-3.5 text-muted-foreground" />}
          used={status.rewrite.used}
          limit={status.rewrite.limit}
          remaining={status.rewrite.remaining}
        />
        <UsageBar
          label="Other AI"
          icon={<Sparkles className="h-3.5 w-3.5 text-muted-foreground" />}
          used={status.other.used}
          limit={status.other.limit}
          remaining={status.other.remaining}
        />
      </div>
    </section>
  );
}
