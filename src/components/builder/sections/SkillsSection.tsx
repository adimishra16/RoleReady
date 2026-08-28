"use client";

import React, { useState } from "react";
import { SkillCategory } from "@/lib/types/resume";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { generateId } from "@/lib/utils";
import { Sparkles, Plus, Trash2, X, PlusCircle } from "lucide-react";

interface Props {
  categories: SkillCategory[];
  onChange: (categories: SkillCategory[]) => void;
}

const COMMON_SUGGESTIONS = [
  "TypeScript", "React", "Next.js", "Node.js", "Python", "PostgreSQL",
  "Tailwind CSS", "Docker", "AWS", "GraphQL", "Git", "REST APIs",
  "System Design", "Microservices", "CI/CD", "Redis", "Vercel AI SDK"
];

export function SkillsSection({ categories, onChange }: Props) {
  const [newSkillInputs, setNewSkillInputs] = useState<{ [catId: string]: string }>({});

  const handleAddCategory = () => {
    const newCat: SkillCategory = {
      id: "cat_" + generateId(),
      categoryName: "New Category",
      skills: [],
    };
    onChange([...categories, newCat]);
  };

  const handleRemoveCategory = (catId: string) => {
    onChange(categories.filter((c) => c.id !== catId));
  };

  const handleUpdateCategoryName = (catId: string, name: string) => {
    onChange(
      categories.map((c) => (c.id === catId ? { ...c, categoryName: name } : c))
    );
  };

  const handleAddSkill = (catId: string, skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed) return;

    onChange(
      categories.map((c) => {
        if (c.id === catId && !c.skills.includes(trimmed)) {
          return { ...c, skills: [...c.skills, trimmed] };
        }
        return c;
      })
    );

    setNewSkillInputs((prev) => ({ ...prev, [catId]: "" }));
  };

  const handleRemoveSkill = (catId: string, skillToRemove: string) => {
    onChange(
      categories.map((c) =>
        c.id === catId
          ? { ...c, skills: c.skills.filter((s) => s !== skillToRemove) }
          : c
      )
    );
  };

  const handleAddSuggestion = (skill: string) => {
    if (categories.length === 0) {
      const newCat: SkillCategory = {
        id: "cat_" + generateId(),
        categoryName: "Technical Skills",
        skills: [skill],
      };
      onChange([newCat]);
      return;
    }
    // Add to first category
    handleAddSkill(categories[0].id, skill);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-bold text-foreground">Skills & Competencies</h3>
          <p className="text-xs text-muted-foreground">
            Group skills logically by domain or tech stack to maximize ATS keyword matching.
          </p>
        </div>
        <Button onClick={handleAddCategory} size="sm" className="gap-1.5 text-xs">
          <Plus className="h-4 w-4" /> Add Skill Category
        </Button>
      </div>

      {/* Quick suggestions */}
      <div className="p-3 bg-muted/30 rounded-xl border border-border/60">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-purple-500" /> Popular Quick Add
        </p>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleAddSuggestion(s)}
              className="text-xs px-2 py-0.5 rounded-md bg-background border hover:border-primary hover:text-primary transition-all flex items-center gap-1"
            >
              <Plus className="h-2.5 w-2.5" />
              {s}
            </button>
          ))}
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-8 border border-dashed rounded-xl space-y-2">
          <p className="text-xs text-muted-foreground">No skill categories added yet.</p>
          <Button onClick={handleAddCategory} variant="outline" size="sm" className="text-xs gap-1">
            <Plus className="h-3.5 w-3.5" /> Create Category
          </Button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {categories.map((cat) => (
            <div key={cat.id} className="p-4 rounded-xl border bg-card space-y-3 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <Input
                  value={cat.categoryName}
                  onChange={(e) => handleUpdateCategoryName(cat.id, e.target.value)}
                  placeholder="Category Name (e.g., Languages, Frameworks, Cloud)"
                  className="font-semibold text-sm h-8"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0"
                  onClick={() => handleRemoveCategory(cat.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Skills Tags List */}
              <div className="flex flex-wrap gap-1.5 min-h-[32px] p-1 bg-muted/20 rounded-lg">
                {cat.skills.length === 0 ? (
                  <span className="text-xs text-muted-foreground p-1">No skills added to this group yet.</span>
                ) : (
                  cat.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="text-xs py-1 px-2.5 gap-1.5 bg-background shadow-xs border"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(cat.id, skill)}
                        className="hover:text-destructive text-muted-foreground transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))
                )}
              </div>

              {/* Add Skill Input */}
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Type a skill (e.g., Next.js) and press Enter..."
                  value={newSkillInputs[cat.id] || ""}
                  onChange={(e) =>
                    setNewSkillInputs((prev) => ({ ...prev, [cat.id]: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill(cat.id, newSkillInputs[cat.id] || "");
                    }
                  }}
                  className="text-xs h-8"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs shrink-0"
                  onClick={() => handleAddSkill(cat.id, newSkillInputs[cat.id] || "")}
                >
                  <PlusCircle className="h-3.5 w-3.5 mr-1" /> Add
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
