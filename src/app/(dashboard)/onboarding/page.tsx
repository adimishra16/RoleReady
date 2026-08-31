"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { saveUserOnboardingAction } from "@/lib/actions/user.actions";
import { createResumeAction } from "@/lib/actions/resume.actions";
import { TemplateId } from "@/lib/types/resume";
import { VisualTemplateCardPicker } from "@/components/templates/VisualTemplateCardPicker";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { AuthNavActions, isClerkConfigured } from "@/components/brand/AuthNavActions";
import { IndustrySelect } from "@/components/profile/IndustrySelect";
import { industryValueForSave } from "@/lib/profile/industries";
import { TEMPLATE_OPTIONS } from "@/components/templates/TemplateGalleryModal";
import { Sparkles, ArrowRight, ArrowLeft, Check, LayoutTemplate, ShieldCheck } from "lucide-react";

export default function OnboardingPage() {
  if (isClerkConfigured()) {
    return <OnboardingPageClerk />;
  }
  return <OnboardingPageInner />;
}

function OnboardingPageClerk() {
  const { user, isLoaded } = useUser();
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Loading your profile…
      </div>
    );
  }
  return (
    <OnboardingPageInner
      clerkUserId={user?.id}
      clerkEmail={user?.primaryEmailAddress?.emailAddress}
      clerkName={
        [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
        user?.username ||
        undefined
      }
    />
  );
}

