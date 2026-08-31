import type { ResumeData, TemplateId } from "@/lib/types/resume";

export type AtsCheck = {
  id: string;
  label: string;
  passed: boolean;
  points: number;
  tip: string;
};

export type AtsScoreResult = {
  score: number;
  maxScore: 100;
  grade: "Excellent" | "Good" | "Fair" | "Needs work";
  checks: AtsCheck[];
  summary: string;
  targetRole: string;
  roleKeywordsMatched: string[];
  roleKeywordsMissing: string[];
};

const ACTION_VERBS =
  /\b(led|built|designed|developed|created|implemented|improved|increased|reduced|optimized|managed|launched|architected|engineered|delivered|achieved|spearheaded|owned|drove|scaled|automated|migrated|collaborated)\b/i;
const METRIC = /\d+(\.\d+)?%?|\$\d|million|thousand|\d+\+/i;

const ATS_FRIENDLY: TemplateId[] = [
  "minimal",
  "modern",
  "professional",
  "tech_mono",
  "elegant_serif",
];

/** Role-family keyword banks for target-role ATS alignment */
const ROLE_KEYWORD_BANKS: { match: RegExp; keywords: string[] }[] = [
  {
    match: /engineer|developer|sde|software|full.?stack|frontend|backend|devops|sre/i,
    keywords: [
      "typescript",
      "javascript",
      "react",
      "next.js",
      "node",
      "api",
      "sql",
      "postgres",
      "aws",
      "docker",
      "ci/cd",
      "system design",
      "microservices",
      "testing",
      "git",
    ],
  },
  {
    match: /data|analyst|scientist|ml|machine learning|ai engineer/i,
    keywords: [
      "python",
      "sql",
      "pandas",
      "machine learning",
      "statistics",
      "tableau",
      "power bi",
      "etl",
      "spark",
      "modeling",
      "visualization",
      "a/b testing",
    ],
  },
  {
    match: /product\s*manager|pm\b|product owner/i,
    keywords: [
      "roadmap",
      "stakeholders",
      "user research",
      "metrics",
      "agile",
      "prioritization",
      "okrs",
      "go-to-market",
      "wireframes",
      "experimentation",
      "retention",
    ],
  },
  {
    match: /design|ui|ux|product designer/i,
    keywords: [
      "figma",
      "user research",
      "prototyping",
      "design system",
      "wireframes",
      "usability",
      "accessibility",
      "typography",
      "interaction design",
    ],
  },
  {
    match: /market|growth|seo|content|brand/i,
    keywords: [
      "seo",
      "campaigns",
      "analytics",
      "google ads",
      "content",
      "funnel",
      "crm",
      "conversion",
      "social media",
      "branding",
      "copywriting",
    ],
  },
  {
    match: /sales|account executive|bdr|sdr|business development/i,
    keywords: [
      "pipeline",
      "crm",
      "quota",
      "negotiation",
      "prospecting",
      "closing",
      "saas",
      "revenue",
      "outbound",
      "demo",
    ],
  },
  {
    match: /hr|human resources|recruiter|talent/i,
    keywords: [
      "recruiting",
      "onboarding",
      "employee engagement",
      "ats",
      "interviewing",
      "payroll",
      "compliance",
      "workforce",
    ],
  },
  {
    match: /finance|accountant|ca\b|analyst.*finance|fp&a/i,
    keywords: [
      "excel",
      "financial modeling",
      "forecasting",
      "budgeting",
      "gaap",
      "reconciliation",
      "erp",
      "variance analysis",
      "audit",
    ],
  },
];

const GENERIC_ROLE_KEYWORDS = [
  "leadership",
  "communication",
  "collaboration",
  "problem solving",
  "project management",
  "stakeholder",
  "results",
];

function gradeFromScore(score: number): AtsScoreResult["grade"] {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  return "Needs work";
}

