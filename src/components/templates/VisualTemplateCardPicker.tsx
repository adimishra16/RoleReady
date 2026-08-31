"use client";

import React, { useState } from "react";
import { TemplateId, ResumeData } from "@/lib/types/resume";
import { TemplateRenderer } from "./TemplateRenderer";
import { TEMPLATE_OPTIONS } from "./TemplateGalleryModal";
import { Check, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  selectedTemplate: TemplateId;
  onSelectTemplate: (templateId: TemplateId) => void;
  accentColor?: string;
  className?: string;
  showFilters?: boolean;
}

// 100% Fully Populated Sample Resume filling the ENTIRE A4 Page
export const PICKER_SAMPLE_RESUME: ResumeData = {
  id: "picker-sample-100-full",
  userId: "demo",
  title: "Alex Morgan Resume",
  templateId: "modern",
  themeColor: "#0d9488",
  fontFamily: "Inter, sans-serif",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  personalInfo: {
    fullName: "Alex Morgan",
    jobTitle: "Senior Full Stack & AI Architect",
    email: "alex.morgan@example.com",
    phone: "+1 (555) 234-5678",
    location: "San Francisco, CA",
    website: "https://alexmorgan.dev",
    linkedin: "https://linkedin.com/in/alexmorgan",
  },
  summary:
    "Results-driven Senior Engineer with 8+ years of experience building scalable cloud platforms, distributed systems, and real-time AI capabilities. Proven track record growing applications to 500k+ monthly active users.",
  workExperience: [
    {
      id: "exp_1",
      jobTitle: "Lead Full Stack & AI Architect",
      company: "Nexus AI Technologies",
      location: "San Francisco, CA",
      startDate: "2022-03",
      endDate: "",
      current: true,
      bullets: [
        "Architected enterprise AI workflow engine serving 350k+ active users with 99.99% operational uptime.",
        "Reduced streaming LLM response latency by 45% using Server-Sent Events and Redis edge caching.",
        "Mentored team of 8 engineers and established automated CI/CD pipelines with Playwright testing.",
      ],
    },
    {
      id: "exp_2",
      jobTitle: "Senior Software Engineer",
      company: "Stripe Payment Infrastructure",
      location: "San Francisco, CA",
      startDate: "2019-06",
      endDate: "2022-02",
      current: false,
      bullets: [
        "Engineered global checkout UI components processing $40M+ in daily transaction volume.",
        "Optimized client bundle size by 32%, cutting initial load time by 400ms across all mobile web clients.",
      ],
    },
    {
      id: "exp_3",
      jobTitle: "Frontend Engineer",
      company: "Airbnb",
      location: "San Francisco, CA",
      startDate: "2017-07",
      endDate: "2019-05",
      current: false,
      bullets: [
        "Built reusable React component library adopted across 15+ product engineering groups.",
      ],
    },
  ],
  education: [
    {
      id: "edu_1",
      institution: "University of California, Berkeley",
      degree: "B.S. Computer Science & Engineering",
      fieldOfStudy: "CS",
      location: "Berkeley, CA",
      startDate: "2013-08",
      endDate: "2017-05",
      gpa: "3.92/4.0",
    },
  ],
  skills: [
    {
      id: "cat_1",
      categoryName: "Languages & Frameworks",
      skills: ["TypeScript", "JavaScript", "Python", "Go", "Next.js 15", "React 19", "Node.js", "GraphQL"],
    },
    {
      id: "cat_2",
      categoryName: "Cloud & Infrastructure",
      skills: ["PostgreSQL", "Redis", "Docker", "Kubernetes", "AWS (EC2, S3, Lambda)", "Tailwind CSS"],
    },
  ],
  projects: [
    {
      id: "proj_1",
      title: "RoleReady Resume Engine",
      startDate: "2024",
      endDate: "2024",
      description:
        "Full-Stack SaaS Platform — Real-time interactive resume builder with live AI bullet enhancer, 7 templates, and ATS parser optimization.",
      technologies: ["Next.js", "TypeScript", "Drizzle ORM", "Neon Postgres"],
    },
    {
      id: "proj_2",
      title: "Distributed Microservices Gateway",
      startDate: "2023",
      endDate: "2023",
      description:
        "Open Source Tool — High-throughput API gateway supporting rate limiting, OAuth token validation, and gRPC routing.",
      technologies: ["Go", "gRPC", "Docker"],
    },
  ],
  certifications: [
    {
      id: "cert_1",
      name: "AWS Certified Solutions Architect – Associate",
      issuer: "Amazon Web Services",
      issueDate: "2023",
    },
    {
      id: "cert_2",
      name: "Google Cloud Professional Cloud Architect",
      issuer: "Google Cloud",
      issueDate: "2022",
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

export function VisualTemplateCardPicker({
  selectedTemplate,
  onSelectTemplate,
  accentColor = "#0d9488",
  className = "",
  showFilters = false,
}: Props) {
  const [filterCategory, setFilterCategory] = useState<"all" | "ats" | "creative">("all");

  const filteredOptions = TEMPLATE_OPTIONS.filter((t) => {
    if (filterCategory === "ats") return t.isAts;
    if (filterCategory === "creative") return !t.isAts || t.id === "creative" || t.id === "tech_mono";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Category Filter Pills */}
      {showFilters && (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterCategory("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              filterCategory === "all"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            All Designs ({TEMPLATE_OPTIONS.length})
          </button>
          <button
            onClick={() => setFilterCategory("ats")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterCategory === "ats"
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" /> 100% ATS Ready ({TEMPLATE_OPTIONS.filter((t) => t.isAts).length})
          </button>
          <button
            onClick={() => setFilterCategory("creative")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              filterCategory === "creative"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Tech & Creative
          </button>
        </div>
      )}

      {/* Grid of Visual Template Cards (Zero Bottom Clipping) */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {filteredOptions.map((option) => {
          const isSelected = selectedTemplate === option.id;
          const previewResume: ResumeData = {
            ...PICKER_SAMPLE_RESUME,
            templateId: option.id,
            themeColor: accentColor,
          };

          return (
            <div
              key={option.id}
              onClick={() => onSelectTemplate(option.id)}
              className={`group relative rounded-3xl border-2 cursor-pointer transition-all duration-300 ease-out overflow-hidden bg-card flex flex-col justify-between ${
                isSelected
                  ? "border-primary ring-4 ring-primary/20 shadow-2xl scale-[1.02] bg-primary/5"
                  : "border-border/80 hover:border-primary/50 hover:shadow-xl hover:-translate-y-1"
              }`}
            >
              {/* Separate Header Bar */}
              <div className="px-4 py-3 bg-muted/60 border-b flex items-center justify-between">
                <Badge
                  variant={isSelected ? "default" : "secondary"}
                  className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5"
                >
                  {option.tag}
                </Badge>

                {isSelected ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-primary">
                    <Check className="h-3.5 w-3.5 stroke-[3]" /> Selected
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to Choose
                  </span>
                )}
              </div>

              {/* Document Canvas Preview Box (0.30x Scale — Fits 100% of A4 Page Height with Zero Bottom Clipping) */}
              <div className="relative h-[350px] w-full bg-slate-100 dark:bg-slate-950 overflow-hidden flex justify-center p-3">
                <div className="w-[210mm] min-h-[297mm] scale-[0.30] sm:scale-[0.31] origin-top shadow-xl rounded-sm transition-transform duration-300 group-hover:scale-[0.33] pointer-events-none bg-white border border-slate-300/80">
                  <TemplateRenderer data={previewResume} scale={1} />
                </div>
              </div>

              {/* Bottom Card Title & Summary */}
              <div className="p-4 bg-card border-t space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                    {option.name}
                  </h4>
                  {option.isAts && (
                    <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      100% ATS
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {option.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
