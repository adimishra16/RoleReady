"use client";

import React, { useState } from "react";
import { ProjectItem } from "@/lib/types/resume";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { generateId } from "@/lib/utils";
import { FolderGit2, Plus, Trash2, ChevronDown, ChevronUp, Link as LinkIcon } from "lucide-react";

interface Props {
  items: ProjectItem[];
  onChange: (items: ProjectItem[]) => void;
}

export function ProjectsSection({ items, onChange }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(
    items.length > 0 ? items[0].id : null
  );

  const handleAddNew = () => {
    const newItem: ProjectItem = {
      id: "proj_" + generateId(),
      title: "",
      description: "",
      technologies: [],
      link: "",
    };
    onChange([...items, newItem]);
    setExpandedId(newItem.id);
  };

  const handleUpdate = (id: string, updated: Partial<ProjectItem>) => {
    onChange(items.map((p) => (p.id === id ? { ...p, ...updated } : p)));
  };

  const handleRemove = (id: string) => {
    onChange(items.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-bold text-foreground">Projects & Portfolio</h3>
          <p className="text-xs text-muted-foreground">
            Feature open source contributions, commercial projects, and high-impact products.
          </p>
        </div>
        <Button onClick={handleAddNew} size="sm" className="gap-1.5 text-xs">
          <Plus className="h-4 w-4" /> Add Project
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 border border-dashed rounded-xl space-y-2">
          <FolderGit2 className="h-7 w-7 text-muted-foreground mx-auto" />
          <p className="text-xs text-muted-foreground">No projects added yet.</p>
          <Button onClick={handleAddNew} variant="outline" size="sm" className="gap-1 text-xs">
            <Plus className="h-3.5 w-3.5" /> Add Project
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
                      {item.title || "Untitled Project"}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate max-w-sm">
                      {item.description || "No description"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(item.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-border/50 space-y-3 mt-3 animate-in fade-in-50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
                          Project Title
                        </label>
                        <Input
                          value={item.title}
                          onChange={(e) => handleUpdate(item.id, { title: e.target.value })}
                          placeholder="e.g., PulseFlow AI Copilot"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
                          Live URL or GitHub Link
                        </label>
                        <Input
                          value={item.link || ""}
                          onChange={(e) => handleUpdate(item.id, { link: e.target.value })}
                          placeholder="https://github.com/username/project"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
                        Technologies Used (Comma-separated)
                      </label>
                      <Input
                        value={item.technologies?.join(", ") || ""}
                        onChange={(e) =>
                          handleUpdate(item.id, {
                            technologies: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                          })
                        }
                        placeholder="e.g., Next.js 15, TypeScript, Tailwind CSS, PostgreSQL"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
                        Project Summary & Impact
                      </label>
                      <Textarea
                        rows={3}
                        value={item.description}
                        onChange={(e) => handleUpdate(item.id, { description: e.target.value })}
                        placeholder="Describe the architectural highlights, problem solved, and key metrics achieved..."
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
