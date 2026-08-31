"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Wand2,
  Gauge,
  FileText,
  ArrowRight,
  CheckCircle2,
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
    phone: "+91 98765 43210",
    location: "Bengaluru, India",
    website: "https://alexmorgan.dev",
    linkedin: "https://linkedin.com/in/alexmorgan",
  },
  summary:
    "Full Stack Engineer with 6+ years building high-traffic products. Cut latency 45% and shipped AI features used by 250k+ daily users.",
  workExperience: [
    {
      id: "exp_1",
      jobTitle: "Lead Full Stack Engineer",
      company: "Nexus Technologies",
      location: "Bengaluru",
      startDate: "2022-03",
      endDate: "",
      current: true,
      bullets: [
        "Led Next.js + PostgreSQL platform serving 250,000+ DAU.",
        "Cut perceived latency 62% with streaming UI patterns.",
      ],
    },
  ],
  education: [
    {
      id: "edu_1",
      institution: "NIT Karnataka",
      degree: "B.Tech",
      fieldOfStudy: "Computer Science",
      location: "Surathkal",
      startDate: "2015-08",
      endDate: "2019-05",
      gpa: "",
    },
  ],
  skills: [
    {
      id: "cat_1",
      categoryName: "Core",
      skills: ["TypeScript", "Next.js", "React", "PostgreSQL", "AWS"],
    },
  ],
  projects: [],
  certifications: [],
  languages: [{ id: "lang_1", language: "English", proficiency: "Fluent" }],
  sectionOrder: ["personal_info", "summary", "work_experience", "skills", "education"],
};

const TEMPLATES = [
  { id: "modern" as TemplateId, label: "Modern" },
  { id: "minimal" as TemplateId, label: "ATS" },
  { id: "professional" as TemplateId, label: "Executive" },
  { id: "creative" as TemplateId, label: "Creative" },
] as const;

