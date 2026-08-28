import { streamText } from "ai";
import { checkRateLimit } from "@/lib/ai/rate-limiter";
import { SYSTEM_PROMPTS } from "@/lib/ai/prompts";
import { getAiModel } from "@/lib/ai/provider";
import { consumeAiAccess } from "@/lib/ai/access";

export const runtime = "nodejs";

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

    const { jobTitle, experiences, skills } = await req.json();

    const prompt = `Target Job Title: ${jobTitle || "Professional"}
Skills: ${Array.isArray(skills) ? skills.join(", ") : "Various professional skills"}
Experience Overview:
${Array.isArray(experiences) ? experiences.map((e: any) => `- ${e.jobTitle} at ${e.company}: ${e.bullets?.join("; ") || ""}`).join("\n") : "Experienced professional background"}

Generate a high-impact, professional executive summary.`;

    const model = getAiModel();
    if (model) {
      const result = streamText({
        model,
        system: SYSTEM_PROMPTS.summaryGenerator,
        prompt,
      });
      return result.toDataStreamResponse();
    }

    // High quality mock stream fallback
    const title = jobTitle || "Software Engineer";
    const fallbackSummary = `Results-oriented ${title} with a proven track record of designing, building, and scaling resilient digital solutions. Expert at bridging complex product requirements with high-performance architectures, accelerating team velocity, and delivering measurable business impact across enterprise and growth environments.`;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const words = fallbackSummary.split(" ");
        for (let i = 0; i < words.length; i++) {
          const word = words[i] + (i < words.length - 1 ? " " : "");
          controller.enqueue(encoder.encode(`0:${JSON.stringify(word)}\n`));
          await new Promise((resolve) => setTimeout(resolve, 30));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Vercel-AI-Data-Stream": "v1",
      },
    });
  } catch (error) {
    console.error("Summary Generator Error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate summary" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
