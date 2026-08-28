"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ResumeData,
  PersonalInfo,
  WorkExperienceItem,
  EducationItem,
  SkillCategory,
  ProjectItem,
  CertificationItem,
  LanguageItem,
  CustomSectionEntry,
  SectionType,
  TemplateId,
} from "@/lib/types/resume";
import { saveResumeAction } from "@/lib/actions/resume.actions";
import { generateId } from "@/lib/utils";
import { sanitizeResumeData } from "@/lib/ai/parse-bullet-variations";

const LOCAL_STORAGE_KEY_PREFIX = "cv_builder_resume_";

function loadResumeFromStorage(resumeId: string, fallback: ResumeData): ResumeData | null {
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + resumeId);
    if (!cached) return null;
    const parsed = JSON.parse(cached) as ResumeData;
    return sanitizeResumeData({ ...fallback, ...parsed });
  } catch (e) {
    console.warn("Failed to read from localStorage", e);
    return null;
  }
}

export function useResumeStore(initialData: ResumeData) {
  const initialDataRef = useRef(initialData);
  initialDataRef.current = initialData;

  const [data, setData] = useState<ResumeData>(initialData);

  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved" | "error">("saved");
  const [activeSection, setActiveSection] = useState<SectionType | string>("personal_info");
  const [zoomScale, setZoomScale] = useState<number>(0.85);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestDataRef = useRef<ResumeData>(data);
  latestDataRef.current = data;

  // Load localStorage after mount so SSR and first client render match (avoids hydration errors)
  useEffect(() => {
    const stored = loadResumeFromStorage(
      initialDataRef.current.id,
      initialDataRef.current
    );
    if (stored) {
      setData(stored);
    }
  }, []);

  // Auto-save logic (debounced 1200ms)
  const triggerAutoSave = useCallback((newData: ResumeData) => {
    setSaveStatus("unsaved");

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          LOCAL_STORAGE_KEY_PREFIX + newData.id,
          JSON.stringify(sanitizeResumeData(newData))
        );
      } catch (e) {
        console.warn("Local storage cache write failed", e);
      }
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        setSaveStatus("saving");
        const res = await saveResumeAction(newData);
        if (res.success) {
          setSaveStatus("saved");
        } else {
          setSaveStatus("error");
        }
      } catch {
        setSaveStatus("error");
      }
    }, 1200);
  }, []);

  const updatePersonalInfo = useCallback((info: Partial<PersonalInfo>) => {
    setData((prev) => {
      const next = {
        ...prev,
        personalInfo: { ...prev.personalInfo, ...info },
        updatedAt: new Date().toISOString(),
      };
      triggerAutoSave(next);
      return next;
    });
  }, [triggerAutoSave]);

  const updateSummary = useCallback((summaryText: string) => {
    setData((prev) => {
      const next = {
        ...prev,
        summary: summaryText,
        updatedAt: new Date().toISOString(),
      };
      triggerAutoSave(next);
      return next;
    });
  }, [triggerAutoSave]);

  const updateTemplate = useCallback((templateId: TemplateId) => {
    setData((prev) => {
      const next = { ...prev, templateId, updatedAt: new Date().toISOString() };
      triggerAutoSave(next);
      return next;
    });
  }, [triggerAutoSave]);

  const updateThemeColor = useCallback((themeColor: string) => {
    setData((prev) => {
      const next = { ...prev, themeColor, updatedAt: new Date().toISOString() };
      triggerAutoSave(next);
      return next;
    });
  }, [triggerAutoSave]);

  const updateFontFamily = useCallback((fontFamily: string) => {
    setData((prev) => {
      const next = { ...prev, fontFamily, updatedAt: new Date().toISOString() };
      triggerAutoSave(next);
      return next;
    });
  }, [triggerAutoSave]);

  const updateTitle = useCallback((title: string) => {
    setData((prev) => {
      const next = { ...prev, title, updatedAt: new Date().toISOString() };
      triggerAutoSave(next);
      return next;
    });
  }, [triggerAutoSave]);

  // Work Experience Handlers
  const addWorkExperience = useCallback((item: WorkExperienceItem) => {
    setData((prev) => {
      const next = {
        ...prev,
        workExperience: [item, ...prev.workExperience],
        updatedAt: new Date().toISOString(),
      };
      triggerAutoSave(next);
      return next;
    });
  }, [triggerAutoSave]);

  const updateWorkExperience = useCallback((id: string, updated: Partial<WorkExperienceItem>) => {
    setData((prev) => {
      const next = {
        ...prev,
        workExperience: prev.workExperience.map((exp) =>
          exp.id === id ? { ...exp, ...updated } : exp
        ),
        updatedAt: new Date().toISOString(),
      };
      triggerAutoSave(next);
      return next;
    });
  }, [triggerAutoSave]);

  const removeWorkExperience = useCallback((id: string) => {
    setData((prev) => {
      const next = {
        ...prev,
        workExperience: prev.workExperience.filter((exp) => exp.id !== id),
        updatedAt: new Date().toISOString(),
      };
      triggerAutoSave(next);
      return next;
    });
  }, [triggerAutoSave]);

  const reorderWorkExperience = useCallback((items: WorkExperienceItem[]) => {
    setData((prev) => {
      const next = {
        ...prev,
        workExperience: items,
        updatedAt: new Date().toISOString(),
      };
      triggerAutoSave(next);
      return next;
    });
  }, [triggerAutoSave]);

  // Education Handlers
  const addEducation = useCallback((item: EducationItem) => {
    setData((prev) => {
      const next = {
        ...prev,
        education: [...prev.education, item],
        updatedAt: new Date().toISOString(),
      };
      triggerAutoSave(next);
      return next;
    });
  }, [triggerAutoSave]);

  const updateEducation = useCallback((id: string, updated: Partial<EducationItem>) => {
    setData((prev) => {
      const next = {
        ...prev,
        education: prev.education.map((edu) =>
          edu.id === id ? { ...edu, ...updated } : edu
        ),
        updatedAt: new Date().toISOString(),
      };
      triggerAutoSave(next);
      return next;
    });
  }, [triggerAutoSave]);

  const removeEducation = useCallback((id: string) => {
    setData((prev) => {
      const next = {
        ...prev,
        education: prev.education.filter((edu) => edu.id !== id),
        updatedAt: new Date().toISOString(),
      };
      triggerAutoSave(next);
      return next;
    });
  }, [triggerAutoSave]);

  // Skills Handlers
  const updateSkills = useCallback((categories: SkillCategory[]) => {
    setData((prev) => {
      const next = {
        ...prev,
        skills: categories,
        updatedAt: new Date().toISOString(),
      };
      triggerAutoSave(next);
      return next;
    });
  }, [triggerAutoSave]);

  // Projects Handlers
  const updateProjects = useCallback((projects: ProjectItem[]) => {
    setData((prev) => {
      const next = {
        ...prev,
        projects,
        updatedAt: new Date().toISOString(),
      };
      triggerAutoSave(next);
      return next;
    });
  }, [triggerAutoSave]);

  // Certifications Handlers
  const updateCertifications = useCallback((certs: CertificationItem[]) => {
    setData((prev) => {
      const next = {
        ...prev,
        certifications: certs,
        updatedAt: new Date().toISOString(),
      };
      triggerAutoSave(next);
      return next;
    });
  }, [triggerAutoSave]);

  // Languages Handlers
  const updateLanguages = useCallback((langs: LanguageItem[]) => {
    setData((prev) => {
      const next = {
        ...prev,
        languages: langs,
        updatedAt: new Date().toISOString(),
      };
      triggerAutoSave(next);
      return next;
    });
  }, [triggerAutoSave]);

  // Section Reordering
  const reorderSections = useCallback((newOrder: (SectionType | string)[]) => {
    setData((prev) => {
      const next = {
        ...prev,
        sectionOrder: newOrder as SectionType[],
        updatedAt: new Date().toISOString(),
      };
      triggerAutoSave(next);
      return next;
    });
  }, [triggerAutoSave]);

  // Toggle Section Visibility
  const toggleSectionVisibility = useCallback((sectionKey: string) => {
    setData((prev) => {
      const currentHidden = prev.hiddenSections || [];
      const isHidden = currentHidden.includes(sectionKey);
      const newHidden = isHidden
        ? currentHidden.filter((k) => k !== sectionKey)
        : [...currentHidden, sectionKey];

      const next = {
        ...prev,
        hiddenSections: newHidden,
        updatedAt: new Date().toISOString(),
      };
      triggerAutoSave(next);
      return next;
    });
  }, [triggerAutoSave]);

  // Rename Section Title
  const renameSectionTitle = useCallback((sectionKey: string, newTitle: string) => {
    setData((prev) => {
      const next = {
        ...prev,
        customTitles: {
          ...(prev.customTitles || {}),
          [sectionKey]: newTitle,
        },
        updatedAt: new Date().toISOString(),
      };
      triggerAutoSave(next);
      return next;
    });
  }, [triggerAutoSave]);

  // Custom User Section Handlers
  const addCustomSection = useCallback((title: string) => {
    setData((prev) => {
      const customId = "csec_" + generateId();
      const newCustomSec: CustomSectionEntry = {
        id: customId,
        sectionTitle: title,
        items: [
          {
            id: "citem_" + generateId(),
            title: "Title / Organization",
            subtitle: "Role / Detail",
            date: "2024",
            description: "Custom section entry details...",
          },
        ],
      };

      const next = {
        ...prev,
        customSections: [...(prev.customSections || []), newCustomSec],
        sectionOrder: [...prev.sectionOrder, customId as any],
        updatedAt: new Date().toISOString(),
      };
      triggerAutoSave(next);
      return next;
    });
  }, [triggerAutoSave]);

  const removeCustomSection = useCallback((customId: string) => {
    setData((prev) => {
      const next = {
        ...prev,
        customSections: (prev.customSections || []).filter((s) => s.id !== customId),
        sectionOrder: prev.sectionOrder.filter((s) => (s as string) !== customId),
        updatedAt: new Date().toISOString(),
      };
      triggerAutoSave(next);
      return next;
    });
  }, [triggerAutoSave]);

  const updateCustomSection = useCallback((customId: string, updated: Partial<CustomSectionEntry>) => {
    setData((prev) => {
      const next = {
        ...prev,
        customSections: (prev.customSections || []).map((s) =>
          s.id === customId ? { ...s, ...updated } : s
        ),
        updatedAt: new Date().toISOString(),
      };
      triggerAutoSave(next);
      return next;
    });
  }, [triggerAutoSave]);

  return {
    data,
    setData,
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
    manualSave: () => triggerAutoSave(latestDataRef.current),
  };
}
