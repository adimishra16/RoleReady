"use server";

import { isDbConfigured } from "@/lib/appwrite/db";
import {
  countUserResumes,
  createResume,
  createResumeSection,
  deleteResume,
  getResume,
  replaceResumeSections,
  updateResume,
  upsertSharedLink,
} from "@/lib/appwrite/db";
import { ResumeData, TemplateId } from "@/lib/types/resume";
import { revalidatePath } from "next/cache";
import { BRAND } from "@/lib/brand";
import { auth } from "@/lib/appwrite/auth";
import { createBlankResume } from "@/lib/resume/blank-resume";

const MAX_RESUMES = BRAND.maxResumesPerUser;

async function requireSignedInUserId(): Promise<
  { ok: true; userId: string } | { ok: false; error: string }
> {
  try {
    const session = await auth();
    if (session.userId) {
      return { ok: true, userId: session.userId };
    }
  } catch {
    // Auth unavailable
  }
  return { ok: false, error: "Sign in required" };
}

async function assertResumeOwnership(
  resumeId: string,
  userId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isDbConfigured()) {
    return { ok: false, error: "Database not configured" };
  }

  try {
    const row = await getResume(resumeId);
    if (!row) {
      return { ok: false, error: "Resume not found" };
    }
    if (row.userId !== userId) {
      return { ok: false, error: "Forbidden" };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Resume not found" };
  }
}

export async function saveResumeAction(
  data: ResumeData
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isDbConfigured()) {
      return { success: true };
    }

    const authResult = await requireSignedInUserId();
    if (!authResult.ok) {
      return { success: false, error: authResult.error };
    }

    const owned = await assertResumeOwnership(data.id, authResult.userId);
    if (!owned.ok) {
      return { success: false, error: owned.error };
    }

    await updateResume(data.id, {
      title: data.title,
      templateId: data.templateId,
      themeColor: data.themeColor,
      fontFamily: data.fontFamily,
    });

    await replaceResumeSections(data.id, [
      { type: "personal_info", order: 0, content: data.personalInfo },
      { type: "summary", order: 1, content: { text: data.summary } },
      { type: "work_experience", order: 2, content: { items: data.workExperience } },
      { type: "skills", order: 3, content: { categories: data.skills } },
      { type: "education", order: 4, content: { items: data.education } },
      { type: "projects", order: 5, content: { items: data.projects } },
      { type: "certifications", order: 6, content: { items: data.certifications } },
      { type: "languages", order: 7, content: { items: data.languages } },
    ]);

    revalidatePath(`/builder/${data.id}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error: any) {
    console.error("Save Resume Action Error:", error);
    return { success: false, error: "Failed to save resume" };
  }
}

export async function createResumeAction(
  _ignoredUserId: string,
  title: string = "Untitled Resume",
  templateId: TemplateId = "modern"
): Promise<{ success: boolean; resume?: ResumeData; error?: string }> {
  try {
    const authResult = await requireSignedInUserId();

    if (isDbConfigured()) {
      if (!authResult.ok) {
        return { success: false, error: authResult.error };
      }
      const ownerId = authResult.userId;

      const count = await countUserResumes(ownerId);
      if (count >= MAX_RESUMES) {
        return {
          success: false,
          error: `Resume limit reached. You can create up to ${MAX_RESUMES} resumes per account.`,
        };
      }

      const created = await createResume({
        userId: ownerId,
        title,
        templateId,
        themeColor: "#0d9488",
        fontFamily: "IBM Plex Sans",
      });

      await createResumeSection({
        resumeId: created.id,
        type: "personal_info",
        order: 0,
        content: {
          fullName: "",
          jobTitle: "",
          email: "",
          phone: "",
          location: "",
        },
      });

      revalidatePath("/dashboard");
      const blank = createBlankResume({
        id: created.id,
        userId: created.userId,
        title: created.title,
        templateId: created.templateId as TemplateId,
        themeColor: created.themeColor,
        fontFamily: created.fontFamily,
      });
      return {
        success: true,
        resume: {
          ...blank,
          createdAt: created.createdAt.toISOString(),
          updatedAt: created.updatedAt.toISOString(),
        },
      };
    }

    const ownerId = authResult.ok ? authResult.userId : "user_demo";
    const mockId = "res_" + Math.random().toString(36).substring(2, 9);
    const newResume = createBlankResume({
      id: mockId,
      userId: ownerId,
      title,
      templateId,
    });
    return { success: true, resume: newResume };
  } catch (error: any) {
    console.error("Create Resume Error:", error);
    return { success: false, error: "Failed to create resume" };
  }
}

export async function deleteResumeAction(
  resumeId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isDbConfigured()) {
      return { success: true };
    }

    const authResult = await requireSignedInUserId();
    if (!authResult.ok) {
      return { success: false, error: authResult.error };
    }

    const owned = await assertResumeOwnership(resumeId, authResult.userId);
    if (!owned.ok) {
      return { success: false, error: owned.error };
    }

    await deleteResume(resumeId);

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Delete Resume Error:", error);
    return { success: false, error: "Failed to delete resume" };
  }
}

export async function createShareableSlugAction(
  resumeId: string,
  customSlug?: string
): Promise<{ success: boolean; slug?: string; error?: string }> {
  try {
    if (!isDbConfigured()) {
      const slug = `cv-${Math.random().toString(36).substring(2, 8)}`;
      return { success: true, slug };
    }

    const authResult = await requireSignedInUserId();
    if (!authResult.ok) {
      return { success: false, error: authResult.error };
    }

    const owned = await assertResumeOwnership(resumeId, authResult.userId);
    if (!owned.ok) {
      return { success: false, error: owned.error };
    }

    const slug = (customSlug || `cv-${Math.random().toString(36).substring(2, 8)}`)
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80);

    if (!slug) {
      return { success: false, error: "Invalid slug" };
    }

    await upsertSharedLink(resumeId, slug);

    return { success: true, slug };
  } catch (error: any) {
    console.error("Share slug error:", error);
    return { success: false, error: "Failed to create share link" };
  }
}
