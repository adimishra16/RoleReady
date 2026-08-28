import { generateText } from "ai";
import { checkRateLimit } from "@/lib/ai/rate-limiter";
import { SYSTEM_PROMPTS } from "@/lib/ai/prompts";
import { getAiModel } from "@/lib/ai/provider";
import { consumeAiAccess } from "@/lib/ai/access";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const access = await consumeAiAccess("job_match");
    if (!access.ok) return access.response;

    const ip = req.headers.get("x-forwarded-for") || "local-client";
    const { allowed } = checkRateLimit(ip, { maxRequests: 25, windowMs: 60000 });

    if (!allowed) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { jobDescription, resumeData } = await req.json();

    if (!jobDescription || typeof jobDescription !== "string") {
      return new Response(JSON.stringify({ error: "Job description is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const prompt = `RESUME CONTENT:
Name: ${resumeData?.personalInfo?.fullName || "Candidate"}
Title: ${resumeData?.personalInfo?.jobTitle || ""}
Summary: ${resumeData?.summary || ""}
Skills: ${JSON.stringify(resumeData?.skills || [])}
Work Experience: ${JSON.stringify(resumeData?.workExperience || [])}

TARGET JOB DESCRIPTION:
${jobDescription}

Perform ATS matching and output pure JSON.`;

    const model = getAiModel();
    if (model) {
      const response = await generateText({
        model,
        system: SYSTEM_PROMPTS.jobMatcher,
        prompt,
      });
      try {
        const parsed = JSON.parse(response.text.replace(/```json/g, "").replace(/```/g, "").trim());
        return Response.json(parsed);
      } catch {
        // Fallback parse
      }
    }

    // Intelligent heuristic matcher fallback
    const jdLower = jobDescription.toLowerCase();
    const commonTechSkills = [
      "typescript", "react", "next.js", "node.js", "graphql", "aws", "docker",
      "kubernetes", "python", "postgres", "sql", "tailwind", "ci/cd", "redis",
      "system design", "microservices", "unit testing", "agile", "leadership"
    ];

    const matchingKeywords: string[] = [];
    const missingKeywords: string[] = [];

    const resumeString = JSON.stringify(resumeData || {}).toLowerCase();

    for (const skill of commonTechSkills) {
      if (jdLower.includes(skill)) {
        if (resumeString.includes(skill)) {
          matchingKeywords.push(skill.toUpperCase());
        } else {
          missingKeywords.push(skill.toUpperCase());
        }
      }
    }

    // Ensure we have some items
    if (matchingKeywords.length === 0 && missingKeywords.length === 0) {
      matchingKeywords.push("JAVASCRIPT", "COMMUNICATION", "PROBLEM SOLVING");
      missingKeywords.push("DISTRIBUTED SYSTEMS", "KUBERNETES", "PERFORMANCE OPTIMIZATION");
    }

    const total = matchingKeywords.length + missingKeywords.length;
    const score = total > 0 ? Math.round((matchingKeywords.length / total) * 100) : 75;

    return Response.json({
      matchScore: Math.max(45, Math.min(95, score)),
      matchingKeywords,
      missingKeywords,
      recommendations: [
        `Incorporate "${missingKeywords.slice(0, 2).join('", "')}" in your Skills or Work Experience bullets to pass ATS filters.`,
        "Quantify your top 2 achievements with specific metrics (%, latency, revenue).",
        "Align your job title directly with the target position where applicable.",
      ],
    });
  } catch (error) {
    console.error("Job Matcher Error:", error);
    return new Response(JSON.stringify({ error: "Failed to match job description" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
