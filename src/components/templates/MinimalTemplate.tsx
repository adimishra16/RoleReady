"use client";

import React from "react";
import { ResumeData } from "@/lib/types/resume";
import { formatDate } from "@/lib/utils";

interface TemplateProps {
  data: ResumeData;
  accentColor?: string;
}

export function MinimalTemplate({ data, accentColor = "#0f172a" }: TemplateProps) {
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
      className="a4-page p-10 text-slate-900 bg-white font-sans leading-normal text-[12.5px] mx-auto transition-all shadow-md print:shadow-none"
      style={{ fontFamily: data.fontFamily || "Inter, sans-serif" }}
    >
      {/* Header - Centered ATS Standard */}
      <header className="text-center border-b pb-4 mb-5">
        <h1 className="text-2xl font-bold uppercase tracking-wide text-slate-900">
          {personalInfo.fullName || "Your Full Name"}
        </h1>
        <p className="text-sm font-semibold text-slate-600 mt-0.5">
          {personalInfo.jobTitle || "Target Job Title"}
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 mt-2 text-xs text-slate-600">
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.email && (
            <>
              <span>•</span>
              <span>{personalInfo.email}</span>
            </>
          )}
          {personalInfo.phone && (
            <>
              <span>•</span>
              <span>{personalInfo.phone}</span>
            </>
          )}
          {personalInfo.linkedin && (
            <>
              <span>•</span>
              <span>{personalInfo.linkedin}</span>
            </>
          )}
          {personalInfo.github && (
            <>
              <span>•</span>
              <span>{personalInfo.github}</span>
            </>
          )}
          {personalInfo.website && (
            <>
              <span>•</span>
              <span>{personalInfo.website}</span>
            </>
          )}
        </div>
      </header>

      {/* Summary */}
      {summary && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 text-slate-900">
            Professional Summary
          </h2>
          <p className="text-slate-800 leading-relaxed text-xs">{summary}</p>
        </section>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 text-slate-900">
            Technical Skills
          </h2>
          <div className="space-y-1 text-xs">
            {skills.map((cat) => (
              <p key={cat.id}>
                <strong className="font-semibold text-slate-900">{cat.categoryName}: </strong>
                <span className="text-slate-700">{cat.skills.join(", ")}</span>
              </p>
            ))}
          </div>
        </section>
      )}

      {/* Work Experience */}
      {workExperience && workExperience.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-2.5 text-slate-900">
            Professional Experience
          </h2>
          <div className="space-y-3.5">
            {workExperience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <div className="font-bold text-slate-900 text-xs">
                    {exp.jobTitle} — <span className="font-normal italic text-slate-700">{exp.company}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium">
                    {formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)} | {exp.location}
                  </div>
                </div>
                <ul className="list-disc list-outside ml-4 mt-1 space-y-1 text-xs text-slate-700">
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
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 text-slate-900">
            Projects
          </h2>
          <div className="space-y-2">
            {projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex justify-between items-baseline">
                  <div className="font-semibold text-slate-900 text-xs">
                    {proj.title} {proj.technologies?.length ? `| ${proj.technologies.join(", ")}` : ""}
                  </div>
                  {proj.link && (
                    <span className="text-[11px] text-slate-600">{proj.link}</span>
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
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 text-slate-900">
            Education
          </h2>
          <div className="space-y-2">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline">
                <div>
                  <span className="font-bold text-slate-900 text-xs">{edu.institution}</span>, {edu.location}
                  <div className="text-slate-700 text-xs">
                    {edu.degree} in {edu.fieldOfStudy} {edu.gpa ? `(GPA: ${edu.gpa})` : ""}
                  </div>
                </div>
                <div className="text-[11px] text-slate-600">
                  {formatDate(edu.startDate)} – {formatDate(edu.endDate)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications & Languages */}
      {((certifications && certifications.length > 0) || (languages && languages.length > 0)) && (
        <section className="mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 text-slate-900">
            Additional Information
          </h2>
          <div className="space-y-1 text-xs">
            {certifications && certifications.length > 0 && (
              <p>
                <strong className="font-semibold text-slate-900">Certifications: </strong>
                <span className="text-slate-700">
                  {certifications.map((c) => `${c.name} (${c.issuer}, ${formatDate(c.issueDate)})`).join("; ")}
                </span>
              </p>
            )}
            {languages && languages.length > 0 && (
              <p>
                <strong className="font-semibold text-slate-900">Languages: </strong>
                <span className="text-slate-700">
                  {languages.map((l) => `${l.language} (${l.proficiency})`).join(", ")}
                </span>
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
