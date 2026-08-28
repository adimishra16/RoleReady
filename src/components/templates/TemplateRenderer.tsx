"use client";

import React from "react";
import { ResumeData } from "@/lib/types/resume";
import { ModernTemplate } from "./ModernTemplate";
import { MinimalTemplate } from "./MinimalTemplate";
import { ProfessionalTemplate } from "./ProfessionalTemplate";
import { CreativeTemplate } from "./CreativeTemplate";
import { TechMonoTemplate } from "./TechMonoTemplate";
import { CompactGridTemplate } from "./CompactGridTemplate";
import { ElegantSerifTemplate } from "./ElegantSerifTemplate";

interface Props {
  data: ResumeData;
  scale?: number;
}

export function TemplateRenderer({ data, scale = 1 }: Props) {
  const accent = data.themeColor || "#0d9488";

  const renderTemplate = () => {
    switch (data.templateId) {
      case "minimal":
        return <MinimalTemplate data={data} accentColor={accent} />;
      case "professional":
        return <ProfessionalTemplate data={data} accentColor={accent} />;
      case "creative":
        return <CreativeTemplate data={data} accentColor={accent} />;
      case "tech_mono":
        return <TechMonoTemplate data={data} accentColor={accent} />;
      case "compact_grid":
        return <CompactGridTemplate data={data} accentColor={accent} />;
      case "elegant_serif":
        return <ElegantSerifTemplate data={data} accentColor={accent} />;
      case "modern":
      default:
        return <ModernTemplate data={data} accentColor={accent} />;
    }
  };

  return (
    <div
      id="resume-canvas"
      className="resume-sheet origin-top transition-transform duration-150"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "top center",
      }}
    >
      {renderTemplate()}
    </div>
  );
}
