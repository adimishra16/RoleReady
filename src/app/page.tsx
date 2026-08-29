"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wand2,
  Target,
  FileText,
  Share2,
  CheckCircle2,
  ArrowRight,
  Lock,
  Sparkles,
} from "lucide-react";
import { TemplateRenderer } from "@/components/templates/TemplateRenderer";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { AuthNavActions, ClerkSignedInGate } from "@/components/brand/AuthNavActions";
import { BRAND } from "@/lib/brand";
import { ResumeData, TemplateId } from "@/lib/types/resume";

const DEMO_LANDING_RESUME: ResumeData = {
  id: "landing-preview",
  userId: "demo",
  title: "Alex Morgan Resume",
  templateId: "modern",
  themeColor: "#0d9488",
  fontFamily: "Outfit, sans-serif",
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
        "Spearheaded the architecture of an AI workflow engine using Next.js and PostgreSQL, serving 250,000+ daily active users.",
        "Implemented token streaming and optimistic UI patterns, cutting user perceived response latency by 62%.",
        "Mentored 7 engineers and established CI/CD automation standards reducing production incidents by 35%.",
      ],
    },
  ],
  education: [
    {
      id: "edu_1",
      institution: "UC Berkeley",
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
      categoryName: "Core Stack",
      skills: ["TypeScript", "Next.js 15", "React", "PostgreSQL", "Tailwind CSS"],
    },
  ],
  projects: [
    {
      id: "proj_1",
      title: "PulseFlow AI Copilot",
      description: "Developer assistant for automated code reviews using local and cloud LLMs.",
      technologies: ["Next.js", "TypeScript", "LangChain"],
      link: "https://pulseflow.dev",
    },
  ],
  certifications: [
    {
      id: "cert_1",
      name: "AWS Solutions Architect",
      issuer: "Amazon Web Services",
      issueDate: "2023-04",
    },
  ],
  languages: [{ id: "lang_1", language: "English", proficiency: "Native" }],
  sectionOrder: ["personal_info", "summary", "work_experience", "skills", "education", "projects"],
};

const TEMPLATES = [
  { id: "modern" as TemplateId, label: "Modern" },
  { id: "minimal" as TemplateId, label: "ATS" },
  { id: "professional" as TemplateId, label: "Executive" },
  { id: "creative" as TemplateId, label: "Creative" },
] as const;

const ACCENT_COLORS = ["#0d9488", "#059669", "#0f766e", "#334155", "#d97706"];

