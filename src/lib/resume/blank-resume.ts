import type { ResumeData, TemplateId } from "@/lib/types/resume";

/** Empty resume shell — user fills content after picking a template. */
export function createBlankResume(overrides: {
  id: string;
  userId?: string;
  title?: string;
  templateId?: TemplateId;
  themeColor?: string;
  fontFamily?: string;
}): ResumeData {
  const now = new Date().toISOString();
  return {
    id: overrides.id,
    userId: overrides.userId || "user_demo",
    title: overrides.title || "Untitled Resume",
    templateId: overrides.templateId || "modern",
    themeColor: overrides.themeColor || "#0d9488",
    fontFamily: overrides.fontFamily || "IBM Plex Sans, sans-serif",
    createdAt: now,
    updatedAt: now,
    personalInfo: {
      fullName: "",
      jobTitle: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      linkedin: "",
      github: "",
    },
    summary: "",
    workExperience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
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
}
