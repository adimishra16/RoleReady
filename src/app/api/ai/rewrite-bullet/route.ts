import { checkRateLimit } from "@/lib/ai/rate-limiter";
import { SYSTEM_PROMPTS } from "@/lib/ai/prompts";
import { consumeAiAccess } from "@/lib/ai/access";
import { streamModelOrMock } from "@/lib/ai/stream-response";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const access = await consumeAiAccess("rewrite");
    if (!access.ok) return access.response;

    const ip = req.headers.get("x-forwarded-for") || "local-client";
    const { allowed, resetTime } = checkRateLimit(ip, { maxRequests: 30, windowMs: 60000 });

    if (!allowed) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please wait a moment before trying again." }),
        { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(resetTime) } }
      );
    }

    const { bullet, jobTitle, company, context } = await req.json();

    const userHint =
      typeof context === "string" ? context.trim().slice(0, 20) : "";

    if (!bullet || typeof bullet !== "string") {
      return new Response(JSON.stringify({ error: "Bullet point text is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const prompt = `Original bullet point: "${bullet}"
Role: ${jobTitle || "Professional"}
Company: ${company || "Company"}
Additional Context: ${userHint || "N/A"}

Transform this into 3 improved, achievement-focused variations adhering to the instructions.`;

    const hintSuffix = userHint ? ` with emphasis on ${userHint}` : "";
    const fallbackVariations = [
      `1. High-Impact & Quantified: Spearheaded ${bullet.replace(/^[a-z]/, (c: string) => c.toLowerCase())}${hintSuffix}, achieving a 38% increase in system efficiency and reducing delivery turnaround time by 3 weeks across cross-functional teams.`,
      `\n\n2. Concise & Direct: Architected and executed key initiatives for ${jobTitle || "the team"}, streamlining workflows and eliminating operational bottlenecks.`,
      `\n\n3. Leadership & Ownership: Led end-to-end technical execution of core project milestones, mentoring 4 team members and ensuring 99.9% reliability for mission-critical deliverables.`,
    ].join("");

    return streamModelOrMock({
      system: SYSTEM_PROMPTS.bulletRewriter,
      prompt,
      fallbackText: fallbackVariations,
    });
  } catch (error) {
    console.error("AI Bullet Rewriter Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to rewrite bullet point. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
