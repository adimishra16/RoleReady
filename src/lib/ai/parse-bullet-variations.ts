import type { ResumeData } from "@/lib/types/resume";

const VARIATION_LABELS = [
  "High-Impact & Quantified",
  "Concise & Direct",
  "Leadership & Ownership",
] as const;

export interface ParsedBulletVariation {
  tag: string;
  content: string;
}

/** Remove label prefix and markdown formatting from a single variation chunk. */
export function stripBulletVariationLabel(text: string): ParsedBulletVariation {
  let remaining = text.trim();
  let tag = "Variation";

  remaining = remaining.replace(/^\d+\.\s*/, "");

  const boldHeader = remaining.match(/^\*\*([^*]+)\*\*\s*:?\s*/);
  if (boldHeader) {
    tag = boldHeader[1].trim();
    remaining = remaining.slice(boldHeader[0].length).trim();
  } else {
    for (const label of VARIATION_LABELS) {
      const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const labelPrefix = new RegExp(`^${escaped}\\s*:?\\s*`, "i");
      if (labelPrefix.test(remaining)) {
        tag = label;
        remaining = remaining.replace(labelPrefix, "").trim();
        break;
      }
    }
  }

  remaining = remaining.replace(/\*\*/g, "").trim();

  return { tag, content: remaining };
}

/** Strip AI variation labels accidentally saved into resume bullets. */
export function sanitizeResumeBulletText(bullet: string): string {
  const cleaned = stripBulletVariationLabel(bullet);
  if (cleaned.content.length > 0 && cleaned.tag !== "Variation") {
    return cleaned.content;
  }
  return bullet.replace(/\*\*/g, "").trim();
}

export function sanitizeResumeData(data: ResumeData): ResumeData {
  return {
    ...data,
    workExperience: data.workExperience.map((exp) => ({
      ...exp,
      bullets: exp.bullets.map(sanitizeResumeBulletText),
    })),
  };
}

/** Split streamed AI bullet output into labeled variations (content only, no headers). */
export function parseBulletVariations(streamedText: string): ParsedBulletVariation[] {
  const text = streamedText.trim();
  if (!text) return [];

  let chunks: string[] = [];

  const numbered = text.split(/\n\s*(?=\d+\.\s)/).map((s) => s.trim()).filter((s) => s.length > 5);
  if (numbered.length > 1) {
    chunks = numbered;
  }

  if (chunks.length <= 1) {
    const markdownHeaders = text.split(/\n\s*(?=\*\*[^*]+\*\*)/).map((s) => s.trim()).filter((s) => s.length > 5);
    if (markdownHeaders.length > 1) {
      chunks = markdownHeaders;
    }
  }

  if (chunks.length <= 1) {
    const labelPattern = VARIATION_LABELS.map((l) => l.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
    const byLabel = text.split(new RegExp(`\\n\\s*(?=(?:\\*\\*)?(?:${labelPattern}))`, "i"))
      .map((s) => s.trim())
      .filter((s) => s.length > 5);
    if (byLabel.length > 1) {
      chunks = byLabel;
    }
  }

  if (chunks.length <= 1) {
    chunks = [text];
  }

  return chunks
    .map((chunk, idx) => {
      const parsed = stripBulletVariationLabel(chunk);
      if (parsed.tag === "Variation") {
        parsed.tag = `Variation ${idx + 1}`;
      }
      return parsed;
    })
    .filter((v) => v.content.length > 5);
}
