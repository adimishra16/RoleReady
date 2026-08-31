"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { TemplateRenderer } from "@/components/templates/TemplateRenderer";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { AuthNavActions, ClerkSignedInGate } from "@/components/brand/AuthNavActions";
import { BRAND } from "@/lib/brand";
import { ResumeData, TemplateId } from "@/lib/types/resume";
import { A4_WIDTH_PX } from "@/lib/pdf/export-resume-pdf";

const DEMO_LANDING_RESUME: ResumeData = {
  id: "landing-preview",
  userId: "demo",
  title: "Priya Sharma Resume",
  templateId: "minimal",
  themeColor: "#0f766e",
  fontFamily: "IBM Plex Sans, sans-serif",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  personalInfo: {
    fullName: "Priya Sharma",
    jobTitle: "Product Marketing Manager",
    email: "priya.sharma@email.com",
    phone: "+91 98765 43210",
    location: "Mumbai, India",
    website: "",
    linkedin: "linkedin.com/in/priyasharma",
  },
  summary:
    "Product marketer with eight years helping B2B teams find clearer stories. Led launches that grew pipeline without drowning in jargon.",
  workExperience: [
    {
      id: "exp_1",
      jobTitle: "Senior Product Marketing Manager",
      company: "Northline",
      location: "Mumbai",
      startDate: "2021-06",
      endDate: "",
      current: true,
      bullets: [
        "Owned messaging for three product lines used by 400+ enterprise customers.",
        "Reworked launch playbooks — cut time-to-first-campaign from six weeks to nine days.",
      ],
    },
    {
      id: "exp_2",
      jobTitle: "Product Marketing Manager",
      company: "Brightpath Labs",
      location: "Pune",
      startDate: "2018-03",
      endDate: "2021-05",
      current: false,
      bullets: [
        "Partnered with sales on win/loss notes that shaped the 2020 roadmap.",
      ],
    },
  ],
  education: [
    {
      id: "edu_1",
      institution: "University of Mumbai",
      degree: "MBA",
      fieldOfStudy: "Marketing",
      location: "Mumbai",
      startDate: "2015-06",
      endDate: "2017-05",
      gpa: "",
    },
  ],
  skills: [
    {
      id: "cat_1",
      categoryName: "Focus",
      skills: ["Positioning", "Launch planning", "Customer research", "Narrative"],
    },
  ],
  projects: [],
  certifications: [],
  languages: [
    { id: "lang_1", language: "English", proficiency: "Fluent" },
    { id: "lang_2", language: "Hindi", proficiency: "Native" },
  ],
  sectionOrder: ["personal_info", "summary", "work_experience", "skills", "education"],
};

const TEMPLATES = [
  { id: "minimal" as TemplateId, label: "Clean ATS" },
  { id: "modern" as TemplateId, label: "Modern" },
  { id: "professional" as TemplateId, label: "Executive" },
  { id: "elegant_serif" as TemplateId, label: "Editorial" },
] as const;

const PREVIEW_MAX_H = 440;

