"use client";

import React, { useState } from "react";
import { SectionType, CustomSectionEntry } from "@/lib/types/resume";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Sparkles,
  FolderGit2,
  Award,
  Languages,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Plus,
  Edit2,
  Layers,
  Settings2,
} from "lucide-react";

interface Props {
  activeSection: SectionType | string;
  onSelectSection: (section: SectionType | string) => void;
  sectionOrder: (SectionType | string)[];
  hiddenSections?: string[];
  customTitles?: Record<string, string>;
  customSections?: CustomSectionEntry[];
  onToggleVisibility?: (sectionKey: string) => void;
  onReorderSections?: (order: (SectionType | string)[]) => void;
  onRenameTitle?: (sectionKey: string, newTitle: string) => void;
  onAddCustomSection?: (title: string) => void;
}

const DEFAULT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  personal_info: User,
  summary: FileText,
  work_experience: Briefcase,
  skills: Sparkles,
  education: GraduationCap,
  projects: FolderGit2,
  certifications: Award,
  languages: Languages,
};

const DEFAULT_LABELS: Record<string, string> = {
  personal_info: "Personal Info",
  summary: "Summary",
  work_experience: "Work Experience",
  skills: "Skills",
  education: "Education",
  projects: "Projects",
  certifications: "Certifications",
  languages: "Languages",
};

export function SectionSidebar({
  activeSection,
  onSelectSection,
  sectionOrder,
  hiddenSections = [],
  customTitles = {},
  customSections = [],
  onToggleVisibility,
  onReorderSections,
  onRenameTitle,
  onAddCustomSection,
}: Props) {
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [newCustomTitle, setNewCustomTitle] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState("");

  const handleMove = (index: number, direction: "up" | "down") => {
    if (!onReorderSections) return;
    const newOrder = [...sectionOrder];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIdx];
    newOrder[targetIdx] = temp;
    onReorderSections(newOrder);
  };

  const handleCreateCustom = () => {
    if (newCustomTitle.trim() && onAddCustomSection) {
      onAddCustomSection(newCustomTitle.trim());
      setNewCustomTitle("");
    }
  };

  const handleStartRename = (key: string, currentLabel: string) => {
    setEditingKey(key);
    setEditTitleValue(currentLabel);
  };

  const handleSaveRename = () => {
    if (editingKey && editTitleValue.trim() && onRenameTitle) {
      onRenameTitle(editingKey, editTitleValue.trim());
    }
    setEditingKey(null);
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center justify-between px-1 mb-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Sections
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsManagerOpen(true)}
          className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-foreground gap-1"
          title="Customize & Reorder Sections"
        >
          <Settings2 className="h-3 w-3" /> Manage
        </Button>
      </div>

      <nav className="w-full flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible">
        {sectionOrder.map((secKey, index) => {
          const isCustomSec = secKey.startsWith("csec_");
          const customSecObj = customSections.find((s) => s.id === secKey);

          const defaultLabel = DEFAULT_LABELS[secKey] || customSecObj?.sectionTitle || "Custom Section";
          const label = customTitles[secKey] || defaultLabel;
          const Icon = DEFAULT_ICONS[secKey] || Layers;

          const isActive = activeSection === secKey;
          const isHidden = hiddenSections.includes(secKey);

          return (
            <div
              key={secKey}
              className={cn(
                "group flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium transition-all select-none",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
                isHidden && "opacity-50"
              )}
            >
              <button
                type="button"
                onClick={() => onSelectSection(secKey)}
                className="flex items-center gap-2 flex-1 text-left truncate min-w-0"
              >
                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                <span className="truncate">{label}</span>
              </button>

              <div className="flex items-center gap-0.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                {onToggleVisibility && secKey !== "personal_info" && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleVisibility(secKey);
                    }}
                    className={cn(
                      "p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors",
                      isActive ? "text-primary-foreground" : "text-muted-foreground"
                    )}
                    title={isHidden ? "Show section on resume" : "Hide section from resume"}
                  >
                    {isHidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Add Custom Section Quick Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsManagerOpen(true)}
        className="w-full text-xs gap-1.5 border-dashed mt-1"
      >
        <Plus className="h-3.5 w-3.5" /> Custom Section
      </Button>

      {/* Section Manager Modal */}
      <Dialog open={isManagerOpen} onOpenChange={setIsManagerOpen}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            Customize & Reorder Resume Sections
          </DialogTitle>
          <DialogDescription>
            Rename headers, reorder sequence, and toggle section visibility.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2 max-h-[60vh] overflow-y-auto pr-1">
          <div className="space-y-2">
            {sectionOrder.map((secKey, index) => {
              const isCustomSec = secKey.startsWith("csec_");
              const customSecObj = customSections.find((s) => s.id === secKey);
              const defaultLabel = DEFAULT_LABELS[secKey] || customSecObj?.sectionTitle || "Custom Section";
              const currentLabel = customTitles[secKey] || defaultLabel;
              const isHidden = hiddenSections.includes(secKey);

              return (
                <div
                  key={secKey}
                  className="flex items-center justify-between p-3 rounded-xl border bg-card text-xs gap-2"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="flex items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground"
                        disabled={index === 0}
                        onClick={() => handleMove(index, "up")}
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground"
                        disabled={index === sectionOrder.length - 1}
                        onClick={() => handleMove(index, "down")}
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {editingKey === secKey ? (
                      <Input
                        value={editTitleValue}
                        onChange={(e) => setEditTitleValue(e.target.value)}
                        onBlur={handleSaveRename}
                        onKeyDown={(e) => e.key === "Enter" && handleSaveRename()}
                        className="h-7 text-xs font-semibold max-w-[180px]"
                        autoFocus
                      />
                    ) : (
                      <span className="font-semibold text-foreground truncate">
                        {currentLabel}
                      </span>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      onClick={() => handleStartRename(secKey, currentLabel)}
                      title="Rename section header"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    {secKey !== "personal_info" && (
                      <Button
                        variant={isHidden ? "outline" : "secondary"}
                        size="sm"
                        onClick={() => onToggleVisibility?.(secKey)}
                        className="h-7 px-2.5 text-[11px] gap-1"
                      >
                        {isHidden ? (
                          <>
                            <EyeOff className="h-3 w-3 text-muted-foreground" /> Hidden
                          </>
                        ) : (
                          <>
                            <Eye className="h-3 w-3 text-emerald-600" /> Visible
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Create Custom Section Field */}
          <div className="p-3.5 rounded-xl border bg-muted/20 space-y-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
              Add New Custom Section
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Volunteering, Publications, Awards"
                value={newCustomTitle}
                onChange={(e) => setNewCustomTitle(e.target.value)}
                className="text-xs h-8"
              />
              <Button
                size="sm"
                onClick={handleCreateCustom}
                disabled={!newCustomTitle.trim()}
                className="h-8 text-xs gap-1 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setIsManagerOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
