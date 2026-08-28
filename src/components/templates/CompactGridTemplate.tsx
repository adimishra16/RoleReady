"use client";

import React from "react";
import { ResumeData } from "@/lib/types/resume";
import { formatDate } from "@/lib/utils";

interface TemplateProps {
  data: ResumeData;
  accentColor?: string;
}

export function CompactGridTemplate({ data, accentColor = "#059669" }: TemplateProps) {
  const {
    personalInfo,
    summary,
    workExperience,
    education,
    skills,
    projects,
    certifications,
    languages,
    customSections,
    customTitles,
    hiddenSections = [],
  } = data;

  const getTitle = (key: string, fallback: string) =>
    customTitles?.[key] || fallback;

  const isVisible = (secKey: string) => !hiddenSections.includes(secKey);

  return (
    <div
      className="a4-page p-7 text-slate-800 bg-white font-sans leading-tight text-[12px] mx-auto transition-all shadow-md print:shadow-none"
      style={{ fontFamily: data.fontFamily || "Inter, sans-serif" }}
    >
      {/* Header Banner */}
      <header className="flex justify-between items-end border-b-2 pb-4 mb-4" style={{ borderColor: accentColor }}>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
            {personalInfo.fullName || "Your Full Name"}
          </h1>
          <p className="text-xs font-bold uppercase tracking-wider mt-0.5" style={{ color: accentColor }}>
            {personalInfo.jobTitle || "Professional Title"}
          </p>
        </div>
        <div className="text-right text-[11px] text-slate-600 space-y-0.5">
          {personalInfo.email && <div>{personalInfo.email}</div>}
          {personalInfo.phone && <div>{personalInfo.phone}</div>}
          {personalInfo.location && <div>{personalInfo.location}</div>}
          {personalInfo.linkedin && <div>{personalInfo.linkedin}</div>}
        </div>
      </header>

      {/* Summary */}
      {isVisible("summary") && summary && (
        <section className="mb-4">
          <p className="text-slate-700 text-xs leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200">
            {summary}
          </p>
        </section>
      )}

      {/* Skills Bar */}
      {isVisible("skills") && skills && skills.length > 0 && (
        <section className="mb-4 bg-slate-100 p-2.5 rounded">
          <h2 className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: accentColor }}>
            {getTitle("skills", "CORE SKILLS & TECHNOLOGIES")}
          </h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            {skills.map((cat) => (
              <div key={cat.id}>
                <span className="font-bold text-slate-900">{cat.categoryName}: </span>
                <span className="text-slate-700">{cat.skills.join(", ")}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2-Column Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column: Work Experience */}
        <div>
          {isVisible("work_experience") && workExperience && workExperience.length > 0 && (
            <section className="mb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2.5 text-slate-900 flex justify-between items-center">
                <span>{getTitle("work_experience", "EXPERIENCE")}</span>
              </h2>
              <div className="space-y-3">
                {workExperience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline font-bold text-xs text-slate-900">
                      <span>{exp.jobTitle}</span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-600 mb-1">
                      {exp.company} • {exp.location}
                    </div>
                    <ul className="list-disc list-outside ml-3.5 space-y-0.5 text-[11px] text-slate-700">
                      {exp.bullets.map((b, idx) => (
                        <li key={idx}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Projects, Education, Certifications */}
        <div className="space-y-4">
          {/* Projects */}
          {isVisible("projects") && projects && projects.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2 text-slate-900">
                {getTitle("projects", "PROJECTS")}
              </h2>
              <div className="space-y-2">
                {projects.map((proj) => (
                  <div key={proj.id}>
                    <div className="flex justify-between font-bold text-xs text-slate-900">
                      <span>{proj.title}</span>
                      {proj.link && <span className="text-[10px] text-slate-500 font-normal">{proj.link}</span>}
                    </div>
                    <p className="text-[11px] text-slate-700">{proj.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {isVisible("education") && education && education.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2 text-slate-900">
                {getTitle("education", "EDUCATION")}
              </h2>
              <div className="space-y-2">
                {education.map((edu) => (
                  <div key={edu.id}>
                    <div className="font-bold text-xs text-slate-900">
                      {edu.degree} in {edu.fieldOfStudy}
                    </div>
                    <div className="text-[11px] text-slate-600">
                      {edu.institution}, {edu.location} ({formatDate(edu.startDate)} - {formatDate(edu.endDate)})
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          {isVisible("certifications") && certifications && certifications.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2 text-slate-900">
                {getTitle("certifications", "CERTIFICATIONS")}
              </h2>
              <div className="space-y-1 text-[11px]">
                {certifications.map((c) => (
                  <div key={c.id}>
                    <span className="font-bold text-slate-900">{c.name}</span> — {c.issuer} ({formatDate(c.issueDate)})
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Custom Sections */}
          {customSections?.map((customSec) =>
            isVisible(customSec.id) ? (
              <section key={customSec.id}>
                <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2 text-slate-900">
                  {customSec.sectionTitle}
                </h2>
                <div className="space-y-1.5 text-[11px]">
                  {customSec.items.map((item) => (
                    <div key={item.id}>
                      <div className="font-bold text-slate-900">{item.title}</div>
                      {item.description && <p className="text-slate-700">{item.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}
