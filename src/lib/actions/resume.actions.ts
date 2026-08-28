"use server";

import { db, isDbConfigured } from "@/db";
import { resumes, resumeSections, sharedLinks } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { ResumeData, TemplateId } from "@/lib/types/resume";
import { revalidatePath } from "next/cache";
import { BRAND } from "@/lib/brand";
import { auth } from "@clerk/nextjs/server";

const MAX_RESUMES = BRAND.maxResumesPerUser;

export async function saveResumeAction(data: ResumeData): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isDbConfigured || !db) {
      // In offline/demo mode, return success so client stores locally
      return { success: true };
    }

    // 1. Update resume metadata
    await db
      .update(resumes)
      .set({
        title: data.title,
        templateId: data.templateId,
        themeColor: data.themeColor,
        fontFamily: data.fontFamily,
        updatedAt: new Date(),
      })
      .where(eq(resumes.id, data.id));

    // 2. Clear and re-insert sections or upsert
    await db.delete(resumeSections).where(eq(resumeSections.resumeId, data.id));

    const sectionsToInsert = [
      {
        resumeId: data.id,
        type: "personal_info",
        order: 0,
        content: data.personalInfo,
      },
      {
        resumeId: data.id,
        type: "summary",
        order: 1,
        content: { text: data.summary },
      },
      {
        resumeId: data.id,
        type: "work_experience",
        order: 2,
        content: { items: data.workExperience },
      },
      {
        resumeId: data.id,
        type: "skills",
        order: 3,
        content: { categories: data.skills },
      },
      {
        resumeId: data.id,
        type: "education",
        order: 4,
        content: { items: data.education },
      },
      {
        resumeId: data.id,
        type: "projects",
        order: 5,
        content: { items: data.projects },
      },
      {
        resumeId: data.id,
        type: "certifications",
        order: 6,
        content: { items: data.certifications },
      },
      {
        resumeId: data.id,
        type: "languages",
        order: 7,
        content: { items: data.languages },
      },
    ];

    for (const s of sectionsToInsert) {
      await db.insert(resumeSections).values(s);
    }

    revalidatePath(`/builder/${data.id}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error: any) {
    console.error("Save Resume Action Error:", error);
    return { success: false, error: error.message || "Failed to save resume" };
  }
}

export async function createResumeAction(
  userId: string,
  title: string = "Untitled Resume",
  templateId: TemplateId = "modern"
): Promise<{ success: boolean; resume?: ResumeData; error?: string }> {
  try {
    let ownerId = userId;
    try {
      const session = await auth();
      if (session.userId) ownerId = session.userId;
    } catch {
      // Clerk may be inactive in demo mode
    }

    if (isDbConfigured && db) {
      const [countRow] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(resumes)
        .where(eq(resumes.userId, ownerId));

      if ((countRow?.count ?? 0) >= MAX_RESUMES) {
        return {
          success: false,
          error: `Resume limit reached. You can create up to ${MAX_RESUMES} resumes per account.`,
        };
      }

      const [created] = await db
        .insert(resumes)
        .values({
          userId: ownerId,
          title,
          templateId,
          themeColor: "#0d9488",
          fontFamily: "Outfit",
        })
        .returning();

      await db.insert(resumeSections).values({
        resumeId: created.id,
        type: "personal_info",
        order: 0,
        content: {
          fullName: "Your Name",
          jobTitle: "Software Engineer",
          email: "you@example.com",
          phone: "+1 (555) 000-0000",
          location: "San Francisco, CA",
        },
      });

      revalidatePath("/dashboard");
      return {
        success: true,
        resume: {
          id: created.id,
          userId: created.userId,
          title: created.title,
          templateId: created.templateId as TemplateId,
          themeColor: created.themeColor,
          fontFamily: created.fontFamily,
          createdAt: created.createdAt.toISOString(),
          updatedAt: created.updatedAt.toISOString(),
          personalInfo: {
            fullName: "Your Name",
            jobTitle: "Software Engineer",
            email: "you@example.com",
            phone: "+1 (555) 000-0000",
            location: "San Francisco, CA",
          },
          summary: "",
          workExperience: [],
          education: [],
          skills: [],
          projects: [],
          certifications: [],
          languages: [],
          sectionOrder: ["personal_info", "summary", "work_experience", "skills", "education", "projects"],
        },
      };
    }

    // Offline / demo mode — client still enforces the 3-resume cap
    const mockId = "res_" + Math.random().toString(36).substring(2, 9);
    const newResume: ResumeData = {
      id: mockId,
      userId: ownerId,
      title,
      templateId,
      themeColor: "#0d9488",
      fontFamily: "Outfit",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      personalInfo: {
        fullName: "Your Name",
        jobTitle: "Software Engineer",
        email: "you@example.com",
        phone: "+1 (555) 000-0000",
        location: "San Francisco, CA",
      },
      summary: "Passionate engineer dedicated to building clean, impactful web applications.",
      workExperience: [],
      education: [],
      skills: [{ id: "cat_1", categoryName: "Core Technologies", skills: ["TypeScript", "React", "Next.js"] }],
      projects: [],
      certifications: [],
      languages: [],
      sectionOrder: ["personal_info", "summary", "work_experience", "skills", "education", "projects"],
    };
    return { success: true, resume: newResume };
  } catch (error: any) {
    console.error("Create Resume Error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteResumeAction(resumeId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (isDbConfigured && db) {
      await db.delete(resumes).where(eq(resumes.id, resumeId));
      revalidatePath("/dashboard");
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createShareableSlugAction(
  resumeId: string,
  customSlug?: string
): Promise<{ success: boolean; slug?: string; error?: string }> {
  try {
    const slug = (customSlug || `cv-${Math.random().toString(36).substring(2, 8)}`)
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-");

    if (isDbConfigured && db) {
      await db
        .insert(sharedLinks)
        .values({
          resumeId,
          slug,
          isPublic: true,
        })
        .onConflictDoUpdate({
          target: sharedLinks.resumeId,
          set: { slug, isPublic: true },
        });
    }

    return { success: true, slug };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
