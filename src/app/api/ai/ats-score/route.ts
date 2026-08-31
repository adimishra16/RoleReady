import { generateText } from "ai";
import { checkRateLimit } from "@/lib/ai/rate-limiter";
import { SYSTEM_PROMPTS } from "@/lib/ai/prompts";
import { getAiModel } from "@/lib/ai/provider";
import { consumeAiAccess } from "@/lib/ai/access";
import { scoreResumeAts } from "@/lib/ats/score-resume";
import type { ResumeData } from "@/lib/types/resume";

export const runtime = "nodejs";

export type AiAtsScoreResponse = {
  score: number;
  grade: string;
  strengths: string[];
  improvements: string[];
  summary: string;
  source: "ai" | "heuristic";
};

function clampScore(n: unknown): number {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(100, Math.round(v)));
}

function fromHeuristic(resumeData: ResumeData, targetRole?: string): AiAtsScoreResponse {
  const base = scoreResumeAts(resumeData, { targetRole });
  const failed = base.checks.filter((c) => !c.passed);
  const passed = base.checks.filter((c) => c.passed);

  const strengths =
    base.score < 40
      ? passed.length
        ? [`Only real positives: ${passed.slice(0, 2).map((c) => c.label).join("; ")}`]
        : ["Almost nothing usable yet — this reads like a blank template."]
      : [
          ...base.roleKeywordsMatched.slice(0, 2).map((k) => `Role keyword present: ${k}`),
          ...passed.slice(0, 3).map((c) => c.label),
        ].slice(0, 4);

  const improvements = [
    ...failed.slice(0, 4).map((c) => `Fix now: ${c.tip}`),
    ...base.roleKeywordsMissing
      .slice(0, 3)
      .map((k) => `Missing for this role — ATS will skip you without: ${k}`),
  ].slice(0, 8);

  return {
    score: base.score,
    grade: base.grade,
    strengths,
    improvements:
      improvements.length > 0
        ? improvements
        : ["Tighten bullets with metrics or this stays mid-pack in ATS ranking."],
    summary: base.summary,
    source: "heuristic",
  };
}

export async function POST(req: Request) {
  try {
    const access = await consumeAiAccess("ats_score");
    if (!access.ok) return access.response;

    const ip = req.headers.get("x-forwarded-for") || "local-client";
    const { allowed } = checkRateLimit(ip, { maxRequests: 20, windowMs: 60000 });

    if (!allowed) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { resumeData, targetRole } = await req.json();
    if (!resumeData || typeof resumeData !== "object") {
      return new Response(JSON.stringify({ error: "Resume data is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const role =
      (typeof targetRole === "string" && targetRole.trim()) ||
      resumeData?.personalInfo?.jobTitle ||
      "General professional";

    const prompt = `TARGET ROLE: ${role}

RESUME TO SCORE (ATS readiness + role fit, score out of 100):
Name: ${resumeData?.personalInfo?.fullName || ""}
Title on resume: ${resumeData?.personalInfo?.jobTitle || ""}
Email: ${resumeData?.personalInfo?.email || ""}
Phone: ${resumeData?.personalInfo?.phone || ""}
Location: ${resumeData?.personalInfo?.location || ""}
Template: ${resumeData?.templateId || "unknown"}
Summary: ${resumeData?.summary || ""}
Skills: ${JSON.stringify(resumeData?.skills || [])}
Work Experience: ${JSON.stringify(resumeData?.workExperience || [])}
Education: ${JSON.stringify(resumeData?.education || [])}
Projects: ${JSON.stringify(resumeData?.projects || [])}
Certifications: ${JSON.stringify(resumeData?.certifications || [])}

Score specifically for ATS parseability AND fit to TARGET ROLE.
Be brutal and honest — empty or placeholder resumes must score very low. Return pure JSON only with score 0–100.`;

    const model = getAiModel();
    if (model) {
      const response = await generateText({
        model,
        system: SYSTEM_PROMPTS.atsScorer,
        prompt,
      });
      try {
        const parsed = JSON.parse(
          response.text.replace(/```json/g, "").replace(/```/g, "").trim()
        );
        const score = clampScore(parsed.score);
        const result: AiAtsScoreResponse = {
          score,
          grade:
            typeof parsed.grade === "string"
              ? parsed.grade
              : score >= 85
                ? "Excellent"
                : score >= 70
                  ? "Good"
                  : score >= 50
                    ? "Fair"
                    : "Needs work",
          strengths: Array.isArray(parsed.strengths)
            ? parsed.strengths.map(String).slice(0, 6)
            : [],
          improvements: Array.isArray(parsed.improvements)
            ? parsed.improvements.map(String).slice(0, 8)
            : [],
          summary:
            typeof parsed.summary === "string" && parsed.summary.trim()
              ? parsed.summary
              : `AI ATS score: ${score}/100 for ${role}.`,
          source: "ai",
        };
        return Response.json(result);
      } catch {
        // fall through to heuristic
      }
    }

    return Response.json(fromHeuristic(resumeData as ResumeData, role));
  } catch (error) {
    console.error("ATS Score AI Error:", error);
    return new Response(JSON.stringify({ error: "Failed to score resume with AI" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