export default function LandingPage() {
  const [activeTemplate, setActiveTemplate] = useState<TemplateId>("modern");
  const [scorePulse, setScorePulse] = useState(86);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const t = setInterval(() => {
      setScorePulse((s) => (s >= 92 ? 78 : s + 1));
    }, 140);
    return () => clearInterval(t);
  }, []);

  const previewData: ResumeData = {
    ...DEMO_LANDING_RESUME,
    templateId: activeTemplate,
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden">
      {/* Theme-aware atmosphere */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden
        style={{
          backgroundImage: `
            radial-gradient(ellipse 85% 55% at 12% -5%, rgba(13,148,136,0.18), transparent 55%),
            radial-gradient(ellipse 55% 40% at 92% 8%, rgba(217,119,6,0.10), transparent 50%),
            linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--background)) 100%)
          `,
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-40 dark:opacity-25"
        aria-hidden
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%230d9488' fill-opacity='0.05'%3E%3Cpath d='M0 0h20v20H0V0zm20 20h20v20H20V20z'/%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />

      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 min-w-0">
          <Link href="/" className="shrink-0">
            <BrandLogo size="md" />
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-muted-foreground">
            <a href="#product" className="hover:text-foreground transition-colors">
              Product
            </a>
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <Link href="/pricing" className="hover:text-foreground transition-colors">
              Pricing
            </Link>
          </nav>
          <AuthNavActions primaryHref="/sign-up" primaryLabel="Start free" />
        </div>
      </header>

      <section className="relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 lg:pt-16 pb-12 sm:pb-16 grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-12 items-center">
          <div
            className={`space-y-6 sm:space-y-7 text-center lg:text-left transition-all duration-700 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
          >
            <BrandLogo size="lg" className="justify-center lg:justify-start" />

            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-[3.35rem] font-black tracking-tight leading-[1.08] text-foreground">
                Ready for the{" "}
                <span className="text-teal-700 dark:text-teal-400">role</span>.
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto lg:mx-0 leading-relaxed">
                Build an ATS-ready resume, score it for your target role, and unlock AI rewrites from
                ₹59/month.
              </p>
            </div>

            <ClerkSignedInGate>
              {({ isSignedIn, isLoaded }) => (
                <div className="flex flex-col xs:flex-row flex-wrap justify-center lg:justify-start gap-3">
                  {!isLoaded ? (
                    <div className="h-12 w-40 rounded-lg bg-muted animate-pulse" />
                  ) : isSignedIn ? (
                    <>
                      <Link href="/dashboard">
                        <Button
                          size="lg"
                          className="h-12 px-7 bg-teal-700 hover:bg-teal-800 text-white font-semibold gap-2 shadow-md shadow-teal-900/10"
                        >
                          Go to Dashboard <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href="/pricing">
                        <Button
                          size="lg"
                          variant="outline"
                          className="h-12 px-6 border-teal-700/25 text-foreground hover:bg-teal-700/5 hover:text-teal-800 dark:hover:text-teal-300"
                        >
                          AI from ₹59/mo
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/sign-up">
                        <Button
                          size="lg"
                          className="h-12 px-7 bg-teal-700 hover:bg-teal-800 text-white font-semibold gap-2 shadow-md shadow-teal-900/10"
                        >
                          Start free <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href="/pricing">
                        <Button
                          size="lg"
                          variant="outline"
                          className="h-12 px-6 border-teal-700/25 text-foreground hover:bg-teal-700/5 hover:text-teal-800 dark:hover:text-teal-300"
                        >
                          See ₹59 plan
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </ClerkSignedInGate>

            <div className="flex flex-wrap justify-center lg:justify-start gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" /> Role-based
                ATS /100
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" /> AI unlock
                ₹59/mo
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" /> Up to{" "}
                {BRAND.maxResumesPerUser} resumes
              </span>
            </div>
          </div>

          <div
            id="product"
            className={`relative transition-all duration-1000 delay-100 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
          >
            <div
              className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-teal-500/15 via-transparent to-amber-400/10 blur-2xl"
              aria-hidden
            />
            <div className="relative mx-auto max-w-[400px]">
              <div className="absolute -left-1 sm:-left-5 top-8 z-10 rounded-2xl border border-border bg-card/95 backdrop-blur-md px-3.5 py-2.5 shadow-lg">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Role ATS
                </p>
                <p className="text-2xl font-black tabular-nums text-foreground">
                  {scorePulse}
                  <span className="text-sm text-muted-foreground">/100</span>
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card shadow-xl shadow-black/5 dark:shadow-black/30 overflow-hidden">
                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border bg-muted/40">
                  <span className="h-2 w-2 rounded-full bg-rose-400/80" />
                  <span className="h-2 w-2 rounded-full bg-amber-400/80" />
                  <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
                  <span className="ml-2 text-[10px] font-medium text-muted-foreground truncate">
                    preview · {activeTemplate}
                  </span>
                </div>
                <div className="origin-top scale-[0.5] min-[400px]:scale-[0.55] sm:scale-[0.6] h-[320px] sm:h-[380px] overflow-hidden pointer-events-none bg-white">
                  <TemplateRenderer data={previewData} scale={1} />
                </div>
              </div>

              <div className="mt-4 flex gap-2 overflow-x-auto pb-1 justify-center">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTemplate(t.id)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all border ${
                      activeTemplate === t.id
                        ? "bg-teal-700 text-white border-teal-700 dark:bg-teal-500 dark:text-teal-950 dark:border-teal-500"
                        : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-teal-600/40"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="border-t border-border bg-muted/30 dark:bg-muted/15 py-14 sm:py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="max-w-lg space-y-2 text-center sm:text-left mx-auto sm:mx-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-400">
              Why {BRAND.name}
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Built for the role you want
            </h2>
            <p className="text-sm text-muted-foreground">
              Free builder + PDF after sign-in. AI features unlock with a simple monthly plan.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                icon: Gauge,
                title: "Role-based ATS /100",
                body: "Score your resume against your target role — engineer, PM, marketing, and more.",
              },
              {
                icon: Wand2,
                title: "AI from ₹59/mo",
                body: "Bullet rewrites, summaries, cover letters, and AI ATS checks on one subscription.",
              },
              {
                icon: FileText,
                title: "Export & share",
                body: "Download PDF when signed in. Share a live link anytime.",
              },
            ].map((f, i) => (
              <div
                key={f.title}
                className="space-y-3 transition-all duration-500"
                style={{
                  transitionDelay: `${i * 80}ms`,
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "none" : "translateY(10px)",
                }}
              >
                <div className="h-10 w-10 rounded-xl bg-teal-700/10 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300 flex items-center justify-center">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
        <div className="relative max-w-6xl mx-auto overflow-hidden rounded-3xl border border-teal-800/15 dark:border-teal-400/15 bg-gradient-to-br from-teal-700/[0.08] via-background to-amber-500/[0.07] p-8 sm:p-10">
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                AI Starter · ₹59/month
              </h2>
              <p className="text-sm text-muted-foreground max-w-md">
                Unlock rewrites, role-based AI ATS, job match, and cover letters. Pro at ₹119 for
                higher limits.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/pricing">
                <Button
                  size="lg"
                  className="h-11 px-6 bg-teal-700 hover:bg-teal-800 text-white font-semibold gap-2"
                >
                  View plans <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-11 px-6 border-border text-foreground hover:bg-muted"
                >
                  Create free account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card/40 py-8 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-muted-foreground">
          <BrandLogo size="sm" showTagline />
          <p>
            © 2026 {BRAND.name}. {BRAND.tagline}.
          </p>
        </div>
      </footer>
    </div>
  );
}
