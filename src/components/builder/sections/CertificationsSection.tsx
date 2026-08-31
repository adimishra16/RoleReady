"use client";

import React, { useState } from "react";
import { CertificationItem } from "@/lib/types/resume";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateId } from "@/lib/utils";
import { Award, Plus, Trash2 } from "lucide-react";
import { AiRewriteButton } from "@/components/builder/ai/AiRewriteButton";
import { SectionRewriteModal } from "@/components/builder/ai/SectionRewriteModal";

interface Props {
  items: CertificationItem[];
  onChange: (items: CertificationItem[]) => void;
}

export function CertificationsSection({ items, onChange }: Props) {
  const [rewrite, setRewrite] = useState<{
    id: string;
    text: string;
    meta?: string;
  } | null>(null);

  const handleAddNew = () => {
    const newItem: CertificationItem = {
      id: "cert_" + generateId(),
      name: "",
      issuer: "",
      issueDate: "",
    };
    onChange([...items, newItem]);
  };

  const handleUpdate = (id: string, updated: Partial<CertificationItem>) => {
    onChange(items.map((c) => (c.id === id ? { ...c, ...updated } : c)));
  };

  const handleRemove = (id: string) => {
    onChange(items.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-bold text-foreground">Certifications & Licenses</h3>
          <p className="text-xs text-muted-foreground">
            Include professional credentials, cloud certifications (AWS, GCP), and courses.
          </p>
        </div>
        <Button onClick={handleAddNew} size="sm" className="gap-1.5 text-xs">
          <Plus className="h-4 w-4" /> Add Certification
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-6 border border-dashed rounded-xl space-y-2">
          <Award className="h-6 w-6 text-muted-foreground mx-auto" />
          <p className="text-xs text-muted-foreground">No certifications added yet.</p>
          <Button onClick={handleAddNew} variant="outline" size="sm" className="gap-1 text-xs">
            <Plus className="h-3.5 w-3.5" /> Add First Credential
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="p-3.5 rounded-xl border bg-card space-y-3">
              <div className="flex items-center justify-between gap-2">
                <Input
                  value={item.name}
                  onChange={(e) => handleUpdate(item.id, { name: e.target.value })}
                  placeholder="Certification Name (e.g., AWS Solutions Architect)"
                  className="font-semibold text-xs h-8"
                />
                <div className="flex items-center gap-1 shrink-0">
                  <AiRewriteButton
                    disabled={!item.name.trim()}
                    onClick={() =>
                      setRewrite({
                        id: item.id,
                        text: item.name,
                        meta: item.issuer || undefined,
                      })
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={() => handleRemove(item.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Input
                  value={item.issuer}
                  onChange={(e) => handleUpdate(item.id, { issuer: e.target.value })}
                  placeholder="Issuer (e.g., Amazon Web Services)"
                  className="text-xs h-8"
                />
                <Input
                  type="month"
                  value={item.issueDate}
                  onChange={(e) => handleUpdate(item.id, { issueDate: e.target.value })}
                  className="text-xs h-8"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <SectionRewriteModal
        isOpen={Boolean(rewrite)}
        onClose={() => setRewrite(null)}
        initialText={rewrite?.text || ""}
        sectionType="certification"
        meta={rewrite?.meta}
        onApply={(t) => {
          if (rewrite) handleUpdate(rewrite.id, { name: t.trim() });
        }}
      />
    </div>
  );
}
