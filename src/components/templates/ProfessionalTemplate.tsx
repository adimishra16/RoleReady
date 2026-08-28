"use client";

import React from "react";
import { ResumeData } from "@/lib/types/resume";
import { formatDate } from "@/lib/utils";

interface TemplateProps {
  data: ResumeData;
  accentColor?: string;
}

export function ProfessionalTemplate({ data, accentColor = "#1e293b" }: TemplateProps) {
  const {
    personalInfo,
    summary,
    workExperience,
    education,
    skills,
    projects,
    certifications,
    languages,
  } = data;

  return (
    <div
      className="a4-page p-9 text-slate-800 bg-white font-serif leading-relaxed text-[13px] mx-auto transition-all shadow-md print:shadow-none"
      style={{ fontFamily: data.fontFamily || "Georgia, serif" }}
    >
      {/* Header Banner */}
      <header className="text-center pb-5 mb-5 border-b-2 border-slate-900">
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 uppercase mb-1">
          {personalInfo.fullName || "Your Full Name"}
        </h1>
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest mb-2.5">
          {personalInfo.jobTitle || "Executive / Technical Leader"}
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-xs text-slate-600 font-sans">
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.linkedin && (
            <a href={personalInfo.linkedin} className="underline">
              LinkedIn
            </a>
          )}
          {personalInfo.website && (
            <a href={personalInfo.website} className="underline">
              Portfolio
            </a>
          )}
        </div>
      </header>

      {/* Executive Summary */}
      {summary && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-1.5 font-sans border-b border-slate-300 pb-0.5">
            Executive Summary
          </h2>
          <p className="text-slate-800 text-xs leading-relaxed italic">{summary}</p>
        </section>
      )}

      {/* Core Competencies / Skills */}
      {skills && skills.length > 0 && (
        <section className="mb-5 font-sans">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-2 border-b border-slate-300 pb-0.5">
            Core Competencies
          </h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            {skills.map((cat) => (
              <div key={cat.id} className="flex">
                <span className="font-semibold text-slate-900 mr-1">{cat.categoryName}:</span>
                <span className="text-slate-700">{cat.skills.join(", ")}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Professional Experience */}
      {workExperience && workExperience.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-3 font-sans border-b border-slate-300 pb-0.5">
            Professional Experience
          </h2>
          <div className="space-y-4">
            {workExperience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-slate-900 text-xs">{exp.jobTitle}</h3>
                  <span className="text-[11px] text-slate-500 font-sans">
                    {formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-xs text-slate-700 font-sans italic mb-1.5">
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

      {/* Projects */}
      {projects && projects.length > 0 && (
        <section className="mb-5 font-sans">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-2 border-b border-slate-300 pb-0.5">
            Key Initiatives & Projects
          </h2>
          <div className="space-y-2">
            {projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-slate-900 text-xs">{proj.title}</span>
                  {proj.technologies && (
                    <span className="text-[11px] text-slate-500">{proj.technologies.join(", ")}</span>
                  )}
                </div>
                <p className="text-xs text-slate-700 mt-0.5">{proj.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-2 font-sans border-b border-slate-300 pb-0.5">
            Education & Credentials
          </h2>
          <div className="space-y-2">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline text-xs">
                <div>
                  <span className="font-bold text-slate-900">{edu.degree} in {edu.fieldOfStudy}</span>
                  <div className="text-slate-600 font-sans">{edu.institution}, {edu.location}</div>
                </div>
                <span className="text-[11px] text-slate-500 font-sans">
                  {formatDate(edu.startDate)} – {formatDate(edu.endDate)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
