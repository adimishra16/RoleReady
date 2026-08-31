"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
      className="max-w-5xl max-h-[min(92dvh,calc(100vh-1.5rem))] flex flex-col overflow-hidden p-0"
    >
      <div className="shrink-0 px-6 pt-6 pr-12 border-b pb-4">
        <DialogHeader className="mb-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                <LayoutTemplate className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl">Choose Resume Template</DialogTitle>
                <DialogDescription>
                  Select a design anytime — your content stays intact.
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-muted p-1 rounded-lg self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  activeTab === "all"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground"
                }`}
              >
                All ({TEMPLATE_OPTIONS.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("ats")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  activeTab === "ats"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground"
                }`}
              >
                ATS Ready ({TEMPLATE_OPTIONS.filter((t) => t.isAts).length})
              </button>
            </div>
          </div>
        </DialogHeader>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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
                onClick={() => onSelectTemplate(option.id)}
                className={`group relative rounded-2xl border-2 cursor-pointer transition-all duration-200 overflow-hidden bg-card hover:shadow-xl flex flex-col ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/25 shadow-lg"
                    : "border-border/80 hover:border-primary/60"
                }`}
              >
                <div className="p-3 bg-muted/40 border-b flex items-center justify-between gap-2">
                  <span className="font-bold text-xs text-foreground truncate">
                    {option.name}
                  </span>
                  <Badge
                    variant={isSelected ? "default" : "outline"}
                    className="text-[10px] py-0 px-2 font-semibold shrink-0"
                  >
                    {option.tag}
                  </Badge>
                </div>

                <div className="relative h-[200px] sm:h-[220px] bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950 overflow-hidden flex justify-center p-2">
                  <div className="w-[210mm] min-h-[297mm] scale-[0.32] sm:scale-[0.36] origin-top shadow-xl rounded-sm pointer-events-none bg-white">
                    <TemplateRenderer data={previewResume} scale={1} />
                  </div>

                  <div
                    className={`absolute inset-0 bg-primary/10 backdrop-blur-[1px] flex items-center justify-center transition-opacity ${
                      isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    <Button
                      size="sm"
                      variant={isSelected ? "default" : "secondary"}
                      className="gap-1.5 shadow-md font-semibold text-xs pointer-events-none"
                    >
                      {isSelected ? (
                        <>
                          <Check className="h-4 w-4 text-emerald-400" /> Active
                        </>
                      ) : (
                        "Use This Template"
                      )}
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-card border-t text-[11px] text-muted-foreground leading-snug">
                  {option.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <DialogFooter className="shrink-0 mt-0 border-t bg-card px-6 py-4">
        <Button variant="outline" size="sm" onClick={onClose}>
          Done
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