function resolveRoleKeywords(targetRole: string): string[] {
  const bank = ROLE_KEYWORD_BANKS.find((b) => b.match.test(targetRole));
  if (bank) return bank.keywords;
  // Extract meaningful tokens from the role title itself
  const tokens = targetRole
    .toLowerCase()
    .split(/[^a-z0-9+#.]/i)
    .map((t) => t.trim())
    .filter((t) => t.length > 2 && !["the", "and", "for", "with", "senior", "junior"].includes(t));
  return [...new Set([...tokens, ...GENERIC_ROLE_KEYWORDS])].slice(0, 14);
}

export type ScoreAtsOptions = {
  /** Target job role for role-based keyword scoring */
  targetRole?: string;
};

/**
 * ATS score out of 100 — structure + alignment to target role.
 */
export function scoreResumeAts(
  data: ResumeData,
  options: ScoreAtsOptions = {}
): AtsScoreResult {
  const pi = data.personalInfo || ({} as ResumeData["personalInfo"]);
  const targetRole = (options.targetRole || pi.jobTitle || "").trim();
  const bullets = (data.workExperience || []).flatMap((e) => e.bullets || []);
  const skillCount = (data.skills || []).reduce((n, c) => n + (c.skills?.length || 0), 0);
  const quantified = bullets.filter((b) => METRIC.test(b)).length;
  const actionHeavy = bullets.filter((b) => ACTION_VERBS.test(b)).length;
  const haystack = JSON.stringify(data).toLowerCase();

  const roleKeywords = targetRole ? resolveRoleKeywords(targetRole) : [];
  const roleKeywordsMatched = roleKeywords.filter((k) => haystack.includes(k.toLowerCase()));
  const roleKeywordsMissing = roleKeywords.filter((k) => !haystack.includes(k.toLowerCase()));
  const roleHitRate =
    roleKeywords.length === 0 ? 0 : roleKeywordsMatched.length / roleKeywords.length;
  // Up to 18 pts for role keyword coverage
  const rolePointsEarned =
    !targetRole
      ? 0
      : roleHitRate >= 0.45
        ? 18
        : roleHitRate >= 0.25
          ? 12
          : roleHitRate > 0
            ? 6
            : 0;

  const checks: AtsCheck[] = [
    {
      id: "name",
      label: "Full name present",
      passed: Boolean(pi.fullName?.trim()),
      points: 6,
      tip: "Add your full name in Personal Info.",
    },
    {
      id: "email",
      label: "Email address",
      passed: Boolean(pi.email?.trim() && pi.email.includes("@")),
      points: 6,
      tip: "ATS parsers need a clear email.",
    },
    {
      id: "phone",
      label: "Phone number",
      passed: Boolean(pi.phone?.trim() && pi.phone.replace(/\D/g, "").length >= 7),
      points: 4,
      tip: "Include a reachable phone number.",
    },
    {
      id: "title",
      label: "Target job title / role set",
      passed: Boolean(targetRole),
      points: 8,
      tip: "Set your target role (e.g. Full Stack Engineer) for role-based ATS scoring.",
    },
    {
      id: "role_align",
      label: targetRole
        ? `Role keywords for “${targetRole}”`
        : "Role keyword alignment",
      passed: rolePointsEarned >= 12,
      points: 18,
      tip: targetRole
        ? `Add missing role keywords: ${roleKeywordsMissing.slice(0, 5).join(", ") || "strengthen skills & bullets"}.`
        : "Set a target role first so we can score keyword fit.",
    },
    {
      id: "summary",
      label: "Professional summary (40+ chars)",
      passed: (data.summary || "").trim().length >= 40,
      points: 8,
      tip: "Write a summary that mentions your target role and top skills.",
    },
    {
      id: "experience",
      label: "At least one work experience",
      passed: (data.workExperience || []).length > 0,
      points: 10,
      tip: "Add work experience with company, role, and dates.",
    },
    {
      id: "bullets",
      label: "Experience has bullet points",
      passed: bullets.length >= 2,
      points: 8,
      tip: "Add 2–5 achievement bullets per role.",
    },
    {
      id: "metrics",
      label: "Quantified achievements",
      passed: quantified >= 1,
      points: 8,
      tip: "Include numbers (%, $, scale) in bullets.",
    },
    {
      id: "verbs",
      label: "Strong action verbs",
      passed: actionHeavy >= 1,
      points: 5,
      tip: "Start bullets with verbs like Built, Led, Optimized.",
    },
    {
      id: "skills",
      label: "Skills listed (3+)",
      passed: skillCount >= 3,
      points: 8,
      tip: "List keywords recruiters and ATS scan for your role.",
    },
    {
      id: "education",
      label: "Education section filled",
      passed: (data.education || []).some((e) => e.institution?.trim() || e.degree?.trim()),
      points: 5,
      tip: "Add school, degree, and field of study.",
    },
    {
      id: "template",
      label: "ATS-friendly template",
      passed: ATS_FRIENDLY.includes(data.templateId),
      points: 6,
      tip: "Prefer Minimal ATS, Modern, or Professional layouts.",
    },
  ];

  // role_align uses partial credit via rolePointsEarned instead of binary pass points
  const earnedBase = checks
    .filter((c) => c.id !== "role_align")
    .reduce((s, c) => s + (c.passed ? c.points : 0), 0);
  const score = Math.max(0, Math.min(100, earnedBase + rolePointsEarned));
  const grade = gradeFromScore(score);
  const failed = checks.filter((c) => !c.passed);

  // Reflect partial role points on the check display
  const checksWithRole = checks.map((c) =>
    c.id === "role_align"
      ? {
          ...c,
          passed: rolePointsEarned >= 12,
          tip:
            rolePointsEarned > 0 && rolePointsEarned < 12
              ? `Partial fit (+${rolePointsEarned}/18). Add: ${roleKeywordsMissing.slice(0, 5).join(", ")}.`
              : c.tip,
        }
      : c
  );

  let summary = `You scored ${score}/100 for${targetRole ? ` “${targetRole}”` : " ATS readiness"}.`;
  if (grade === "Needs work") {
    summary = `You scored ${score}/100. Fix ${failed.length} gaps${targetRole ? ` for ${targetRole}` : ""}.`;
  } else if (grade === "Fair") {
    summary = `You scored ${score}/100. Strengthen role keywords and quantified bullets.`;
  } else if (grade === "Good") {
    summary = `You scored ${score}/100 — strong base for${targetRole ? ` ${targetRole}` : " ATS"}. Polish missing keywords.`;
  } else {
    summary = `You scored ${score}/100 — excellent role-ready ATS profile${targetRole ? ` for ${targetRole}` : ""}.`;
  }

  return {
    score,
    maxScore: 100,
    grade,
    checks: checksWithRole,
    summary,
    targetRole,
    roleKeywordsMatched,
    roleKeywordsMissing,
  };
}
