"use client";

import React, { useState } from "react";
import { EducationItem } from "@/lib/types/resume";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateId } from "@/lib/utils";
import { GraduationCap, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { AiRewriteButton } from "@/components/builder/ai/AiRewriteButton";
import { SectionRewriteModal } from "@/components/builder/ai/SectionRewriteModal";

interface Props {
  items: EducationItem[];
  onAdd: (item: EducationItem) => void;
  onUpdate: (id: string, updated: Partial<EducationItem>) => void;
  onRemove: (id: string) => void;
}

export function EducationSection({ items, onAdd, onUpdate, onRemove }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(
    items.length > 0 ? items[0].id : null
  );
  const [rewrite, setRewrite] = useState<{
    id: string;
    text: string;
    meta?: string;
  } | null>(null);

  const handleAddNew = () => {
    const newItem: EducationItem = {
      id: "edu_" + generateId(),
      institution: "",
      degree: "",
      fieldOfStudy: "",
      location: "",
      startDate: "",
      endDate: "",
      gpa: "",
    };
    onAdd(newItem);
    setExpandedId(newItem.id);
  };

  const educationLine = (item: EducationItem) => {
    const parts = [item.degree, item.fieldOfStudy].filter(Boolean);
    return parts.join(" in ") || item.institution || "";
  };

  const applyEducationRewrite = (id: string, rewritten: string) => {
    const cleaned = rewritten.replace(/^[-•*\d.)\s]+/, "").trim();
    const inMatch = cleaned.match(/^(.+?)\s+in\s+(.+)$/i);
    if (inMatch) {
      onUpdate(id, { degree: inMatch[1].trim(), fieldOfStudy: inMatch[2].trim() });
      return;
    }
    onUpdate(id, { fieldOfStudy: cleaned });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-bold text-foreground">Education</h3>
          <p className="text-xs text-muted-foreground">
            List your academic degrees, certifications, and educational milestones.
          </p>
        </div>
        <Button onClick={handleAddNew} size="sm" className="gap-1.5 text-xs">
          <Plus className="h-4 w-4" /> Add Education
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 border border-dashed rounded-xl space-y-2">
          <GraduationCap className="h-7 w-7 text-muted-foreground mx-auto" />
          <p className="text-xs text-muted-foreground">No education history added yet.</p>
          <Button onClick={handleAddNew} variant="outline" size="sm" className="gap-1 text-xs">
            <Plus className="h-3.5 w-3.5" /> Add Degree
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const isExpanded = expandedId === item.id;

            return (
              <div key={item.id} className="rounded-xl border bg-card shadow-xs">
                <div
                  className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-accent/40 rounded-t-xl"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                >
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">
                      {item.degree
                        ? `${item.degree}${item.fieldOfStudy ? ` in ${item.fieldOfStudy}` : ""}`
                        : "Degree / Field of Study"}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {item.institution || "Institution not set"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(item.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-border/50 space-y-3 mt-3 animate-in fade-in-50">
                    <div className="flex justify-end">
                      <AiRewriteButton
                        disabled={!educationLine(item).trim()}
                        label="Rewrite degree line"
                        onClick={() =>
                          setRewrite({
                            id: item.id,
                            text: educationLine(item),
                            meta: item.institution || undefined,
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
                          Institution / University
                        </label>
                        <Input
                          value={item.institution}
                          onChange={(e) => onUpdate(item.id, { institution: e.target.value })}
                          placeholder="e.g., UC Berkeley"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
                          Degree Level
                        </label>
                        <Input
                          value={item.degree}
                          onChange={(e) => onUpdate(item.id, { degree: e.target.value })}
                          placeholder="e.g., Bachelor of Science"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
                          Field of Study / Major
                        </label>
                        <Input
                          value={item.fieldOfStudy}
                          onChange={(e) => onUpdate(item.id, { fieldOfStudy: e.target.value })}
                          placeholder="e.g., Computer Science"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
                          Location
                        </label>
                        <Input
                          value={item.location}
                          onChange={(e) => onUpdate(item.id, { location: e.target.value })}
                          placeholder="e.g., Berkeley, CA"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
                          Start Date
                        </label>
                        <Input
                          type="month"
                          value={item.startDate}
                          onChange={(e) => onUpdate(item.id, { startDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
                          Graduation / End Date
                        </label>
                        <Input
                          type="month"
                          value={item.endDate}
                          onChange={(e) => onUpdate(item.id, { endDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
                          GPA (Optional)
                        </label>
                        <Input
                          value={item.gpa || ""}
                          onChange={(e) => onUpdate(item.id, { gpa: e.target.value })}
                          placeholder="e.g., 3.85 / 4.0"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <SectionRewriteModal
        isOpen={Boolean(rewrite)}
        onClose={() => setRewrite(null)}
        initialText={rewrite?.text || ""}
        sectionType="education"
        meta={rewrite?.meta}
        onApply={(t) => {
          if (rewrite) applyEducationRewrite(rewrite.id, t);
        }}
      />
    </div>
  );
}
