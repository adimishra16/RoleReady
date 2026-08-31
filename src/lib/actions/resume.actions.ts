"use server";

import { db, isDbConfigured } from "@/db";
import { resumes, resumeSections, sharedLinks } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { ResumeData, TemplateId } from "@/lib/types/resume";
import { revalidatePath } from "next/cache";
import { BRAND } from "@/lib/brand";
import { auth } from "@clerk/nextjs/server";
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
    // Clerk unavailable
  }
  return { ok: false, error: "Sign in required" };
}

async function assertResumeOwnership(
  resumeId: string,
  userId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!db) {
    return { ok: false, error: "Database not configured" };
  }

  // Neon resumes.id is UUID — reject non-UUID ids early (demo/local ids)
  const uuidRe =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRe.test(resumeId)) {
    return { ok: false, error: "Resume not found" };
  }

  try {
    const [row] = await db
      .select({ id: resumes.id, userId: resumes.userId })
      .from(resumes)
      .where(eq(resumes.id, resumeId))
      .limit(1);

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
    if (!isDbConfigured || !db) {
      // Offline/demo: localStorage only — no cloud mutation
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

    await db
      .update(resumes)
      .set({
        title: data.title,
        templateId: data.templateId,
        themeColor: data.themeColor,
        fontFamily: data.fontFamily,
        updatedAt: new Date(),
      })
      .where(and(eq(resumes.id, data.id), eq(resumes.userId, authResult.userId)));

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

    // Cloud DB: never trust client-supplied userId
    if (isDbConfigured && db) {
      if (!authResult.ok) {
        return { success: false, error: authResult.error };
      }
      const ownerId = authResult.userId;

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

    // Offline / demo (no DB): local mock only, still prefer signed-in id
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
    if (!isDbConfigured || !db) {
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

    await db
      .delete(resumes)
      .where(and(eq(resumes.id, resumeId), eq(resumes.userId, authResult.userId)));

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
    if (!isDbConfigured || !db) {
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

    return { success: true, slug };
  } catch (error: any) {
    console.error("Share slug error:", error);
    return { success: false, error: "Failed to create share link" };
  }
}
