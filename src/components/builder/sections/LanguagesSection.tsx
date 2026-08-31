"use client";

import React, { useState } from "react";
import { LanguageItem } from "@/lib/types/resume";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateId } from "@/lib/utils";
import { Languages, Plus, Trash2 } from "lucide-react";
import { AiRewriteButton } from "@/components/builder/ai/AiRewriteButton";
import { SectionRewriteModal } from "@/components/builder/ai/SectionRewriteModal";

interface Props {
  items: LanguageItem[];
  onChange: (items: LanguageItem[]) => void;
}

const PROFICIENCIES: LanguageItem["proficiency"][] = [
  "Native",
  "Fluent",
  "Proficient",
  "Intermediate",
  "Basic",
];

export function LanguagesSection({ items, onChange }: Props) {
  const [rewrite, setRewrite] = useState<{
    id: string;
    text: string;
  } | null>(null);

  const handleAddNew = () => {
    const newItem: LanguageItem = {
      id: "lang_" + generateId(),
      language: "",
      proficiency: "Fluent",
    };
    onChange([...items, newItem]);
  };

  const handleUpdate = (id: string, updated: Partial<LanguageItem>) => {
    onChange(items.map((l) => (l.id === id ? { ...l, ...updated } : l)));
  };

  const handleRemove = (id: string) => {
    onChange(items.filter((l) => l.id !== id));
  };

  const applyLanguageRewrite = (id: string, rewritten: string) => {
    const cleaned = rewritten.replace(/^[-•*\d.)\s]+/, "").trim();
    const parts = cleaned.split(/[—–\-|:]/).map((p) => p.trim()).filter(Boolean);
    const language = parts[0] || cleaned;
    const levelRaw = (parts[1] || "").toLowerCase();
    const proficiency =
      PROFICIENCIES.find((p) => levelRaw.includes(p.toLowerCase())) || undefined;
    handleUpdate(id, {
      language,
      ...(proficiency ? { proficiency } : {}),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-bold text-foreground">Languages</h3>
          <p className="text-xs text-muted-foreground">
            Highlight spoken and written language competencies.
          </p>
        </div>
        <Button onClick={handleAddNew} size="sm" className="gap-1.5 text-xs">
          <Plus className="h-4 w-4" /> Add Language
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-6 border border-dashed rounded-xl space-y-2">
          <Languages className="h-6 w-6 text-muted-foreground mx-auto" />
          <p className="text-xs text-muted-foreground">No languages added yet.</p>
          <Button onClick={handleAddNew} variant="outline" size="sm" className="gap-1 text-xs">
            <Plus className="h-3.5 w-3.5" /> Add Language
          </Button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-2 p-2.5 rounded-xl border bg-card">
              <Input
                value={item.language}
                onChange={(e) => handleUpdate(item.id, { language: e.target.value })}
                placeholder="Language (e.g., English, Spanish, German)"
                className="text-xs h-8 flex-1"
              />
              <select
                value={item.proficiency}
                onChange={(e) =>
                  handleUpdate(item.id, {
                    proficiency: e.target.value as LanguageItem["proficiency"],
                  })
                }
                className="h-8 rounded-md border border-input bg-background px-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {PROFICIENCIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <AiRewriteButton
                disabled={!item.language.trim()}
                onClick={() =>
                  setRewrite({
                    id: item.id,
                    text: `${item.language} — ${item.proficiency}`,
                  })
                }
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0"
                onClick={() => handleRemove(item.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <SectionRewriteModal
        isOpen={Boolean(rewrite)}
        onClose={() => setRewrite(null)}
        initialText={rewrite?.text || ""}
        sectionType="language"
        onApply={(t) => {
          if (rewrite) applyLanguageRewrite(rewrite.id, t);
        }}
      />
    </div>
  );
}
