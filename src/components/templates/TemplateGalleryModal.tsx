"use client";

import React, { useState } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TemplateId, ResumeData } from "@/lib/types/resume";
import { TemplateRenderer } from "./TemplateRenderer";
import { PICKER_SAMPLE_RESUME } from "./VisualTemplateCardPicker";
import { LayoutTemplate, Check } from "lucide-react";

interface TemplateOption {
  id: TemplateId;
  name: string;
  tag: string;
  description: string;
  isAts: boolean;
}

export const TEMPLATE_OPTIONS: TemplateOption[] = [
  {
    id: "modern",
    name: "Modern Split",
    tag: "Most Popular",
    description: "Sleek accent banner with structured two-column layout.",
    isAts: true,
  },
  {
    id: "minimal",
    name: "Minimalist ATS",
    tag: "100% ATS Ready",
    description: "Single-column format designed for maximum ATS parser accuracy.",
    isAts: true,
  },
  {
    id: "professional",
    name: "Executive Formal",
    tag: "Corporate",
    description: "Traditional corporate serif layout with elegant divider lines.",
    isAts: true,
  },
  {
    id: "creative",
    name: "Creative Brand",
    tag: "Bold Sidebar",
    description: "Vibrant sidebar layout featuring skill chips and project cards.",
    isAts: false,
  },
  {
    id: "tech_mono",
    name: "Tech Monospace",
    tag: "Developer Focus",
    description: "Terminal code-block aesthetic tailored for software engineers.",
    isAts: true,
  },
  {
    id: "compact_grid",
    name: "Compact Grid",
    tag: "Space Efficient",
    description: "Dense 2-column grid maximizing space for senior experience.",
    isAts: true,
  },
  {
    id: "elegant_serif",
    name: "Elegant Serif",
    tag: "Editorial Luxury",
    description: "Sophisticated editorial typography with luxury accent lines.",
    isAts: true,
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedTemplateId: TemplateId;
  onSelectTemplate: (templateId: TemplateId) => void;
  accentColor?: string;
}

export function TemplateGalleryModal({
  isOpen,
  onClose,
  selectedTemplateId,
  onSelectTemplate,
  accentColor = "#0d9488",
}: Props) {
  const [activeTab, setActiveTab] = useState<"all" | "ats">("all");

  const filteredOptions = TEMPLATE_OPTIONS.filter((t) =>
    activeTab === "ats" ? t.isAts : true
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose} className="max-w-5xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <LayoutTemplate className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">Choose Resume Template</DialogTitle>
              <DialogDescription>
                Select a visual design for your resume. Switch anytime without losing any entered data.
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-muted p-1 rounded-lg self-start sm:self-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                activeTab === "all" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
              }`}
            >
              All Templates ({TEMPLATE_OPTIONS.length})
            </button>
            <button
              onClick={() => setActiveTab("ats")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                activeTab === "ats" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
              }`}
            >
              100% ATS Ready ({TEMPLATE_OPTIONS.filter((t) => t.isAts).length})
            </button>
          </div>
        </div>
      </DialogHeader>

      {/* Template cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-4">
        {filteredOptions.map((option) => {
          const isSelected = selectedTemplateId === option.id;
          const previewResume: ResumeData = {
            ...PICKER_SAMPLE_RESUME,
            templateId: option.id,
            themeColor: accentColor,
          };

          return (
            <div
              key={option.id}
              onClick={() => {
                onSelectTemplate(option.id);
              }}
              className={`group relative rounded-2xl border-2 cursor-pointer transition-all duration-200 overflow-hidden bg-card hover:shadow-2xl flex flex-col justify-between ${
                isSelected
                  ? "border-primary ring-4 ring-primary/20 shadow-xl scale-[1.02]"
                  : "border-border/80 hover:border-primary/60"
              }`}
            >
              {/* Top Card Badge Header */}
              <div className="p-3 bg-muted/40 border-b flex items-center justify-between">
                <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                  {option.name}
                </span>
                <Badge
                  variant={isSelected ? "default" : "outline"}
                  className="text-[10px] py-0 px-2 font-semibold"
                >
                  {option.tag}
                </Badge>
              </div>

              {/* Live Rendered Miniature Preview Box (Full Rich Resume Content) */}
              <div className="relative h-[290px] bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950 overflow-hidden flex justify-center p-3">
                <div className="w-[210mm] min-h-[297mm] scale-[0.45] origin-top shadow-xl rounded-sm transition-transform duration-200 group-hover:scale-[0.48] pointer-events-none bg-white">
                  <TemplateRenderer data={previewResume} scale={1} />
                </div>

                {/* Hover Selection Overlay */}
                <div
                  className={`absolute inset-0 bg-primary/10 backdrop-blur-[1px] flex items-center justify-center transition-opacity ${
                    isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <Button
                    size="sm"
                    variant={isSelected ? "default" : "secondary"}
                    className="gap-1.5 shadow-md font-semibold text-xs"
                  >
                    {isSelected ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-400" /> Active Template
                      </>
                    ) : (
                      "Use This Template"
                    )}
                  </Button>
                </div>
              </div>

              {/* Bottom Card Description */}
              <div className="p-3 bg-card border-t text-[11px] text-muted-foreground leading-tight">
                {option.description}
              </div>
            </div>
          );
        })}
      </div>

      <DialogFooter>
        <Button variant="outline" size="sm" onClick={onClose}>
          Done
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