function LandingResumePreview({ data }: { data: ResumeData }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useLayoutEffect(() => {
    const el = frameRef.current;
    if (!el) return;

    const update = () => {
      const width = el.clientWidth;
      if (width > 0) setScale(Math.min(0.62, width / A4_WIDTH_PX));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={frameRef}
      className="w-full overflow-hidden bg-white"
      style={{ height: PREVIEW_MAX_H }}
    >
      <div className="flex justify-center origin-top">
        <TemplateRenderer data={data} scale={scale} />
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [activeTemplate, setActiveTemplate] = useState<TemplateId>("minimal");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  const previewData: ResumeData = {
    ...DEMO_LANDING_RESUME,
    templateId: activeTemplate,
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-[#f4f5f7] text-slate-900 dark:bg-[#15181e] dark:text-slate-100">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 dark:border-white/10 bg-[#f4f5f7]/95 dark:bg-[#15181e]/95 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto h-14 flex items-center justify-between gap-4">
          <Link href="/" className="shrink-0">
            <BrandLogo size="md" />
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-slate-500 dark:text-slate-400">
            <a href="#how" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              How it helps
            </a>
            <Link
              href="/pricing"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Pricing
            </Link>
          </nav>
          <AuthNavActions compact primaryHref="/sign-up" primaryLabel="Start free" />
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div
            className={`space-y-6 max-w-xl mx-auto lg:mx-0 text-center lg:text-left transition-all duration-700 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
          >
            <p className="text-[13px] font-semibold tracking-[0.14em] uppercase text-teal-800 dark:text-teal-400">
              {BRAND.name}
            </p>

            <h1 className="text-[2rem] sm:text-[2.65rem] lg:text-[2.85rem] font-semibold tracking-tight leading-[1.18] text-slate-900 dark:text-white text-balance">
              A professional resume for the role you want next.
            </h1>

            <p className="text-[15px] sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto lg:mx-0">
              Write clearly, check ATS fit for your target role, and export a clean PDF. Optional AI
              help when you need it — from ₹59/month.
            </p>

            <ClerkSignedInGate>
              {({ isSignedIn, isLoaded }) => (
                <div className="flex flex-col xs:flex-row flex-wrap justify-center lg:justify-start gap-3 pt-1">
                  {!isLoaded ? (
                    <div className="h-11 w-40 rounded-md bg-slate-200 dark:bg-white/10 animate-pulse" />
                  ) : isSignedIn ? (
                    <>
                      <Link href="/dashboard">
                        <Button
                          size="lg"
                          className="h-11 px-6 bg-teal-800 hover:bg-teal-900 text-white font-medium gap-2"
                        >
                          Go to dashboard <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href="/pricing">
                        <Button
                          size="lg"
                          variant="outline"
                          className="h-11 px-5 font-medium border-slate-300 dark:border-white/15 bg-transparent"
                        >
                          View pricing
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/sign-up">
                        <Button
                          size="lg"
                          className="h-11 px-6 bg-teal-800 hover:bg-teal-900 text-white font-medium gap-2"
                        >
                          Start free <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href="/sign-in">
                        <Button
                          size="lg"
                          variant="outline"
                          className="h-11 px-5 font-medium border-slate-300 dark:border-white/15 bg-transparent"
                        >
                          Sign in
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </ClerkSignedInGate>
          </div>

          <div
            id="product"
            className={`transition-all duration-700 delay-75 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1b1f27] shadow-sm overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 border-b border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03]">
                <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400">
                  Sample resume
                </p>
                <div className="flex flex-wrap gap-1">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTemplate(t.id)}
                      className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors ${
                        activeTemplate === t.id
                          ? "bg-teal-800 text-white dark:bg-teal-600"
                          : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <LandingResumePreview data={previewData} />
            </div>
            <p className="mt-3 text-[12px] text-slate-500 dark:text-slate-500 text-center lg:text-left">
              Preview styles only — your content never leaves your account when you build.
            </p>
          </div>
        </div>
      </section>

      <section
        id="how"
        className="border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#12151a] py-14 sm:py-16 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-10 sm:mb-12 max-w-lg">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Built for serious job applications
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Straightforward tools. No gimmicks — just what you need before you hit apply.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 sm:gap-10">
            {[
              {
                title: "Write the story",
                body: "Fill sections that recruiters expect. Templates stay ATS-friendly without looking empty or templated.",
              },
              {
                title: "Score the fit",
                body: "Check how your resume aligns with a target role — and where gaps still cost interviews.",
              },
              {
                title: "Export with confidence",
                body: "Download a clean PDF when signed in. Share a live link when you want feedback.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="space-y-2 border-t border-slate-200 dark:border-white/10 pt-5"
              >
                <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 dark:border-white/10 px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-md space-y-1.5">
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Free to start. AI when you need it.
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Starter ₹59/mo · Pro ₹119/mo. Cancel anytime.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/sign-up">
              <Button className="h-10 px-5 bg-teal-800 hover:bg-teal-900 text-white font-medium gap-2">
                Create account <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                variant="outline"
                className="h-10 px-5 font-medium border-slate-300 dark:border-white/15 bg-transparent"
              >
                Compare plans
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 dark:border-white/10 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-[12px] text-slate-500">
          <BrandLogo size="sm" />
          <p>© 2026 {BRAND.name}</p>
        </div>
      </footer>
    </div>
  );
}
