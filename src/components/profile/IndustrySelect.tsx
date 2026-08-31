"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { INDUSTRY_OPTIONS } from "@/lib/profile/industries";

interface Props {
  industry: string;
  customIndustry: string;
  onIndustryChange: (value: string) => void;
  onCustomIndustryChange: (value: string) => void;
  className?: string;
}

export function IndustrySelect({
  industry,
  customIndustry,
  onIndustryChange,
  onCustomIndustryChange,
  className,
}: Props) {
  return (
    <div className={className}>
      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
        Industry
      </label>
      <select
        value={industry}
        onChange={(e) => onIndustryChange(e.target.value)}
        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {INDUSTRY_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {industry === "Other" && (
        <Input
          className="mt-2"
          value={customIndustry}
          onChange={(e) => onCustomIndustryChange(e.target.value)}
          placeholder="Describe your industry"
          maxLength={255}
        />
      )}
    </div>
  );
}
