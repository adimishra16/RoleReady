"use client";

import { PenLine } from "lucide-react";

interface Props {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

/** Compact inline trigger for section AI rewrite */
export function AiRewriteButton({
  onClick,
  disabled,
  label = "Rewrite",
  className = "",
}: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground text-[10px] font-medium tracking-tight transition-colors disabled:opacity-40 disabled:pointer-events-none ${className}`}
    >
      <PenLine className="h-3 w-3" />
      {label}
    </button>
  );
}
