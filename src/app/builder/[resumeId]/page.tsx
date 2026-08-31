"use client";

import React, { use, useState, useCallback } from "react";
import { useResumeStore } from "@/lib/hooks/useResumeStore";
import { createBlankResume } from "@/lib/resume/blank-resume";
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

export default function ResumeBuilderPage({
  params,
}: {
  params: Promise<{ resumeId: string }>;
}) {
  const resolvedParams = use(params);
  const resumeId = resolvedParams.resumeId;

  // Blank shell — localStorage / Neon content loads via useResumeStore
  const initialResume = createBlankResume({ id: resumeId });

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
  const [fitScale, setFitScale] = useState(0.85);

  const handleFitScale = useCallback((next: number) => {
    setFitScale(next);
  }, []);

  const handleToggleMobilePreview = useCallback(() => {
    setIsMobilePreviewOpen((prev) => {
      const opening = !prev;
      if (opening) {
        setZoomScale(fitScale);
      }
      return opening;
    });
  }, [fitScale, setZoomScale]);

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
      case "education":
        return (
          <EducationSection
            items={data.education}
            onAdd={addEducation}
            onUpdate={updateEducation}
            onRemove={removeEducation}
          />
        );
      case "skills":
        return (
          <SkillsSection
            categories={data.skills}
            onChange={updateSkills}
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
      <BuilderHeader
        data={data}
        saveStatus={saveStatus}
        onUpdateTitle={updateTitle}
        onUpdateTemplate={updateTemplate}
        onUpdateThemeColor={updateThemeColor}
        onUpdateFontFamily={updateFontFamily}
        onAddMissingSkill={handleAddMissingSkillFromJd}
        onToggleMobilePreview={handleToggleMobilePreview}
        isMobilePreviewOpen={isMobilePreviewOpen}
      />

      <div className="flex-1 flex overflow-hidden">
        <div
          className={`w-full lg:w-1/2 flex flex-col md:flex-row h-[calc(100vh-57px)] overflow-hidden ${
            isMobilePreviewOpen ? "hidden lg:flex" : "flex"
          }`}
        >
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

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-xl mx-auto">
              <ErrorBoundary fallbackTitle="Error loading section editor">
                {renderActiveSectionForm()}
              </ErrorBoundary>
            </div>
          </div>
        </div>

        <div
          className={
            isMobilePreviewOpen
              ? "w-full lg:w-1/2 h-[calc(100vh-57px)] block"
              : "hidden lg:block lg:w-1/2 h-[calc(100vh-57px)]"
          }
        >
          <ResumePreviewPane
            data={data}
            scale={zoomScale}
            onZoomIn={() => setZoomScale((prev) => Math.min(1.5, prev + 0.05))}
            onZoomOut={() => setZoomScale((prev) => Math.max(0.32, prev - 0.05))}
            onResetZoom={() => setZoomScale(fitScale)}
            onFitScale={handleFitScale}
          />
        </div>
      </div>
    </div>
  );
}
