"use client";

import React, { use, useState } from "react";
import { useResumeStore } from "@/lib/hooks/useResumeStore";
import { ResumeData, CustomSectionEntry } from "@/lib/types/resume";
import { BuilderHeader } from "@/components/builder/BuilderHeader";
import { SectionSidebar } from "@/components/builder/SectionSidebar";
import { ResumePreviewPane } from "@/components/builder/ResumePreviewPane";
import { PersonalInfoSection } from "@/components/builder/sections/PersonalInfoSection";
import { SummarySection } from "@/components/builder/sections/SummarySection";
import { WorkExperienceSection } from "@/components/builder/sections/WorkExperienceSection";
import { EducationSection } from "@/components/builder/sections/EducationSection";
import { SkillsSection } from "@/components/builder/sections/SkillsSection";
import { ProjectsSection } from "@/components/builder/sections/ProjectsSection";
import { CertificationsSection } from "@/components/builder/sections/CertificationsSection";
import { LanguagesSection } from "@/components/builder/sections/LanguagesSection";
import { CustomSectionEditor } from "@/components/builder/sections/CustomSectionEditor";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

const DEFAULT_DEMO_RESUME: ResumeData = {
  id: "demo-resume-1",
  userId: "user_demo",
  title: "Senior Full Stack Engineer",
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
  customSections: [],
  customTitles: {},
  hiddenSections: [],
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

export default function ResumeBuilderPage({
  params,
}: {
  params: Promise<{ resumeId: string }>;
}) {
  const resolvedParams = use(params);
  const resumeId = resolvedParams.resumeId;

  const initialResume = { ...DEFAULT_DEMO_RESUME, id: resumeId };

  const {
    data,
    saveStatus,
    activeSection,
    setActiveSection,
    zoomScale,
    setZoomScale,
    updatePersonalInfo,
    updateSummary,
    updateTemplate,
    updateThemeColor,
    updateFontFamily,
    updateTitle,
    addWorkExperience,
    updateWorkExperience,
    removeWorkExperience,
    reorderWorkExperience,
    addEducation,
    updateEducation,
    removeEducation,
    updateSkills,
    updateProjects,
    updateCertifications,
    updateLanguages,
    reorderSections,
    toggleSectionVisibility,
    renameSectionTitle,
    addCustomSection,
    removeCustomSection,
    updateCustomSection,
  } = useResumeStore(initialResume);

  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);

  const handleAddMissingSkillFromJd = (newSkill: string) => {
    if (data.skills.length === 0) {
      updateSkills([{ id: "cat_1", categoryName: "Technical Skills", skills: [newSkill] }]);
    } else {
      const updated = [...data.skills];
      if (!updated[0].skills.includes(newSkill)) {
        updated[0] = { ...updated[0], skills: [...updated[0].skills, newSkill] };
        updateSkills(updated);
      }
    }
  };

  const renderActiveSectionForm = () => {
    if (typeof activeSection === "string" && activeSection.startsWith("csec_")) {
      const customSec = data.customSections?.find((s) => s.id === activeSection);
      if (customSec) {
        return (
          <CustomSectionEditor
            section={customSec}
            onUpdateSection={(updated) => updateCustomSection(customSec.id, updated)}
            onRemoveSection={() => {
              removeCustomSection(customSec.id);
              setActiveSection("personal_info");
            }}
            onRenameTitle={(newTitle) => renameSectionTitle(customSec.id, newTitle)}
          />
        );
      }
    }

    switch (activeSection) {
      case "personal_info":
        return (
          <PersonalInfoSection
            data={data.personalInfo}
            onChange={updatePersonalInfo}
          />
        );
      case "summary":
        return (
          <SummarySection
            summary={data.summary}
            onChange={updateSummary}
            resumeData={data}
          />
        );
      case "work_experience":
        return (
          <WorkExperienceSection
            items={data.workExperience}
            onAdd={addWorkExperience}
            onUpdate={updateWorkExperience}
            onRemove={removeWorkExperience}
            onReorder={reorderWorkExperience}
          />
        );
      case "skills":
        return (
          <SkillsSection
            categories={data.skills}
            onChange={updateSkills}
          />
        );
      case "education":
        return (
          <EducationSection
            items={data.education}
            onAdd={addEducation}
            onUpdate={updateEducation}
            onRemove={removeEducation}
          />
        );
      case "projects":
        return (
          <ProjectsSection
            items={data.projects}
            onChange={updateProjects}
          />
        );
      case "certifications":
        return (
          <CertificationsSection
            items={data.certifications}
            onChange={updateCertifications}
          />
        );
      case "languages":
        return (
          <LanguagesSection
            items={data.languages}
            onChange={updateLanguages}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Navbar Header */}
      <BuilderHeader
        data={data}
        saveStatus={saveStatus}
        onUpdateTitle={updateTitle}
        onUpdateTemplate={updateTemplate}
        onUpdateThemeColor={updateThemeColor}
        onUpdateFontFamily={updateFontFamily}
        onAddMissingSkill={handleAddMissingSkillFromJd}
        onToggleMobilePreview={() => setIsMobilePreviewOpen(!isMobilePreviewOpen)}
        isMobilePreviewOpen={isMobilePreviewOpen}
      />

      {/* Main Split Builder Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Form Editor & Navigation */}
        <div
          className={`w-full lg:w-1/2 flex flex-col md:flex-row h-[calc(100vh-57px)] overflow-hidden ${
            isMobilePreviewOpen ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Section Navigation Column */}
          <div className="w-full md:w-52 p-3 border-r bg-card/30 shrink-0 overflow-y-auto">
            <SectionSidebar
              activeSection={activeSection}
              onSelectSection={setActiveSection}
              sectionOrder={data.sectionOrder}
              hiddenSections={data.hiddenSections}
              customTitles={data.customTitles}
              customSections={data.customSections}
              onToggleVisibility={toggleSectionVisibility}
              onReorderSections={reorderSections}
              onRenameTitle={renameSectionTitle}
              onAddCustomSection={(title) => {
                addCustomSection(title);
              }}
            />
          </div>

          {/* Active Section Form Fields */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-xl mx-auto">
              <ErrorBoundary fallbackTitle="Error loading section editor">
                {renderActiveSectionForm()}
              </ErrorBoundary>
            </div>
          </div>
        </div>

        {/* Right Side: Live Resume Preview Pane */}
        <div
          className={`w-full lg:w-1/2 h-[calc(100vh-57px)] ${
            isMobilePreviewOpen ? "block" : "hidden lg:block"
          }`}
        >
          <ResumePreviewPane
            data={data}
            scale={zoomScale}
            onZoomIn={() => setZoomScale((prev) => Math.min(1.5, prev + 0.1))}
            onZoomOut={() => setZoomScale((prev) => Math.max(0.4, prev - 0.1))}
            onResetZoom={() => setZoomScale(0.85)}
          />
        </div>
      </div>
    </div>
  );
}
