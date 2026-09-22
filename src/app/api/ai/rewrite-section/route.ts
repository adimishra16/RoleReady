import { checkRateLimit } from "@/lib/ai/rate-limiter";
import { SYSTEM_PROMPTS } from "@/lib/ai/prompts";
import { consumeAiAccess } from "@/lib/ai/access";
import { streamModelOrMock } from "@/lib/ai/stream-response";

export const runtime = "nodejs";

const SECTION_LABELS: Record<string, string> = {
  job_title: "Target job title",
  summary: "Professional summary",
  project: "Project description",
  education: "Education entry (degree / field / highlights)",
  skills: "Skills list (comma-separated)",
  certification: "Certification name",
  language: "Language proficiency line",
  custom: "Custom section description",
  experience_bullet: "Work experience bullet",
};

export async function POST(req: Request) {
  try {
    const access = await consumeAiAccess("rewrite");
    if (!access.ok) return access.response;

    const ip = req.headers.get("x-forwarded-for") || "local-client";
    const { allowed, resetTime } = checkRateLimit(ip, { maxRequests: 30, windowMs: 60000 });

    if (!allowed) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded. Please wait a moment before trying again.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(resetTime),
          },
        }
      );
    }

    const body = await req.json();
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const sectionType =
      typeof body.sectionType === "string" ? body.sectionType : "custom";
    const context =
      typeof body.context === "string" ? body.context.trim().slice(0, 20) : "";
    const meta =
      typeof body.meta === "string" ? body.meta.trim().slice(0, 120) : "";

    if (!text) {
      return new Response(JSON.stringify({ error: "Text is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const sectionLabel = SECTION_LABELS[sectionType] || "Resume text";

    const prompt = `Section: ${sectionLabel}
${meta ? `Context: ${meta}\n` : ""}Original text: "${text}"
Steer hint: ${context || "N/A"}

Rewrite into 3 improved variations for this resume section.`;

    const hint = context ? ` (${context})` : "";
    const fallback = [
      `1. High-Impact & Quantified: ${text}${hint} — framed with clear outcomes and measurable impact.`,
      `\n\n2. Concise & Direct: ${text.split(/\s+/).slice(0, 18).join(" ")}${text.split(/\s+/).length > 18 ? "…" : ""}`,
      `\n\n3. Leadership & Ownership: Led and delivered on: ${text}${hint}.`,
    ].join("");

    return streamModelOrMock({
      system: SYSTEM_PROMPTS.sectionRewriter,
      prompt,
      fallbackText: fallback,
    });
  } catch (error) {
    console.error("AI Section Rewriter Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to rewrite. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