function OnboardingPageInner({
  clerkUserId,
  clerkEmail,
  clerkName,
}: {
  clerkUserId?: string;
  clerkEmail?: string;
  clerkName?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(2);
  const [name, setName] = useState(clerkName || "");
  const [jobTitle, setJobTitle] = useState("");
  const [industry, setIndustry] = useState("Tech & Software");
  const [customIndustry, setCustomIndustry] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("modern");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (clerkName) setName((prev) => prev || clerkName);
  }, [clerkName]);

  const selectedOpt = TEMPLATE_OPTIONS.find((t) => t.id === selectedTemplate) || TEMPLATE_OPTIONS[0];

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const ownerId = clerkUserId || "user_demo";
      const ownerEmail = clerkEmail || "demo@roleready.app";

      await saveUserOnboardingAction({
        userId: ownerId,
        email: ownerEmail,
        name: name || clerkName || "User",
        targetJobTitle: jobTitle || "Software Engineer",
        industry: industryValueForSave(industry, customIndustry) || "Tech & Software",
      });

      const res = await createResumeAction(
        ownerId,
        `${jobTitle || "Software Engineer"} Resume`,
        selectedTemplate
      );

      if (!res.success) {
        alert(res.error || "Could not create resume. You may have reached the 3-resume limit.");
        router.push("/dashboard");
        return;
      }

      const newId = res.resume?.id || "demo-resume-1";
      if (typeof window !== "undefined" && res.resume) {
        try {
          localStorage.setItem(
            "cv_builder_resume_" + newId,
            JSON.stringify(res.resume)
          );
          const listKey = "cv_builder_user_resumes";
          const existing = JSON.parse(localStorage.getItem(listKey) || "[]");
          const entry = {
            id: newId,
            title: res.resume.title,
            templateId: res.resume.templateId,
            themeColor: res.resume.themeColor,
            updatedAt: "Just now",
            jobTitle: jobTitle || "—",
          };
          const next = [
            entry,
            ...existing.filter((r: { id: string }) => r.id !== newId && r.id !== "resume-frontend-lead"),
          ].slice(0, 3);
          localStorage.setItem(listKey, JSON.stringify(next));
        } catch {}
      }
      router.push(`/builder/${newId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/* Studio Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b bg-card/90 backdrop-blur-md px-6 py-3.5 flex items-center justify-between shadow-xs">
        <BrandLogo size="md" showTagline />

        {/* Step Progress Pill */}
        <div className="hidden sm:flex items-center gap-2 bg-muted/60 px-3 py-1.5 rounded-full border text-xs font-semibold">
          <span className={step === 1 ? "text-primary font-bold" : "text-muted-foreground"}>1. Profile</span>
          <span className="text-muted-foreground">→</span>
          <span className={step === 2 ? "text-primary font-bold" : "text-muted-foreground"}>2. Choose Design</span>
          <span className="text-muted-foreground">→</span>
          <span className={step === 3 ? "text-primary font-bold" : "text-muted-foreground"}>3. Launch</span>
        </div>

        <div className="flex items-center gap-2">
          <AuthNavActions compact showDashboardLink primaryHref="/sign-up" primaryLabel="Get Started" />
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
              Skip to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Full-Bleed Studio Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Step 1: User Profile Details */}
        {step === 1 && (
          <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-card border shadow-xl space-y-6 animate-in fade-in-50 duration-200">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-black text-foreground">Tell us about yourself</h2>
              <p className="text-xs text-muted-foreground">
                We'll tailor your AI assistant and achievement templates to your target position.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                  Full Name
                </label>
                <Input
                  placeholder="e.g., Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  className="font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                  Target Job Title
                </label>
                <Input
                  placeholder="e.g., Senior Full Stack Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="font-medium"
                />
              </div>
              <IndustrySelect
                industry={industry}
                customIndustry={customIndustry}
                onIndustryChange={setIndustry}
                onCustomIndustryChange={setCustomIndustry}
              />
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={!name.trim()}
              variant="gradient"
              className="w-full gap-2 text-sm shadow-md"
            >
              Choose Template Design <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step 2: Template gallery */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in-50 duration-300">
            {/* Hero Heading */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <Badge variant="ai" className="mb-1">
                ✨ 7 Designer Templates Included
              </Badge>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                Select a resume design to start
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Choose your initial visual layout. You can switch templates, colors, fonts, and custom sections anytime with 1 click in the live builder.
              </p>
            </div>

            {/* Visual Card Grid with Filter Tabs */}
            <VisualTemplateCardPicker
              selectedTemplate={selectedTemplate}
              onSelectTemplate={(templateId) => setSelectedTemplate(templateId)}
              showFilters={true}
            />
          </div>
        )}

        {/* Step 3: Confirmation Summary */}
        {step === 3 && (
          <div className="max-w-lg mx-auto my-8 p-8 rounded-3xl bg-card border shadow-xl text-center space-y-6 animate-in fade-in-50 duration-200">
            <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-600">
              <Check className="h-8 w-8 stroke-[3]" />
            </div>
            <h2 className="text-2xl font-black text-foreground">Ready to Build!</h2>

            <div className="p-4 bg-muted/40 rounded-2xl text-left space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Full Name:</span>
                <span className="font-extrabold text-foreground">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target Role:</span>
                <span className="font-extrabold text-foreground">{jobTitle}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground shrink-0">Industry:</span>
                <span className="font-extrabold text-foreground text-right">
                  {industryValueForSave(industry, customIndustry)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Selected Layout:</span>
                <span className="font-extrabold text-primary">{selectedOpt.name} ({selectedOpt.tag})</span>
              </div>
            </div>

            <Button
              onClick={handleFinish}
              disabled={isSubmitting}
              variant="gradient"
              className="w-full gap-2 text-sm shadow-lg h-11"
            >
              {isSubmitting ? "Opening Builder Studio..." : "Launch Live Resume Builder"} <Sparkles className="h-4 w-4" />
            </Button>
          </div>
        )}
      </main>

      {/* Sticky Bottom Action Bar (Studio Style) */}
      <footer className="sticky bottom-0 z-30 border-t bg-card/90 backdrop-blur-md px-6 py-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-2">
          {step > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep(step - 1)}
              className="gap-1.5 text-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {step === 2 && (
            <Button
              variant="gradient"
              size="sm"
              onClick={() => setStep(3)}
              className="gap-2 text-xs px-6 shadow-md"
            >
              Use {selectedOpt.name} <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
