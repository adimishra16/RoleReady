"use client";

import { Sparkles } from "lucide-react";

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
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-600/10 hover:bg-teal-700 text-teal-800 hover:text-white dark:text-teal-300 text-[10px] font-semibold transition-all shadow-xs disabled:opacity-40 disabled:pointer-events-none ${className}`}
    >
      <Sparkles className="h-3 w-3" />
      {label}
    </button>
  );
}
