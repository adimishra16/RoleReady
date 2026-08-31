/** Shared industry options for profile + onboarding. "Other" must stay last. */
export const INDUSTRY_OPTIONS = [
  "Tech & Software",
  "Finance & Fintech",
  "Healthcare",
  "Education & Teaching",
  "Media & Entertainment",
  "Marketing & Advertising",
  "HR / Human Resources",
  "Hospitality & Tourism",
  "Sales & Business Development",
  "Real Estate",
  "Food & Beverage",
  "Consulting",
  "Retail & E‑commerce",
  "Manufacturing",
  "Government & Public Sector",
  "Legal",
  "Logistics & Supply Chain",
  "Construction & Engineering",
  "Non-profit & NGO",
  "Other",
] as const;

export type IndustryOption = (typeof INDUSTRY_OPTIONS)[number];

/** Map older saved labels onto the current list when possible. */
const LEGACY_INDUSTRY_MAP: Record<string, IndustryOption> = {
  Education: "Education & Teaching",
  "Marketing & Media": "Marketing & Advertising",
  HR: "HR / Human Resources",
  "Human Resources": "HR / Human Resources",
  Hospitality: "Hospitality & Tourism",
  Tourism: "Hospitality & Tourism",
  Sales: "Sales & Business Development",
  "Business Development": "Sales & Business Development",
  "Food & Bev": "Food & Beverage",
  "Food and Beverage": "Food & Beverage",
};

export function resolveIndustrySelection(saved: string | null | undefined): {
  industry: string;
  customIndustry: string;
} {
  const value = (saved || "").trim();
  if (!value) {
    return { industry: "Tech & Software", customIndustry: "" };
  }

  const mapped = LEGACY_INDUSTRY_MAP[value];
  if (mapped) {
    return { industry: mapped, customIndustry: "" };
  }

  if ((INDUSTRY_OPTIONS as readonly string[]).includes(value)) {
    return { industry: value, customIndustry: "" };
  }

  return { industry: "Other", customIndustry: value };
}

export function industryValueForSave(
  industry: string,
  customIndustry: string
): string {
  if (industry === "Other") {
    return customIndustry.trim() || "Other";
  }
  return industry;
}
