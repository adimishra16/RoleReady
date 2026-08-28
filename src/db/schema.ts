import {
  pgTable,
  text,
  varchar,
  timestamp,
  uuid,
  integer,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(), // Clerk User ID
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  targetJobTitle: varchar("target_job_title", { length: 255 }),
  industry: varchar("industry", { length: 255 }),
  /** Toggle in Neon SQL: UPDATE users SET ai_enabled = true WHERE email = '...'; */
  aiEnabled: boolean("ai_enabled").notNull().default(false),
  /** Max AI bullet rewrites allowed for this user */
  aiRewriteLimit: integer("ai_rewrite_limit").notNull().default(15),
  /** How many rewrites this user has already used */
  aiRewriteUsed: integer("ai_rewrite_used").notNull().default(0),
  /** Shared pool for summary / cover letter / job match */
  aiOtherLimit: integer("ai_other_limit").notNull().default(10),
  aiOtherUsed: integer("ai_other_used").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/** Global toggles editable in Neon (e.g. ai_globally_enabled = false) */
export const appSettings = pgTable("app_settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const resumes = pgTable("resumes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id", { length: 255 })
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 255 }).notNull().default("Untitled Resume"),
  templateId: varchar("template_id", { length: 50 }).notNull().default("modern"),
  themeColor: varchar("theme_color", { length: 50 }).notNull().default("#0d9488"),
  fontFamily: varchar("font_family", { length: 50 }).notNull().default("Outfit"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const resumeSections = pgTable("resume_sections", {
  id: uuid("id").defaultRandom().primaryKey(),
  resumeId: uuid("resume_id")
    .references(() => resumes.id, { onDelete: "cascade" })
    .notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'personal_info', 'work_experience', 'education', 'skills', etc.
  order: integer("order").notNull().default(0),
  content: jsonb("content").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const jobMatches = pgTable("job_matches", {
  id: uuid("id").defaultRandom().primaryKey(),
  resumeId: uuid("resume_id")
    .references(() => resumes.id, { onDelete: "cascade" })
    .notNull(),
  jobDescription: text("job_description").notNull(),
  matchScore: integer("match_score").notNull().default(0),
  missingKeywords: jsonb("missing_keywords").notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sharedLinks = pgTable("shared_links", {
  id: uuid("id").defaultRandom().primaryKey(),
  resumeId: uuid("resume_id")
    .references(() => resumes.id, { onDelete: "cascade" })
    .notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  isPublic: boolean("is_public").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  resumes: many(resumes),
}));

export const resumesRelations = relations(resumes, ({ one, many }) => ({
  user: one(users, {
    fields: [resumes.userId],
    references: [users.id],
  }),
  sections: many(resumeSections),
  jobMatches: many(jobMatches),
  sharedLinks: many(sharedLinks),
}));

export const resumeSectionsRelations = relations(resumeSections, ({ one }) => ({
  resume: one(resumes, {
    fields: [resumeSections.resumeId],
    references: [resumes.id],
  }),
}));

export const jobMatchesRelations = relations(jobMatches, ({ one }) => ({
  resume: one(resumes, {
    fields: [jobMatches.resumeId],
    references: [resumes.id],
  }),
}));

export const sharedLinksRelations = relations(sharedLinks, ({ one }) => ({
  resume: one(resumes, {
    fields: [sharedLinks.resumeId],
    references: [resumes.id],
  }),
}));
