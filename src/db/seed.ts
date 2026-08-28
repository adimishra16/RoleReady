import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is required to run seed script.");
    process.exit(1);
  }

  const sql = neon(connectionString);
  const db = drizzle(sql, { schema });

  console.log("Seeding demo user and resume data...");

  const demoUser = {
    id: "user_demo_12345",
    email: "alex.morgan@example.com",
    name: "Alex Morgan",
    targetJobTitle: "Senior Full Stack Engineer",
    industry: "Software Engineering & AI",
  };

  await db
    .insert(schema.users)
    .values({
      ...demoUser,
      aiEnabled: false,
      aiRewriteLimit: 15,
      aiRewriteUsed: 0,
      aiOtherLimit: 10,
      aiOtherUsed: 0,
    })
    .onConflictDoUpdate({
      target: schema.users.id,
      set: { updatedAt: new Date() },
    });

  await db
    .insert(schema.appSettings)
    .values({
      key: "ai_globally_enabled",
      value: "false",
    })
    .onConflictDoUpdate({
      target: schema.appSettings.key,
      set: { value: "false", updatedAt: new Date() },
    });

  const [resume] = await db
    .insert(schema.resumes)
    .values({
      userId: demoUser.id,
      title: "Senior Full Stack Engineer (AI-Focus)",
      templateId: "modern",
      themeColor: "#2563eb",
      fontFamily: "Inter",
    })
    .returning();

  console.log("Created demo resume:", resume.id);

  // Sections
  const sections = [
    {
      resumeId: resume.id,
      type: "personal_info",
      order: 0,
      content: {
        fullName: "Alex Morgan",
        jobTitle: "Senior Full Stack Engineer",
        email: "alex.morgan@example.com",
        phone: "+1 (555) 234-5678",
        location: "San Francisco, CA",
        website: "https://alexmorgan.dev",
        linkedin: "https://linkedin.com/in/alexmorgan-dev",
        github: "https://github.com/alexmorgan",
      },
    },
    {
      resumeId: resume.id,
      type: "summary",
      order: 1,
      content: {
        text: "Impact-driven Senior Full Stack Engineer with 6+ years of experience architecting distributed cloud applications and high-throughput AI interfaces. Proven track record reducing latency by 45% and leading cross-functional teams to deliver enterprise-grade SaaS platforms.",
      },
    },
    {
      resumeId: resume.id,
      type: "work_experience",
      order: 2,
      content: {
        items: [
          {
            id: "exp_1",
            jobTitle: "Lead Full Stack Engineer",
            company: "Nexus AI Technologies",
            location: "San Francisco, CA",
            startDate: "2022-03",
            endDate: "",
            current: true,
            bullets: [
              "Spearheaded the architecture of an AI-driven workflow engine using Next.js, Node.js, and Postgres, serving 250,000+ daily active users.",
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
      },
    },
    {
      resumeId: resume.id,
      type: "skills",
      order: 3,
      content: {
        categories: [
          {
            id: "cat_1",
            categoryName: "Languages & Frameworks",
            skills: ["TypeScript", "JavaScript", "React", "Next.js", "Node.js", "Python", "Go", "Tailwind CSS"],
          },
          {
            id: "cat_2",
            categoryName: "Backend & Databases",
            skills: ["PostgreSQL", "Neon", "Drizzle ORM", "Redis", "GraphQL", "REST APIs", "Prisma"],
          },
          {
            id: "cat_3",
            categoryName: "AI & Cloud Tools",
            skills: ["Vercel AI SDK", "OpenAI API", "AWS", "Docker", "Git", "CI/CD", "Turborepo"],
          },
        ],
      },
    },
    {
      resumeId: resume.id,
      type: "education",
      order: 4,
      content: {
        items: [
          {
            id: "edu_1",
            institution: "University of California, Berkeley",
            degree: "Bachelor of Science",
            fieldOfStudy: "Computer Science",
            location: "Berkeley, CA",
            startDate: "2015-08",
            endDate: "2019-05",
            gpa: "3.85 / 4.0",
            honors: ["Dean's Honors List", "Upsilon Pi Epsilon Honor Society"],
          },
        ],
      },
    },
    {
      resumeId: resume.id,
      type: "projects",
      order: 5,
      content: {
        items: [
          {
            id: "proj_1",
            title: "PulseFlow AI Copilot",
            description: "Open-source developer assistant that automates code review summaries and pull request insights using local LLMs.",
            technologies: ["Next.js 15", "TypeScript", "LangChain", "Tailwind CSS"],
            link: "https://pulseflow.dev",
            github: "https://github.com/alexmorgan/pulseflow",
          },
        ],
      },
    },
  ];

  for (const s of sections) {
    await db.insert(schema.resumeSections).values(s);
  }

  // Shared link
  await db.insert(schema.sharedLinks).values({
    resumeId: resume.id,
    slug: "alex-morgan-lead-engineer",
    isPublic: true,
  });

  console.log("Seeding completed successfully!");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