export default function LandingPage() {
  const [activeTemplate, setActiveTemplate] = useState<TemplateId>("modern");
  const [activeColor, setActiveColor] = useState("#0d9488");

  const previewData: ResumeData = {
    ...DEMO_LANDING_RESUME,
    templateId: activeTemplate,
    themeColor: activeColor,
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden">
      <header className="border-b border-teal-900/5 bg-background/80 backdrop-blur-xl sticky top-0 z-50 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 min-w-0">
          <Link href="/" className="shrink-0 min-w-0">
            <BrandLogo size="sm" className="sm:hidden" />
            <BrandLogo size="md" className="hidden sm:inline-flex" />
          </Link>
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-muted-foreground">
            <a href="#product" className="hover:text-foreground transition-colors">
              Product
            </a>
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
          </nav>
          <AuthNavActions primaryHref="/sign-up" primaryLabel="Get Started" />
        </div>
      </header>

      <section className="relative">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden
          style={{
            backgroundImage: `
              radial-gradient(ellipse 90% 55% at 70% 0%, rgba(13,148,136,0.22), transparent 50%),
              radial-gradient(ellipse 50% 40% at 10% 80%, rgba(251,191,36,0.12), transparent 45%),
              linear-gradient(165deg, hsl(170 30% 97%) 0%, hsl(var(--background)) 45%, hsl(170 20% 94%) 100%)
            `,
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35] dark:opacity-[0.12]"
          aria-hidden
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230d9488' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-16 pb-10 sm:pb-12 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-8 items-center">
          <div className="space-y-5 sm:space-y-7 text-center lg:text-left animate-in fade-in slide-in-from-bottom-3 duration-700 order-1">
            <BrandLogo size="md" className="justify-center lg:justify-start sm:hidden" />
            <BrandLogo size="lg" className="justify-center lg:justify-start hidden sm:inline-flex" />

            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-[1.85rem] leading-[1.12] xs:text-3xl sm:text-5xl lg:text-[3.4rem] font-black tracking-tight text-foreground px-1 sm:px-0">
                {BRAND.tagline.split(":")[0]}:
                <span className="block mt-1 text-teal-700 dark:text-teal-400">
                  {BRAND.tagline.split(":")[1]?.trim() || "ready for the role"}
                </span>
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-md mx-auto lg:mx-0 leading-relaxed px-1">
                AI rewrites, ATS matching, and export-ready resumes — so you walk into every
                application prepared.
              </p>
            </div>

            <ClerkSignedInGate>
              {({ isSignedIn, isLoaded }) => (
                <div className="flex flex-col xs:flex-row flex-wrap justify-center lg:justify-start items-stretch xs:items-center gap-2.5 sm:gap-3 w-full max-w-sm mx-auto lg:mx-0 lg:max-w-none">
                  {!isLoaded ? (
                    <div className="h-11 sm:h-12 w-full xs:w-40 rounded-md bg-muted animate-pulse" />
                  ) : isSignedIn ? (
                    <Link href="/dashboard" className="w-full xs:w-auto">
                      <Button
                        size="lg"
                        className="w-full xs:w-auto text-sm font-semibold shadow-lg shadow-teal-900/15 gap-2 h-11 sm:h-12 px-6 sm:px-7 bg-teal-700 hover:bg-teal-800 text-white"
                      >
                        Go to Dashboard <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link href="/sign-up" className="w-full xs:w-auto">
                        <Button
                          size="lg"
                          className="w-full xs:w-auto text-sm font-semibold shadow-lg shadow-teal-900/15 gap-2 h-11 sm:h-12 px-6 sm:px-7 bg-teal-700 hover:bg-teal-800 text-white"
                        >
                          Start free <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href="/sign-in" className="w-full xs:w-auto">
                        <Button
                          variant="outline"
                          size="lg"
                          className="w-full xs:w-auto text-sm font-semibold h-11 sm:h-12 px-6 border-teal-800/20 hover:bg-teal-50 dark:hover:bg-teal-950/40"
                        >
                          Sign In
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </ClerkSignedInGate>

            <div className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-2 sm:gap-x-5 sm:gap-y-2 text-[11px] text-muted-foreground pt-0.5">
              <span className="inline-flex items-center justify-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-teal-600" /> Up to{" "}
                {BRAND.maxResumesPerUser} resumes
              </span>
              <span className="inline-flex items-center justify-center gap-1.5">
                <Lock className="h-3.5 w-3.5 shrink-0 text-teal-600" /> PDF download after sign-in
              </span>
              <span className="inline-flex items-center justify-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-500" /> AI when unlocked
              </span>
            </div>
          </div>

          <div
            id="product"
            className="relative flex justify-center lg:justify-end animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-right-4 duration-1000 order-2 w-full min-w-0"
          >
            <div
              className="absolute -inset-4 sm:-inset-8 rounded-[2rem] bg-gradient-to-br from-teal-500/20 via-transparent to-amber-400/15 blur-2xl"
              aria-hidden
            />
            <div className="relative w-full max-w-[min(100%,420px)] mx-auto lg:mx-0">
              <div className="absolute -top-2 sm:-top-3 left-3 right-3 sm:left-4 sm:right-4 h-2.5 sm:h-3 rounded-t-xl bg-teal-900/10 dark:bg-teal-400/10" />
              <div className="relative rounded-lg sm:rounded-xl border border-teal-900/10 bg-white shadow-xl sm:shadow-2xl shadow-teal-950/20 overflow-hidden ring-1 ring-black/5">
                <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 border-b bg-slate-50">
                  <span className="h-2 w-2 rounded-full bg-rose-400/80" />
                  <span className="h-2 w-2 rounded-full bg-amber-400/80" />
                  <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
                  <span className="ml-2 text-[10px] font-medium text-slate-400 truncate">
                    preview · {activeTemplate}
                  </span>
                </div>
                <div className="origin-top scale-[0.48] min-[380px]:scale-[0.54] sm:scale-[0.62] h-[300px] min-[380px]:h-[340px] sm:h-[420px] overflow-hidden pointer-events-none">
                  <TemplateRenderer data={previewData} scale={1} />
                </div>
              </div>

              <div className="mt-3 sm:mt-4 -mx-1 px-1 flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 justify-start sm:justify-center snap-x">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTemplate(t.id)}
                    className={`snap-start shrink-0 px-2.5 sm:px-3 py-1.5 rounded-full text-[10px] sm:text-[11px] font-semibold transition-all duration-200 ${
                      activeTemplate === t.id
                        ? "bg-teal-700 text-white shadow-md"
                        : "bg-card/80 border text-muted-foreground hover:text-foreground hover:border-teal-600/40"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="mt-2.5 sm:mt-3 flex items-center justify-center gap-2 sm:gap-1.5">
                {ACCENT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Accent ${color}`}
                    onClick={() => setActiveColor(color)}
                    className={`w-5 h-5 sm:w-4 sm:h-4 rounded-full transition-transform duration-200 touch-manipulation ${
                      activeColor === color
                        ? "scale-110 ring-2 ring-teal-700 ring-offset-2"
                        : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 border-t bg-card/40">
        <div className="max-w-6xl mx-auto space-y-8 sm:space-y-10">
          <div className="max-w-xl space-y-2 text-center sm:text-left mx-auto sm:mx-0">
            <Badge
              className="bg-teal-700/10 text-teal-800 dark:text-teal-300 border-teal-700/20"
              variant="outline"
            >
              Why {BRAND.name}
            </Badge>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
              Built for the interview, not just the page
            </h2>
            <p className="text-sm text-muted-foreground">
              Everything you need to look role-ready — then download your PDF once you&apos;re signed
              in.
            </p>
          </div>

          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                icon: Wand2,
                title: "STAR Bullet Rewriter",
                body: "Turn weak bullets into quantified achievements with optional 20-character hints.",
              },
              {
                icon: Target,
                title: "ATS Job Matcher",
                body: "Paste a job description, see your match score, and add missing skills in one click.",
              },
              {
                icon: FileText,
                title: "AI Cover Letters",
                body: "Generate tailored letters that mirror your resume to the target role.",
              },
              {
                icon: Share2,
                title: "Export & Share",
                body: "Share a live link anytime. PDF download unlocks after you sign in.",
              },
            ].map((f, i) => (
              <div
                key={f.title}
                className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500 text-center min-[480px]:text-left"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="h-10 w-10 rounded-xl bg-teal-600/10 text-teal-700 dark:text-teal-400 flex items-center justify-center mx-auto min-[480px]:mx-0">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-10 sm:py-14 bg-teal-900 text-teal-50 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(circle at 80% 20%, rgba(251,191,36,0.35), transparent 40%), radial-gradient(circle at 10% 90%, rgba(45,212,191,0.25), transparent 35%)",
          }}
        />
        <div className="relative max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6 text-center sm:text-left">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">
              Ready for your next role?
            </h2>
            <p className="text-sm text-teal-100/80 max-w-md mx-auto sm:mx-0">
              Create up to {BRAND.maxResumesPerUser} resumes. Sign in to unlock PDF download.
            </p>
          </div>
          <ClerkSignedInGate>
            {({ isSignedIn, isLoaded }) => (
              <div className="flex flex-col xs:flex-row flex-wrap gap-2.5 sm:gap-3 justify-center w-full sm:w-auto max-w-sm sm:max-w-none">
                {!isLoaded ? (
                  <div className="h-11 w-full xs:w-40 rounded-md bg-teal-800/50 animate-pulse" />
                ) : isSignedIn ? (
                  <Link href="/dashboard" className="w-full xs:w-auto">
                    <Button
                      size="lg"
                      className="w-full xs:w-auto bg-amber-400 hover:bg-amber-300 text-teal-950 font-semibold h-11 px-6 gap-2"
                    >
                      Open Dashboard <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/sign-up" className="w-full xs:w-auto">
                      <Button
                        size="lg"
                        className="w-full xs:w-auto bg-amber-400 hover:bg-amber-300 text-teal-950 font-semibold h-11 px-6"
                      >
                        Create account
                      </Button>
                    </Link>
                    <Link href="/sign-in" className="w-full xs:w-auto">
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full xs:w-auto border-teal-200/40 text-teal-50 hover:bg-teal-800 h-11 px-6"
                      >
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            )}
          </ClerkSignedInGate>
        </div>
      </section>

      <footer className="border-t bg-card py-8 sm:py-10 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-xs text-muted-foreground text-center sm:text-left">
          <BrandLogo size="sm" showTagline />
          <p className="leading-relaxed">
            © 2026 {BRAND.name}. {BRAND.tagline}.
          </p>
        </div>
      </footer>
    </div>
  );
}
