export type TemplateId =
  | "modern"
  | "minimal"
  | "professional"
  | "creative"
  | "tech_mono"
  | "compact_grid"
  | "elegant_serif";

export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
  avatarUrl?: string;
}

export interface WorkExperienceItem {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  honors?: string[];
}

export interface SkillCategory {
  id: string;
  categoryName: string;
  skills: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  link?: string;
  github?: string;
  startDate?: string;
  endDate?: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialUrl?: string;
}

export interface LanguageItem {
  id: string;
  language: string;
  proficiency: "Native" | "Fluent" | "Proficient" | "Intermediate" | "Basic";
}

export interface CustomSectionEntry {
  id: string;
  sectionTitle: string;
  items: {
    id: string;
    title: string;
    subtitle?: string;
    date?: string;
    description?: string;
    bullets?: string[];
  }[];
}

export type SectionType =
  | "personal_info"
  | "summary"
  | "work_experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "languages"
  | "custom";

export interface ResumeSection<T = unknown> {
  id: string;
  resumeId: string;
  type: SectionType;
  order: number;
  content: T;
}

export interface ResumeData {
  id: string;
  userId: string;
  title: string;
  templateId: TemplateId;
  themeColor: string;
  fontFamily: string;
  createdAt: string;
  updatedAt: string;
  personalInfo: PersonalInfo;
  summary: string;
  workExperience: WorkExperienceItem[];
  education: EducationItem[];
  skills: SkillCategory[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  languages: LanguageItem[];
  customSections?: CustomSectionEntry[];
  customTitles?: Record<string, string>;
  hiddenSections?: string[];
  sectionOrder: SectionType[];
}

export interface JobMatchResult {
  matchScore: number;
  missingKeywords: string[];
  matchingKeywords: string[];
  recommendations: string[];
}

export interface PublicSharedResume {
  slug: string;
  isPublic: boolean;
  resume: ResumeData;
}
