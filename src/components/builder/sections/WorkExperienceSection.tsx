"use client";

import React, { useState } from "react";
import { WorkExperienceItem } from "@/lib/types/resume";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { generateId } from "@/lib/utils";
import { BulletRewriterModal } from "@/components/builder/ai/BulletRewriterModal";
import {
  Briefcase,
  Plus,
  Trash2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  GripVertical,
  PlusCircle,
  Building,
  MapPin,
  Calendar,
} from "lucide-react";

interface Props {
  items: WorkExperienceItem[];
  onAdd: (item: WorkExperienceItem) => void;
  onUpdate: (id: string, updated: Partial<WorkExperienceItem>) => void;
  onRemove: (id: string) => void;
  onReorder: (items: WorkExperienceItem[]) => void;
}

export function WorkExperienceSection({
  items,
  onAdd,
  onUpdate,
  onRemove,
  onReorder,
}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(
    items.length > 0 ? items[0].id : null
  );

  // AI Modal state
  const [aiModalState, setAiModalState] = useState<{
    isOpen: boolean;
    bullet: string;
    expId: string;
    bulletIndex: number;
    jobTitle: string;
    company: string;
  }>({
    isOpen: false,
    bullet: "",
    expId: "",
    bulletIndex: 0,
    jobTitle: "",
    company: "",
  });

  const handleAddNew = () => {
    const newItem: WorkExperienceItem = {
      id: "exp_" + generateId(),
      jobTitle: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      bullets: [""],
    };
    onAdd(newItem);
    setExpandedId(newItem.id);
  };

  const handleAddBullet = (expId: string, currentBullets: string[]) => {
    onUpdate(expId, { bullets: [...currentBullets, ""] });
  };

  const handleUpdateBullet = (
    expId: string,
    currentBullets: string[],
    index: number,
    text: string
  ) => {
    const newBullets = [...currentBullets];
    newBullets[index] = text;
    onUpdate(expId, { bullets: newBullets });
  };

  const handleRemoveBullet = (
    expId: string,
    currentBullets: string[],
    index: number
  ) => {
    const newBullets = currentBullets.filter((_, i) => i !== index);
    onUpdate(expId, { bullets: newBullets.length > 0 ? newBullets : [""] });
  };

  const handleOpenAi = (
    bulletText: string,
    expId: string,
    bulletIndex: number,
    jobTitle: string,
    company: string
  ) => {
    setAiModalState({
      isOpen: true,
      bullet: bulletText,
      expId,
      bulletIndex,
      jobTitle,
      company,
    });
  };

  const handleApplyAiBullet = (newBullet: string) => {
    const exp = items.find((i) => i.id === aiModalState.expId);
    if (!exp) return;
    handleUpdateBullet(
      aiModalState.expId,
      exp.bullets,
      aiModalState.bulletIndex,
      newBullet
    );
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const newItems = [...items];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newItems.length) return;
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;
    onReorder(newItems);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-bold text-foreground">Work Experience</h3>
          <p className="text-xs text-muted-foreground">
            Highlight your relevant career history, achievements, and impact.
          </p>
        </div>
        <Button onClick={handleAddNew} size="sm" className="gap-1.5 text-xs">
          <Plus className="h-4 w-4" /> Add Position
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-10 border border-dashed rounded-xl space-y-3">
          <Briefcase className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="text-xs text-muted-foreground">
            No work experience added yet. Add your past or current roles.
          </p>
          <Button onClick={handleAddNew} variant="outline" size="sm" className="gap-1.5 text-xs">
            <Plus className="h-4 w-4" /> Add First Experience
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => {
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className="rounded-xl border bg-card transition-all duration-150 shadow-sm"
              >
                {/* Header Row */}
                <div
                  className="flex items-center justify-between p-3.5 cursor-pointer select-none hover:bg-accent/40 rounded-t-xl"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="text-muted-foreground cursor-grab">
                      <GripVertical className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">
                        {item.jobTitle || "Untitled Position"}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {item.company ? `${item.company} • ` : ""}
                        {item.startDate ? `${item.startDate} to ${item.current ? "Present" : item.endDate || "..."}` : "Dates not set"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveItem(index, "up");
                      }}
                      disabled={index === 0}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveItem(index, "down");
                      }}
                      disabled={index === items.length - 1}
                    >
                      <ChevronDown className="h-4 w-4" />
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

                {/* Expanded Form Fields */}
                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-border/50 space-y-4 animate-in fade-in-50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5" /> Job Title
                        </label>
                        <Input
                          value={item.jobTitle}
                          onChange={(e) => onUpdate(item.id, { jobTitle: e.target.value })}
                          placeholder="e.g., Senior Full Stack Engineer"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Building className="h-3.5 w-3.5" /> Company / Organization
                        </label>
                        <Input
                          value={item.company}
                          onChange={(e) => onUpdate(item.id, { company: e.target.value })}
                          placeholder="e.g., Stripe"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> Location
                        </label>
                        <Input
                          value={item.location}
                          onChange={(e) => onUpdate(item.id, { location: e.target.value })}
                          placeholder="e.g., San Francisco, CA (or Remote)"
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-6">
                        <Switch
                          id={`current-${item.id}`}
                          checked={item.current}
                          onCheckedChange={(checked) => onUpdate(item.id, { current: checked })}
                        />
                        <label
                          htmlFor={`current-${item.id}`}
                          className="text-xs font-medium cursor-pointer text-foreground"
                        >
                          I currently work here
                        </label>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" /> Start Date
                        </label>
                        <Input
                          type="month"
                          value={item.startDate}
                          onChange={(e) => onUpdate(item.id, { startDate: e.target.value })}
                        />
                      </div>

                      {!item.current && (
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" /> End Date
                          </label>
                          <Input
                            type="month"
                            value={item.endDate}
                            onChange={(e) => onUpdate(item.id, { endDate: e.target.value })}
                          />
                        </div>
                      )}
                    </div>

                    {/* Bullet Points with inline AI Rewriter */}
                    <div className="space-y-2.5 pt-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Key Achievements & Responsibilities
                        </label>
                        <span className="text-[11px] text-muted-foreground font-medium">
                          Use Rewrite to strengthen bullets
                        </span>
                      </div>

                      <div className="space-y-2">
                        {item.bullets.map((bullet, bIdx) => (
                          <div key={bIdx} className="flex items-start gap-1.5 group">
                            <div className="w-full relative">
                              <Textarea
                                rows={2}
                                value={bullet}
                                onChange={(e) =>
                                  handleUpdateBullet(item.id, item.bullets, bIdx, e.target.value)
                                }
                                placeholder="Describe an accomplishment (e.g., Optimized database queries reducing page load times by 40%)..."
                                className="text-xs resize-none pr-16 bg-muted/20"
                              />
                              {bullet.trim() && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOpenAi(
                                      bullet,
                                      item.id,
                                      bIdx,
                                      item.jobTitle,
                                      item.company
                                    )
                                  }
                                  className="absolute right-2 top-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground text-[10px] font-medium transition-colors"
                                >
                                  <Sparkles className="h-3 w-3" />
                                  Rewrite
                                </button>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 mt-1"
                              onClick={() => handleRemoveBullet(item.id, item.bullets, bIdx)}
                              disabled={item.bullets.length === 1 && !bullet}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddBullet(item.id, item.bullets)}
                        className="text-xs gap-1.5 w-full border-dashed"
                      >
                        <PlusCircle className="h-3.5 w-3.5" /> Add Another Bullet Point
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* AI Bullet Rewriter Modal */}
      <BulletRewriterModal
        isOpen={aiModalState.isOpen}
        onClose={() => setAiModalState((prev) => ({ ...prev, isOpen: false }))}
        initialBullet={aiModalState.bullet}
        jobTitle={aiModalState.jobTitle}
        company={aiModalState.company}
        onApply={handleApplyAiBullet}
      />
    </div>
  );
}
