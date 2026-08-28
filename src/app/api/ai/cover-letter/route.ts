import { streamText } from "ai";
import { checkRateLimit } from "@/lib/ai/rate-limiter";
import { SYSTEM_PROMPTS } from "@/lib/ai/prompts";
import { getAiModel } from "@/lib/ai/provider";
import { consumeAiAccess } from "@/lib/ai/access";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const access = await consumeAiAccess("cover_letter");
    if (!access.ok) return access.response;

    const ip = req.headers.get("x-forwarded-for") || "local-client";
    const { allowed } = checkRateLimit(ip, { maxRequests: 25, windowMs: 60000 });

    if (!allowed) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { jobDescription, companyName, roleTitle, resumeData } = await req.json();

    const prompt = `CANDIDATE PROFILE:
Name: ${resumeData?.personalInfo?.fullName || "Candidate"}
Email: ${resumeData?.personalInfo?.email || ""}
Phone: ${resumeData?.personalInfo?.phone || ""}
Experience highlights: ${JSON.stringify(resumeData?.workExperience?.slice(0, 2) || [])}
Top Skills: ${JSON.stringify(resumeData?.skills || [])}

TARGET POSITION:
Company: ${companyName || "the Company"}
Role: ${roleTitle || "Target Role"}
Job Description:
${jobDescription || "Standard senior software engineering role requiring high ownership, technical expertise, and collaborative problem solving."}

Generate a tailored cover letter.`;

    const model = getAiModel();
    if (model) {
      const result = streamText({
        model,
        system: SYSTEM_PROMPTS.coverLetter,
        prompt,
      });
      return result.toDataStreamResponse();
    }

    // High quality mock stream fallback
    const candidateName = resumeData?.personalInfo?.fullName || "Alex Morgan";
    const targetComp = companyName || "the Hiring Team";
    const targetRole = roleTitle || "Software Engineer";

    const fallbackCoverLetter = `Dear Hiring Team at ${targetComp},

I am writing to express my strong enthusiasm for the ${targetRole} position. With my background in engineering resilient, high-performance web systems and leveraging modern AI workflows, I am eager to contribute immediately to your team's ambitious product goals.

In my recent experience, I architected distributed web applications serving hundreds of thousands of active users, reduced system latency by over 45%, and spearheaded key engineering initiatives that streamlined release cycles. I thrive in collaborative environments where technical excellence and rapid execution intersect, and I am particularly drawn to your mission and engineering culture.

I welcome the opportunity to discuss how my skill set and problem-solving mindset align with your strategic needs. Thank you for your time and consideration.

Sincerely,
${candidateName}`;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const words = fallbackCoverLetter.split(" ");
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
    console.error("Cover Letter Generator Error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate cover letter" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
