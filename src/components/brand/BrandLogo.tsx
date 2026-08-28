"use client";

import React, { useId } from "react";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand";

type LogoSize = "sm" | "md" | "lg";

interface BrandLogoProps {
  size?: LogoSize;
  showWordmark?: boolean;
  showTagline?: boolean;
  className?: string;
  wordmarkClassName?: string;
}

const SIZE = {
  sm: { mark: "h-7 w-7", text: "text-sm", gap: "gap-2", tagline: "text-[10px]" },
  md: { mark: "h-9 w-9", text: "text-base", gap: "gap-2.5", tagline: "text-[11px]" },
  lg: { mark: "h-11 w-11", text: "text-xl", gap: "gap-3", tagline: "text-xs" },
} as const;

/** RoleReady mark: teal badge with R + ready check */
export function BrandMark({ className }: { className?: string }) {
  const gradId = useId().replace(/:/g, "");

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <rect width="40" height="40" rx="11" fill={`url(#${gradId})`} />
      <path
        d="M12.5 28V12h8.2c2.85 0 4.85 1.7 4.85 4.2 0 2.05-1.2 3.45-3.05 3.95L27 28h-3.35l-4.2-7.15H15.7V28H12.5Zm3.2-10.05h4.75c1.45 0 2.3-.75 2.3-1.9s-.85-1.9-2.3-1.9H15.7v3.8Z"
        fill="white"
      />
      <path
        d="M24.2 20.6 27.1 17.7l1.35 1.35-4.25 4.25-2.45-2.45 1.35-1.35 1.1 1.1Z"
        fill="#FBBF24"
      />
      <defs>
        <linearGradient id={gradId} x1="6" y1="4" x2="36" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0D9488" />
          <stop offset="1" stopColor="#115E59" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function BrandLogo({
  size = "md",
  showWordmark = true,
  showTagline = false,
  className,
  wordmarkClassName,
}: BrandLogoProps) {
  const s = SIZE[size];

  return (
    <div className={cn("inline-flex items-center", s.gap, className)}>
      <BrandMark className={s.mark} />
      {showWordmark && (
        <div className="min-w-0 leading-tight">
          <span
            className={cn(
              "font-extrabold tracking-tight text-foreground block",
              s.text,
              wordmarkClassName
            )}
          >
            Role<span className="text-teal-700 dark:text-teal-400">Ready</span>
          </span>
          {showTagline && (
            <span className={cn("text-muted-foreground font-medium block mt-0.5", s.tagline)}>
              {BRAND.tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
