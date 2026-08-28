"use client";

import React, { useState } from "react";
import { CustomSectionEntry } from "@/lib/types/resume";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { generateId } from "@/lib/utils";
import { Plus, Trash2, Edit2, Check, Layers } from "lucide-react";

interface Props {
  section: CustomSectionEntry;
  onUpdateSection: (updated: Partial<CustomSectionEntry>) => void;
  onRemoveSection: () => void;
  onRenameTitle: (newTitle: string) => void;
}

export function CustomSectionEditor({
  section,
  onUpdateSection,
  onRemoveSection,
  onRenameTitle,
}: Props) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(section.sectionTitle);

  const handleTitleSave = () => {
    setIsEditingTitle(false);
    if (titleValue.trim() && titleValue !== section.sectionTitle) {
      onRenameTitle(titleValue.trim());
      onUpdateSection({ sectionTitle: titleValue.trim() });
    }
  };

  const handleAddItem = () => {
    const newItem = {
      id: "citem_" + generateId(),
      title: "Title / Activity",
      subtitle: "Organization / Location",
      date: "2024",
      description: "Description of accomplishment or activity...",
    };
    onUpdateSection({ items: [...section.items, newItem] });
  };

  const handleUpdateItem = (itemId: string, updated: Partial<(typeof section.items)[0]>) => {
    onUpdateSection({
      items: section.items.map((item) => (item.id === itemId ? { ...item, ...updated } : item)),
    });
  };

  const handleRemoveItem = (itemId: string) => {
    onUpdateSection({
      items: section.items.filter((item) => item.id !== itemId),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center pb-2 border-b">
        <div className="flex items-center gap-2">
          {isEditingTitle ? (
            <div className="flex items-center gap-1.5">
              <Input
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => e.key === "Enter" && handleTitleSave()}
                className="h-8 font-bold text-sm"
                autoFocus
              />
              <Button size="icon" variant="ghost" onClick={handleTitleSave} className="h-8 w-8">
                <Check className="h-4 w-4 text-emerald-500" />
              </Button>
            </div>
          ) : (
            <h3
              onClick={() => setIsEditingTitle(true)}
              className="text-base font-bold text-foreground cursor-pointer hover:text-primary transition-colors flex items-center gap-2"
            >
              {section.sectionTitle}
              <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
            </h3>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleAddItem} size="sm" className="gap-1.5 text-xs">
            <Plus className="h-4 w-4" /> Add Item
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemoveSection}
            className="text-xs text-destructive hover:bg-destructive/10"
          >
            Delete Section
          </Button>
        </div>
      </div>

      {section.items.length === 0 ? (
        <div className="text-center py-6 border border-dashed rounded-xl space-y-2">
          <Layers className="h-6 w-6 text-muted-foreground mx-auto" />
          <p className="text-xs text-muted-foreground">No entries in this custom section.</p>
          <Button onClick={handleAddItem} variant="outline" size="sm" className="gap-1 text-xs">
            <Plus className="h-3.5 w-3.5" /> Add First Entry
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {section.items.map((item) => (
            <div key={item.id} className="p-4 rounded-xl border bg-card space-y-3 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <Input
                  value={item.title}
                  onChange={(e) => handleUpdateItem(item.id, { title: e.target.value })}
                  placeholder="Title / Name of Activity"
                  className="font-semibold text-xs h-8"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Input
                  value={item.subtitle || ""}
                  onChange={(e) => handleUpdateItem(item.id, { subtitle: e.target.value })}
                  placeholder="Subtitle / Organization / Role"
                  className="text-xs h-8"
                />
                <Input
                  value={item.date || ""}
                  onChange={(e) => handleUpdateItem(item.id, { date: e.target.value })}
                  placeholder="Date / Year (e.g. 2024)"
                  className="text-xs h-8"
                />
              </div>

              <Textarea
                rows={2}
                value={item.description || ""}
                onChange={(e) => handleUpdateItem(item.id, { description: e.target.value })}
                placeholder="Description / Key details..."
                className="text-xs"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
