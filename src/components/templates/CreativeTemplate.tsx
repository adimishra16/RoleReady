"use client";

import React from "react";
import { ResumeData } from "@/lib/types/resume";
import { formatDate } from "@/lib/utils";
import { Sparkles, Mail, Phone, MapPin, Globe, Linkedin, Github } from "lucide-react";

interface TemplateProps {
  data: ResumeData;
  accentColor?: string;
}

export function CreativeTemplate({ data, accentColor = "#7c3aed" }: TemplateProps) {
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
      className="a4-page p-0 bg-white font-sans text-slate-800 text-[12.5px] mx-auto transition-all shadow-md print:shadow-none flex flex-row min-h-[297mm]"
      style={{ fontFamily: data.fontFamily || "Inter, sans-serif" }}
    >
      {/* Creative Sidebar */}
      <aside
        className="w-1/3 p-6 text-white flex flex-col justify-between"
        style={{
          backgroundColor: accentColor,
          backgroundImage: `linear-gradient(135deg, ${accentColor}, #1e1b4b)`,
        }}
      >
        <div className="space-y-6">
          {/* Avatar / Initials */}
          <div className="text-center">
            {personalInfo.avatarUrl ? (
              <img
                src={personalInfo.avatarUrl}
                alt={personalInfo.fullName}
                className="w-20 h-20 rounded-2xl object-cover mx-auto mb-3 border-2 border-white/40 shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-xl font-bold mx-auto mb-3 border border-white/20">
                {personalInfo.fullName
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("") || "CV"}
              </div>
            )}
            <h1 className="text-xl font-bold tracking-tight text-white leading-tight">
              {personalInfo.fullName || "Your Name"}
            </h1>
            <p className="text-xs text-white/80 font-medium mt-1">
              {personalInfo.jobTitle || "Creative Technologist"}
            </p>
          </div>

          {/* Contact Details */}
          <div className="space-y-2 text-xs text-white/90 border-t border-white/20 pt-4">
            {personalInfo.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 shrink-0 text-white/70" />
                <span className="truncate">{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 shrink-0 text-white/70" />
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-white/70" />
                <span>{personalInfo.location}</span>
              </div>
            )}
            {personalInfo.website && (
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 shrink-0 text-white/70" />
                <span className="truncate">{personalInfo.website.replace(/^https?:\/\//, "")}</span>
              </div>
            )}
            {personalInfo.linkedin && (
              <div className="flex items-center gap-2">
                <Linkedin className="w-3.5 h-3.5 shrink-0 text-white/70" />
                <span className="truncate">LinkedIn</span>
              </div>
            )}
            {personalInfo.github && (
              <div className="flex items-center gap-2">
                <Github className="w-3.5 h-3.5 shrink-0 text-white/70" />
                <span className="truncate">GitHub</span>
              </div>
            )}
          </div>

          {/* Skills Badges */}
          {skills && skills.length > 0 && (
            <div className="border-t border-white/20 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/90 mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> Skills
              </h3>
              <div className="space-y-2.5">
                {skills.map((cat) => (
                  <div key={cat.id}>
                    <h4 className="text-[10.5px] font-semibold text-white/70 uppercase tracking-wider mb-1">
                      {cat.categoryName}
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {cat.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-white/15 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <div className="border-t border-white/20 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/90 mb-2">
                Education
              </h3>
              <div className="space-y-2">
                {education.map((edu) => (
                  <div key={edu.id} className="text-xs">
                    <p className="font-semibold text-white">{edu.degree}</p>
                    <p className="text-white/80 text-[11px]">{edu.institution}</p>
                    <p className="text-white/60 text-[10px]">
                      {formatDate(edu.startDate)} – {formatDate(edu.endDate)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info in sidebar */}
        {languages && languages.length > 0 && (
          <div className="border-t border-white/20 pt-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-white/90 mb-1">
              Languages
            </h3>
            <div className="flex flex-wrap gap-2 text-[11px] text-white/80">
              {languages.map((l) => (
                <span key={l.id}>{l.language} ({l.proficiency})</span>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="w-2/3 p-7 space-y-6">
        {/* Summary */}
        {summary && (
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2"
              style={{ color: accentColor }}
            >
              <span>About Me</span>
              <div className="flex-1 h-0.5 rounded-full" style={{ backgroundColor: `${accentColor}25` }} />
            </h2>
            <p className="text-slate-700 leading-relaxed text-xs">{summary}</p>
          </section>
        )}

        {/* Work Experience */}
        {workExperience && workExperience.length > 0 && (
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2"
              style={{ color: accentColor }}
            >
              <span>Experience</span>
              <div className="flex-1 h-0.5 rounded-full" style={{ backgroundColor: `${accentColor}25` }} />
            </h2>
            <div className="space-y-4">
              {workExperience.map((exp) => (
                <div key={exp.id} className="relative pl-3 border-l-2" style={{ borderColor: `${accentColor}50` }}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-slate-900 text-xs">{exp.jobTitle}</h3>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-600 mb-1">
                    {exp.company} • {exp.location}
                  </p>
                  <ul className="list-disc list-outside ml-3.5 space-y-1 text-xs text-slate-700">
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
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-2"
              style={{ color: accentColor }}
            >
              <span>Selected Projects</span>
              <div className="flex-1 h-0.5 rounded-full" style={{ backgroundColor: `${accentColor}25` }} />
            </h2>
            <div className="space-y-3">
              {projects.map((proj) => (
                <div key={proj.id} className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-bold text-slate-900 text-xs">{proj.title}</h4>
                    {proj.link && (
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-semibold hover:underline"
                        style={{ color: accentColor }}
                      >
                        Launch &rarr;
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{proj.description}</p>
                  {proj.technologies && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {proj.technologies.map((t, idx) => (
                        <span key={idx} className="bg-white text-slate-700 px-1.5 py-0.5 rounded border text-[10px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2"
              style={{ color: accentColor }}
            >
              <span>Certifications</span>
              <div className="flex-1 h-0.5 rounded-full" style={{ backgroundColor: `${accentColor}25` }} />
            </h2>
            <div className="space-y-1.5">
              {certifications.map((c) => (
                <div key={c.id} className="text-xs">
                  <span className="font-semibold text-slate-900">{c.name}</span> —{" "}
                  <span className="text-slate-600">{c.issuer} ({formatDate(c.issueDate)})</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
