"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { ResumeData } from "@/lib/types/resume";
import { TemplateRenderer } from "@/components/templates/TemplateRenderer";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { AuthNavActions, ClerkSignedInGate } from "@/components/brand/AuthNavActions";
import { Download, Share2, Check, Lock } from "lucide-react";
import { sanitizeResumeData } from "@/lib/ai/parse-bullet-variations";

// Default template resume for public preview
const DEMO_PUBLIC_RESUME: ResumeData = {
  id: "demo-resume-1",
  userId: "user_demo",
  title: "Alex Morgan — Senior Full Stack Engineer",
  templateId: "modern",
  themeColor: "#0d9488",
  fontFamily: "Inter, sans-serif",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  personalInfo: {
    fullName: "Alex Morgan",
    jobTitle: "Senior Full Stack Engineer",
    email: "alex.morgan@example.com",
    phone: "+1 (555) 234-5678",
    location: "San Francisco, CA",
    website: "https://alexmorgan.dev",
    linkedin: "https://linkedin.com/in/alexmorgan",
    github: "https://github.com/alexmorgan",
  },
  summary:
    "High-impact Senior Full Stack Engineer with 6+ years of experience architecting distributed cloud applications and AI-driven platforms. Proven track record reducing system latency by 45% and leading cross-functional teams to deliver enterprise-grade SaaS products.",
  workExperience: [
    {
      id: "exp_1",
      jobTitle: "Lead Full Stack Engineer",
      company: "Nexus AI Technologies",
      location: "San Francisco, CA",
      startDate: "2022-03",
      endDate: "",
      current: true,
      bullets: [
        "Spearheaded the architecture of an AI-driven workflow engine using Next.js, Node.js, and PostgreSQL, scaling to 250,000+ daily active users.",
        "Implemented token streaming and optimistic UI patterns, cutting user perceived response latency by 62%.",
        "Mentored 7 junior and mid-level engineers, establishing CI/CD automation and code review standards that reduced production incidents by 35%.",
      ],
    },
    {
      id: "exp_2",
      jobTitle: "Senior Software Engineer",
      company: "CloudScale Systems",
      location: "Austin, TX",
      startDate: "2019-06",
      endDate: "2022-02",
      current: false,
      bullets: [
        "Designed microservices in Go and TypeScript handling 10M+ events/day with 99.99% uptime SLA.",
        "Migrated monolithic frontend to Next.js App Router, boosting Lighthouse performance score from 54 to 98.",
        "Collaborated with product designers to build a scalable design system adopted across 8 distinct internal products.",
      ],
    },
  ],
  education: [
    {
      id: "edu_1",
      institution: "University of California, Berkeley",
      degree: "Bachelor of Science",
      fieldOfStudy: "Computer Science",
      location: "Berkeley, CA",
      startDate: "2015-08",
      endDate: "2019-05",
      gpa: "3.85 / 4.0",
    },
  ],
  skills: [
    {
      id: "cat_1",
      categoryName: "Languages & Frameworks",
      skills: ["TypeScript", "JavaScript", "React", "Next.js", "Node.js", "Python", "Go", "Tailwind CSS"],
    },
    {
      id: "cat_2",
      categoryName: "Backend & Databases",
      skills: ["PostgreSQL", "Neon", "Drizzle ORM", "Redis", "GraphQL", "REST APIs"],
    },
    {
      id: "cat_3",
      categoryName: "AI & Cloud Tools",
      skills: ["Vercel AI SDK", "OpenAI API", "AWS", "Docker", "Git", "CI/CD"],
    },
  ],
  projects: [
    {
      id: "proj_1",
      title: "PulseFlow AI Copilot",
      description:
        "Open-source developer assistant that automates code review summaries and pull request insights using local and cloud LLMs.",
      technologies: ["Next.js 15", "TypeScript", "Vercel AI SDK", "Tailwind CSS"],
      link: "https://pulseflow.dev",
    },
  ],
  certifications: [
    {
      id: "cert_1",
      name: "AWS Certified Solutions Architect – Associate",
      issuer: "Amazon Web Services",
      issueDate: "2023-04",
    },
  ],
  languages: [
    { id: "lang_1", language: "English", proficiency: "Native" },
    { id: "lang_2", language: "Spanish", proficiency: "Proficient" },
  ],
  sectionOrder: [
    "personal_info",
    "summary",
    "work_experience",
    "skills",
    "education",
    "projects",
    "certifications",
    "languages",
  ],
};

export default function PublicSharedResumePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const [copied, setCopied] = useState(false);
  const [resume, setResume] = useState<ResumeData>(DEMO_PUBLIC_RESUME);

  useEffect(() => {
    try {
      const cached = localStorage.getItem("cv_builder_resume_" + slug);
      if (cached) {
        const parsed = JSON.parse(cached) as ResumeData;
        setResume(sanitizeResumeData({ ...DEMO_PUBLIC_RESUME, ...parsed }));
      }
    } catch {}
  }, [slug]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-muted/30 text-foreground flex flex-col items-center py-6 px-4">
      {/* Top Banner */}
      <header className="w-full max-w-4xl flex items-center justify-between p-4 bg-card/80 backdrop-blur-md rounded-2xl border shadow-sm mb-6 no-print">
        <div className="flex items-center gap-3">
          <Link href="/">
            <BrandLogo size="sm" />
          </Link>
          <span className="text-xs text-muted-foreground hidden sm:inline">•</span>
          <span className="text-xs text-muted-foreground hidden sm:inline truncate max-w-xs">
            Public Resume: {resume.personalInfo.fullName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <AuthNavActions compact showDashboardLink primaryHref="/sign-up" primaryLabel="Get Started" />
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="text-xs gap-1.5"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <ClerkSignedInGate>
            {({ isSignedIn }) =>
              isSignedIn ? (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handlePrint}
                  className="text-xs gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  Print / Save PDF
                </Button>
              ) : (
                <Link href="/sign-in">
                  <Button size="sm" className="text-xs gap-1.5 bg-teal-700 hover:bg-teal-800 text-white">
                    <Lock className="h-3.5 w-3.5" />
                    Sign in to download
                  </Button>
                </Link>
              )
            }
          </ClerkSignedInGate>
        </div>
      </header>

      {/* Rendered Resume Document */}
      <main className="w-full flex justify-center pb-12 overflow-auto">
        <div className="shadow-2xl rounded-sm">
          <TemplateRenderer data={resume} scale={1} />
        </div>
      </main>
    </div>
  );
}
