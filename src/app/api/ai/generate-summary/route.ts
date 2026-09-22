import { checkRateLimit } from "@/lib/ai/rate-limiter";
import { SYSTEM_PROMPTS } from "@/lib/ai/prompts";
import { consumeAiAccess } from "@/lib/ai/access";
import { streamModelOrMock } from "@/lib/ai/stream-response";

export const runtime = "nodejs";

function normalizeKeywords(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((k): k is string => typeof k === "string")
    .map((k) => k.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function buildFallbackSummary(title: string, keywords: string[]): string {
  const focus = keywords
    .filter((k) => /focused|AI|ML|DevOps|Full-stack|Leadership|Product|cloud|fintech/i.test(k))
    .slice(0, 2);
  const focusClause =
    focus.length > 0
      ? ` with emphasis on ${focus.join(" and ").replace(/ focused/gi, "")}`
      : "";

  const concise = keywords.some((k) => /concise/i.test(k));
  const detail = keywords.some((k) => /detail/i.test(k));

  if (concise) {
    return `Results-driven ${title}${focusClause}. Delivers scalable products, strong engineering craft, and measurable business impact.`;
  }

  if (detail) {
    return `Results-oriented ${title}${focusClause} with a proven track record of designing, building, and scaling resilient digital solutions end-to-end. Expert at bridging complex product requirements with high-performance architectures, mentoring teams, accelerating delivery velocity, and shipping features that create measurable revenue and reliability outcomes across enterprise and growth environments.`;
  }

  return `Results-oriented ${title}${focusClause} with a proven track record of designing, building, and scaling resilient digital solutions. Expert at bridging complex product requirements with high-performance architectures, accelerating team velocity, and delivering measurable business impact across enterprise and growth environments.`;
}

export async function POST(req: Request) {
  try {
    const access = await consumeAiAccess("summary");
    if (!access.ok) return access.response;

    const ip = req.headers.get("x-forwarded-for") || "local-client";
    const { allowed } = checkRateLimit(ip, { maxRequests: 30, windowMs: 60000 });

    if (!allowed) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment." }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { jobTitle, experiences, skills, keywords: rawKeywords } = await req.json();
    const title = jobTitle || "Software Engineer";
    const keywords = normalizeKeywords(rawKeywords);

    const steerBlock =
      keywords.length > 0
        ? `\nSteer instructions (apply all that apply):\n${keywords.map((k) => `- ${k}`).join("\n")}\n`
        : "";

    const prompt = `Target Job Title: ${jobTitle || "Professional"}
Skills: ${Array.isArray(skills) ? skills.join(", ") : "Various professional skills"}
Experience Overview:
${Array.isArray(experiences) ? experiences.map((e: any) => `- ${e.jobTitle} at ${e.company}: ${e.bullets?.join("; ") || ""}`).join("\n") : "Experienced professional background"}
${steerBlock}
Generate a high-impact, professional executive summary${keywords.length ? " that follows the steer instructions above" : ""}.`;

    return streamModelOrMock({
      system: SYSTEM_PROMPTS.summaryGenerator,
      prompt,
      fallbackText: buildFallbackSummary(title, keywords),
    });
  } catch (error) {
    console.error("Summary Generator Error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate summary" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
