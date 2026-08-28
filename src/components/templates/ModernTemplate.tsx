"use client";

import React from "react";
import { ResumeData } from "@/lib/types/resume";
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface TemplateProps {
  data: ResumeData;
  accentColor?: string;
}

export function ModernTemplate({ data, accentColor = "#2563eb" }: TemplateProps) {
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
      className="a4-page p-8 text-slate-800 bg-white font-sans leading-relaxed text-[13px] mx-auto transition-all shadow-md print:shadow-none"
      style={{ fontFamily: data.fontFamily || "Inter, sans-serif" }}
    >
      {/* Header */}
      <header className="border-b pb-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1
              className="text-3xl font-bold tracking-tight text-slate-900"
              style={{ color: accentColor }}
            >
              {personalInfo.fullName || "Your Full Name"}
            </h1>
            <p className="text-base font-medium text-slate-600 mt-1">
              {personalInfo.jobTitle || "Your Target Job Title"}
            </p>
          </div>
          {personalInfo.avatarUrl && (
            <img
              src={personalInfo.avatarUrl}
              alt={personalInfo.fullName}
              className="w-16 h-16 rounded-full object-cover border-2"
              style={{ borderColor: accentColor }}
            />
          )}
        </div>

        {/* Contact info row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-4 text-xs text-slate-600">
          {personalInfo.email && (
            <div className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{personalInfo.location}</span>
            </div>
          )}
          {personalInfo.website && (
            <div className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <a href={personalInfo.website} target="_blank" rel="noreferrer" className="hover:underline">
                {personalInfo.website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}
          {personalInfo.linkedin && (
            <div className="flex items-center gap-1">
              <Linkedin className="w-3.5 h-3.5 text-slate-400" />
              <a href={personalInfo.linkedin} target="_blank" rel="noreferrer" className="hover:underline">
                {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "")}
              </a>
            </div>
          )}
          {personalInfo.github && (
            <div className="flex items-center gap-1">
              <Github className="w-3.5 h-3.5 text-slate-400" />
              <a href={personalInfo.github} target="_blank" rel="noreferrer" className="hover:underline">
                {personalInfo.github.replace(/^https?:\/\/(www\.)?github\.com\//, "")}
              </a>
            </div>
          )}
        </div>
      </header>

      {/* Summary */}
      {summary && (
        <section className="mb-6">
          <h2
            className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2"
            style={{ color: accentColor }}
          >
            <span>Professional Summary</span>
            <div className="flex-1 h-px bg-slate-200" />
          </h2>
          <p className="text-slate-700 leading-normal">{summary}</p>
        </section>
      )}

      {/* Main Grid: Left is Experience & Projects, Right is Skills, Education & Certs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Work Experience */}
          {workExperience && workExperience.length > 0 && (
            <section>
              <h2
                className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2"
                style={{ color: accentColor }}
              >
                <span>Work Experience</span>
                <div className="flex-1 h-px bg-slate-200" />
              </h2>
              <div className="space-y-4">
                {workExperience.map((item) => (
                  <div key={item.id} className="relative">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold text-slate-900 text-[13px]">{item.jobTitle}</h3>
                      <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {formatDate(item.startDate)} — {item.current ? "Present" : formatDate(item.endDate)}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-slate-600 mb-1.5 flex justify-between">
                      <span>{item.company}</span>
                      <span className="text-slate-400">{item.location}</span>
                    </div>
                    <ul className="list-disc list-outside ml-4 space-y-1 text-slate-700 text-xs">
                      {item.bullets.map((bullet, idx) => (
                        <li key={idx}>{bullet}</li>
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
                className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2"
                style={{ color: accentColor }}
              >
                <span>Key Projects</span>
                <div className="flex-1 h-px bg-slate-200" />
              </h2>
              <div className="space-y-3">
                {projects.map((proj) => (
                  <div key={proj.id}>
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-semibold text-slate-900 text-xs">{proj.title}</h3>
                      {proj.link && (
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] hover:underline"
                          style={{ color: accentColor }}
                        >
                          View Project &rarr;
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 mt-0.5">{proj.description}</p>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {proj.technologies.map((t, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-medium"
                          >
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
        </div>

        {/* Right Column: Skills, Education, Certifications, Languages */}
        <div className="space-y-6">
          {/* Skills */}
          {skills && skills.length > 0 && (
            <section>
              <h2
                className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2"
                style={{ color: accentColor }}
              >
                <span>Skills & Expertise</span>
                <div className="flex-1 h-px bg-slate-200" />
              </h2>
              <div className="space-y-2.5">
                {skills.map((cat) => (
                  <div key={cat.id}>
                    <h4 className="text-[11px] font-semibold text-slate-600 mb-1">
                      {cat.categoryName}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor: `${accentColor}12`,
                            color: accentColor,
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <section>
              <h2
                className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2"
                style={{ color: accentColor }}
              >
                <span>Education</span>
                <div className="flex-1 h-px bg-slate-200" />
              </h2>
              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id}>
                    <h3 className="font-semibold text-slate-900 text-xs">
                      {edu.degree} in {edu.fieldOfStudy}
                    </h3>
                    <p className="text-xs text-slate-600">{edu.institution}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {formatDate(edu.startDate)} — {formatDate(edu.endDate)} {edu.gpa ? `• GPA: ${edu.gpa}` : ""}
                    </p>
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
                <div className="flex-1 h-px bg-slate-200" />
              </h2>
              <div className="space-y-2">
                {certifications.map((c) => (
                  <div key={c.id}>
                    <h4 className="text-xs font-medium text-slate-800">{c.name}</h4>
                    <p className="text-[11px] text-slate-500">
                      {c.issuer} • {formatDate(c.issueDate)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <section>
              <h2
                className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2"
                style={{ color: accentColor }}
              >
                <span>Languages</span>
                <div className="flex-1 h-px bg-slate-200" />
              </h2>
              <div className="space-y-1">
                {languages.map((l) => (
                  <div key={l.id} className="flex justify-between text-xs">
                    <span className="text-slate-700 font-medium">{l.language}</span>
                    <span className="text-slate-500">{l.proficiency}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
