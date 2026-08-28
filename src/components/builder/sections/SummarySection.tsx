"use client";

import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Wand2 } from "lucide-react";
import { SummaryGeneratorModal } from "@/components/builder/ai/SummaryGeneratorModal";
import { ResumeData } from "@/lib/types/resume";

interface Props {
  summary: string;
  onChange: (text: string) => void;
  resumeData: ResumeData;
}

export function SummarySection({ summary, onChange, resumeData }: Props) {
  const [isAiOpen, setIsAiOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-foreground">Professional Summary</h3>
          <p className="text-xs text-muted-foreground">
            A concise 2-4 sentence hook summarizing your value proposition, experience, and key skills.
          </p>
        </div>
        <Button
          onClick={() => setIsAiOpen(true)}
          variant="gradient"
          size="sm"
          className="gap-1.5 text-xs"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Generate with AI
        </Button>
      </div>

      <div>
        <Textarea
          rows={5}
          value={summary}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g., Results-driven Senior Full Stack Engineer with 6+ years of experience architecting distributed cloud platforms and AI systems..."
          className="text-sm leading-relaxed"
        />
        <div className="flex justify-between items-center mt-1.5 text-[11px] text-muted-foreground">
          <span>Tip: Focus on quantifiable impact and primary tech strengths.</span>
          <span>{summary?.length || 0} characters</span>
        </div>
      </div>

      <SummaryGeneratorModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        resumeData={resumeData}
        onApply={(generated) => onChange(generated)}
      />
    </div>
  );
}
