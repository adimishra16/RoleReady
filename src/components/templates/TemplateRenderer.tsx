"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import { ResumeData } from "@/lib/types/resume";
import { ModernTemplate } from "./ModernTemplate";
import { MinimalTemplate } from "./MinimalTemplate";
import { ProfessionalTemplate } from "./ProfessionalTemplate";
import { CreativeTemplate } from "./CreativeTemplate";
import { TechMonoTemplate } from "./TechMonoTemplate";
import { CompactGridTemplate } from "./CompactGridTemplate";
import { ElegantSerifTemplate } from "./ElegantSerifTemplate";
import { A4_HEIGHT_PX, A4_WIDTH_PX } from "@/lib/pdf/export-resume-pdf";

interface Props {
  data: ResumeData;
  scale?: number;
}

export function TemplateRenderer({ data, scale = 1 }: Props) {
  const accent = data.themeColor || "#0d9488";
  const innerRef = useRef<HTMLDivElement>(null);
  const [naturalHeight, setNaturalHeight] = useState(A4_HEIGHT_PX);

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

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    const measure = () => {
      const h = el.scrollHeight || A4_HEIGHT_PX;
      setNaturalHeight(h);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [data, scale]);

  const shellWidth = A4_WIDTH_PX * scale;
  const shellHeight = naturalHeight * scale;

  return (
    <div
      className="resume-sheet-shell"
      style={{
        width: shellWidth,
        height: shellHeight,
        overflow: "hidden",
      }}
    >
      <div
        id="resume-canvas"
        ref={innerRef}
        className="resume-sheet origin-top-left transition-transform duration-150"
        style={{
          width: A4_WIDTH_PX,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {renderTemplate()}
      </div>
    </div>
  );
}
