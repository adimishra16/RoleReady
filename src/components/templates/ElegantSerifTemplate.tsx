"use client";

import React from "react";
import { ResumeData } from "@/lib/types/resume";
import { formatDate } from "@/lib/utils";

interface TemplateProps {
  data: ResumeData;
  accentColor?: string;
}

export function ElegantSerifTemplate({ data, accentColor = "#881337" }: TemplateProps) {
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
      className="a4-page p-10 text-slate-900 bg-white font-serif leading-relaxed text-[13px] mx-auto transition-all shadow-md print:shadow-none"
      style={{ fontFamily: data.fontFamily || "Georgia, serif" }}
    >
      {/* Header Banner - Luxury Editorial Style */}
      <header className="text-center pb-6 mb-6 border-b border-double border-slate-400">
        <h1
          className="text-3xl font-normal tracking-wide text-slate-950 uppercase mb-1"
          style={{ color: accentColor }}
        >
          {personalInfo.fullName || "Your Full Name"}
        </h1>
        <div className="h-0.5 w-16 mx-auto mb-2" style={{ backgroundColor: accentColor }} />
        <p className="text-xs uppercase tracking-widest text-slate-600 font-sans font-semibold">
          {personalInfo.jobTitle || "Executive Candidate"}
        </p>

        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 mt-3 text-xs text-slate-600 font-sans italic">
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.email && <span>• {personalInfo.email}</span>}
          {personalInfo.phone && <span>• {personalInfo.phone}</span>}
          {personalInfo.linkedin && <span>• {personalInfo.linkedin}</span>}
        </div>
      </header>

      {/* Summary */}
      {isVisible("summary") && summary && (
        <section className="mb-6">
          <h2
            className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-2 font-sans text-center"
            style={{ color: accentColor }}
          >
            — {getTitle("summary", "PROFILE SUMMARY")} —
          </h2>
          <p className="text-slate-800 text-xs leading-relaxed italic text-center max-w-2xl mx-auto">
            "{summary}"
          </p>
        </section>
      )}

      {/* Work Experience */}
      {isVisible("work_experience") && workExperience && workExperience.length > 0 && (
        <section className="mb-6">
          <h2
            className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-3 font-sans border-b border-slate-300 pb-1"
            style={{ color: accentColor }}
          >
            {getTitle("work_experience", "PROFESSIONAL EXPERIENCE")}
          </h2>
          <div className="space-y-4">
            {workExperience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-slate-950 text-xs uppercase tracking-wide">
                    {exp.jobTitle}
                  </h3>
                  <span className="text-[11px] text-slate-500 font-sans italic">
                    {formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}
                  </span>
                </div>
                <div className="text-xs text-slate-700 italic mb-1.5 font-sans flex justify-between">
                  <span>{exp.company}</span>
                  <span>{exp.location}</span>
                </div>
                <ul className="list-disc list-outside ml-4 space-y-1 text-xs text-slate-800 font-sans">
                  {exp.bullets.map((b, idx) => (
                    <li key={idx}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {isVisible("skills") && skills && skills.length > 0 && (
        <section className="mb-6 font-sans">
          <h2
            className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-2 border-b border-slate-300 pb-1"
            style={{ color: accentColor }}
          >
            {getTitle("skills", "SKILLS & AREAS OF EXPERTISE")}
          </h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
            {skills.map((cat) => (
              <div key={cat.id}>
                <span className="font-bold text-slate-900">{cat.categoryName}: </span>
                <span className="text-slate-700">{cat.skills.join(", ")}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {isVisible("projects") && projects && projects.length > 0 && (
        <section className="mb-6 font-sans">
          <h2
            className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-2 border-b border-slate-300 pb-1"
            style={{ color: accentColor }}
          >
            {getTitle("projects", "NOTABLE PROJECTS")}
          </h2>
          <div className="space-y-2.5">
            {projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-950 text-xs">{proj.title}</span>
                  {proj.link && <span className="text-[11px] text-slate-500 italic">{proj.link}</span>}
                </div>
                <p className="text-xs text-slate-700 mt-0.5 font-serif">{proj.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {isVisible("education") && education && education.length > 0 && (
        <section className="mb-5 font-sans">
          <h2
            className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-2 border-b border-slate-300 pb-1"
            style={{ color: accentColor }}
          >
            {getTitle("education", "EDUCATION & ACADEMICS")}
          </h2>
          <div className="space-y-2">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline text-xs">
                <div>
                  <span className="font-bold text-slate-950">{edu.degree} in {edu.fieldOfStudy}</span>
                  <div className="text-slate-600 italic">{edu.institution}, {edu.location}</div>
                </div>
                <span className="text-[11px] text-slate-500 italic">
                  {formatDate(edu.startDate)} – {formatDate(edu.endDate)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Custom Sections */}
      {customSections?.map((customSec) =>
        isVisible(customSec.id) ? (
          <section key={customSec.id} className="mb-5 font-sans">
            <h2
              className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-2 border-b border-slate-300 pb-1"
              style={{ color: accentColor }}
            >
              {customSec.sectionTitle.toUpperCase()}
            </h2>
            <div className="space-y-2 text-xs">
              {customSec.items.map((item) => (
                <div key={item.id}>
                  <div className="flex justify-between font-bold text-slate-950">
                    <span>{item.title}</span>
                    {item.date && <span className="text-[11px] text-slate-500 italic">{item.date}</span>}
                  </div>
                  {item.description && <p className="text-slate-700 font-serif">{item.description}</p>}
                </div>
              ))}
            </div>
          </section>
        ) : null
      )}
    </div>
  );
}
