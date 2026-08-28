"use client";

import React from "react";
import { ResumeData } from "@/lib/types/resume";
import { formatDate } from "@/lib/utils";
import { Terminal, Code2, Globe, Mail, Phone, MapPin, Linkedin, Github } from "lucide-react";

interface TemplateProps {
  data: ResumeData;
  accentColor?: string;
}

export function TechMonoTemplate({ data, accentColor = "#0284c7" }: TemplateProps) {
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
      className="a4-page p-8 text-slate-900 bg-white font-mono leading-relaxed text-[12px] mx-auto transition-all shadow-md print:shadow-none"
      style={{ fontFamily: data.fontFamily || "'Courier New', Courier, monospace" }}
    >
      {/* Header Block - Terminal Style */}
      <header className="border-2 border-slate-900 rounded-lg p-5 mb-5 bg-slate-50">
        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-400 border-b border-slate-200 pb-2">
          <Terminal className="w-4 h-4 text-slate-700" />
          <span>~/developer-profile/{personalInfo.fullName?.toLowerCase().replace(/\s+/g, "-") || "resume"}.sh</span>
        </div>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950" style={{ color: accentColor }}>
              {personalInfo.fullName || "Your Full Name"}
            </h1>
            <p className="text-xs font-semibold text-slate-700 mt-1">
              $ role: <span className="font-normal">{personalInfo.jobTitle || "Software Engineer"}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-[11px] text-slate-700 border-t border-slate-200 pt-2.5">
          {personalInfo.email && (
            <span>email: <span className="text-slate-900 font-semibold">{personalInfo.email}</span></span>
          )}
          {personalInfo.phone && (
            <span>phone: <span className="text-slate-900 font-semibold">{personalInfo.phone}</span></span>
          )}
          {personalInfo.location && (
            <span>location: <span className="text-slate-900 font-semibold">{personalInfo.location}</span></span>
          )}
          {personalInfo.github && (
            <span>github: <a href={personalInfo.github} className="underline text-slate-900">{personalInfo.github.replace(/^https?:\/\/(www\.)?github\.com\//, "")}</a></span>
          )}
          {personalInfo.linkedin && (
            <span>linkedin: <a href={personalInfo.linkedin} className="underline text-slate-900">in/{personalInfo.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "")}</a></span>
          )}
        </div>
      </header>

      {/* Summary */}
      {isVisible("summary") && summary && (
        <section className="mb-5">
          <h2
            className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5"
            style={{ color: accentColor }}
          >
            <span>// {getTitle("summary", "SUMMARY")}</span>
            <div className="flex-1 border-b border-dashed border-slate-300" />
          </h2>
          <p className="text-slate-800 leading-normal text-[11.5px] bg-slate-50 p-3 rounded border border-slate-200">
            {summary}
          </p>
        </section>
      )}

      {/* Skills */}
      {isVisible("skills") && skills && skills.length > 0 && (
        <section className="mb-5">
          <h2
            className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5"
            style={{ color: accentColor }}
          >
            <span>// {getTitle("skills", "TECHNICAL_STACK")}</span>
            <div className="flex-1 border-b border-dashed border-slate-300" />
          </h2>
          <div className="space-y-1.5 text-[11.5px]">
            {skills.map((cat) => (
              <div key={cat.id} className="flex flex-wrap items-baseline gap-1">
                <span className="font-bold text-slate-950">{cat.categoryName}:</span>
                <span className="text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  [{cat.skills.join(", ")}]
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Work Experience */}
      {isVisible("work_experience") && workExperience && workExperience.length > 0 && (
        <section className="mb-5">
          <h2
            className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5"
            style={{ color: accentColor }}
          >
            <span>// {getTitle("work_experience", "EXPERIENCE_LOG")}</span>
            <div className="flex-1 border-b border-dashed border-slate-300" />
          </h2>
          <div className="space-y-4">
            {workExperience.map((exp) => (
              <div key={exp.id} className="border-l-2 pl-3" style={{ borderColor: accentColor }}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-950 text-xs">
                    {exp.jobTitle} <span className="font-normal text-slate-600">@ {exp.company}</span>
                  </span>
                  <span className="text-[10.5px] text-slate-500 font-semibold">
                    [{formatDate(exp.startDate)} - {exp.current ? "NOW" : formatDate(exp.endDate)}]
                  </span>
                </div>
                <div className="text-[10.5px] text-slate-500 mb-1">{exp.location}</div>
                <ul className="list-none space-y-1 text-slate-800 text-[11px] mt-1">
                  {exp.bullets.map((b, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-slate-400 font-bold">&gt;</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {isVisible("projects") && projects && projects.length > 0 && (
        <section className="mb-5">
          <h2
            className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5"
            style={{ color: accentColor }}
          >
            <span>// {getTitle("projects", "BUILT_PROJECTS")}</span>
            <div className="flex-1 border-b border-dashed border-slate-300" />
          </h2>
          <div className="space-y-2.5">
            {projects.map((proj) => (
              <div key={proj.id} className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-950 text-xs">{proj.title}</span>
                  {proj.link && (
                    <a href={proj.link} target="_blank" rel="noreferrer" className="text-[10.5px] underline" style={{ color: accentColor }}>
                      {proj.link.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                </div>
                <p className="text-[11px] text-slate-700 mt-0.5">{proj.description}</p>
                {proj.technologies && (
                  <div className="text-[10px] text-slate-500 mt-1 font-bold">
                    stack: [{proj.technologies.join(", ")}]
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {isVisible("education") && education && education.length > 0 && (
        <section className="mb-4">
          <h2
            className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5"
            style={{ color: accentColor }}
          >
            <span>// {getTitle("education", "EDUCATION")}</span>
            <div className="flex-1 border-b border-dashed border-slate-300" />
          </h2>
          <div className="space-y-2">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline text-[11px]">
                <div>
                  <span className="font-bold text-slate-950">{edu.degree} in {edu.fieldOfStudy}</span>
                  <div className="text-slate-600">{edu.institution}, {edu.location}</div>
                </div>
                <span className="text-slate-500 font-semibold">
                  [{formatDate(edu.startDate)} - {formatDate(edu.endDate)}]
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Custom User Sections */}
      {customSections?.map((customSec) =>
        isVisible(customSec.id) ? (
          <section key={customSec.id} className="mb-4">
            <h2
              className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5"
              style={{ color: accentColor }}
            >
              <span>// {customSec.sectionTitle.toUpperCase()}</span>
              <div className="flex-1 border-b border-dashed border-slate-300" />
            </h2>
            <div className="space-y-2">
              {customSec.items.map((item) => (
                <div key={item.id}>
                  <div className="flex justify-between font-bold text-xs text-slate-900">
                    <span>{item.title}</span>
                    {item.date && <span className="text-[10.5px] text-slate-500">[{item.date}]</span>}
                  </div>
                  {item.subtitle && <p className="text-[11px] text-slate-600">{item.subtitle}</p>}
                  {item.description && <p className="text-[11px] text-slate-700">{item.description}</p>}
                </div>
              ))}
            </div>
          </section>
        ) : null
      )}
    </div>
  );
}
