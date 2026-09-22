"use client";

import type { AiAccessStatus } from "@/lib/ai/access-types";
import { formatTokenCount } from "@/lib/ai/format-tokens";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type Bucket = "rewrite" | "other";

type Props = {
  status: AiAccessStatus;
  bucket: Bucket;
  locked?: boolean;
  className?: string;
};

const LABELS: Record<Bucket, string> = {
  rewrite: "Rewrites",
  other: "Other AI",
};

/** Compact used/limit strip for AI modals. */
export function AiCreditsStrip({ status, bucket, locked, className }: Props) {
  const row = status[bucket];
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 text-[11px] rounded-lg border bg-muted/30 px-3 py-2",
        className
      )}
    >
      <span className="text-muted-foreground">
        {LABELS[bucket]} used:{" "}
        <span className="font-semibold text-foreground tabular-nums">
          {formatTokenCount(row.used)}/{formatTokenCount(row.limit)}
        </span>
        <span className="text-muted-foreground/80 ml-1.5">
          ({formatTokenCount(row.remaining)} left)
        </span>
      </span>
      {locked && (
        <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
          <Lock className="h-3 w-3" /> Locked
        </span>
      )}
    </div>
  );
}
