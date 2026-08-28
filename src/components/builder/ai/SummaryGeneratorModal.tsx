"use client";

import React, { useState } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Check, Wand2, Loader2, ArrowRight, Lock } from "lucide-react";
import { ResumeData } from "@/lib/types/resume";
import { appendAiDataStreamText, stripAiStreamArtifacts } from "@/lib/ai/parse-data-stream";
import { aiLockMessage, readAiError, useAiAccess } from "@/lib/hooks/useAiAccess";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  resumeData: ResumeData;
  onApply: (summary: string) => void;
}

export function SummaryGeneratorModal({
  isOpen,
  onClose,
  resumeData,
  onApply,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { status: aiStatus, refresh: refreshAiStatus } = useAiAccess(isOpen);
  const lockMessage = aiLockMessage(aiStatus);
  const otherRemaining = aiStatus?.other.remaining ?? 0;
  const aiLocked = Boolean(lockMessage) || otherRemaining <= 0;

  const handleGenerate = async () => {
    if (aiLocked) return;
    setIsLoading(true);
    setError(null);
    setGeneratedSummary("");

    try {
      const response = await fetch("/api/ai/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: resumeData.personalInfo.jobTitle,
          experiences: resumeData.workExperience,
          skills: resumeData.skills.flatMap((s) => s.skills),
        }),
      });

      if (!response.ok) throw new Error(await readAiError(response));
      if (!response.body) throw new Error("No response received");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated = appendAiDataStreamText(accumulated, chunk);
        setGeneratedSummary(stripAiStreamArtifacts(accumulated));
      }
      void refreshAiStatus();
    } catch (err: any) {
      setError(err.message || "Failed to generate summary.");
      void refreshAiStatus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} className="max-w-xl">
      <DialogHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle>AI Executive Summary Generator</DialogTitle>
            <DialogDescription>
              Synthesizes your experience, skills, and target job title into a high-impact professional overview.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-4 my-3">
        {aiStatus && (
          <div className="flex items-center justify-between gap-2 text-[11px] rounded-lg border bg-muted/30 px-3 py-2">
            <span className="text-muted-foreground">
              AI credits left:{" "}
              <span className="font-semibold text-foreground tabular-nums">
                {aiStatus.other.remaining}/{aiStatus.other.limit}
              </span>
            </span>
            {aiLocked && (
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                <Lock className="h-3 w-3" /> Locked
              </span>
            )}
          </div>
        )}
        {lockMessage && (
          <div className="p-3 text-xs rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200">
            {lockMessage}
          </div>
        )}

        <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-1">
          <p className="font-medium text-foreground">
            Target Role: <span className="font-normal text-muted-foreground">{resumeData.personalInfo.jobTitle || "Not specified"}</span>
          </p>
          <p className="font-medium text-foreground">
            Experiences Detected: <span className="font-normal text-muted-foreground">{resumeData.workExperience.length} positions</span>
          </p>
        </div>

        {!generatedSummary && !isLoading && (
          <div className="text-center py-6 border border-dashed rounded-xl space-y-3">
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Click generate to analyze your background and craft a compelling 3-4 sentence career summary.
            </p>
            <Button onClick={handleGenerate} disabled={aiLocked} variant="gradient" size="sm" className="gap-2">
              {aiLocked ? <Lock className="h-4 w-4" /> : <Wand2 className="h-4 w-4" />}
              {aiLocked ? "AI Locked" : "Generate Executive Summary"}
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="p-4 rounded-xl border bg-card space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <Loader2 className="h-4 w-4 animate-spin" />
              Streaming Summary...
            </div>
            <p className="text-xs text-foreground leading-relaxed italic min-h-[60px]">
              {generatedSummary || "Analyzing experience highlights..."}
            </p>
          </div>
        )}

        {generatedSummary && !isLoading && (
          <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3 animate-in fade-in-50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Generated Summary
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGenerate}
                disabled={aiLocked}
                className="h-7 text-xs text-muted-foreground gap-1"
              >
                <Wand2 className="h-3 w-3" /> Regenerate
              </Button>
            </div>
            <p className="text-xs text-foreground leading-relaxed">
              {generatedSummary}
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 text-xs text-destructive bg-destructive/10 rounded-lg">
            {error}
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} size="sm">
          Cancel
        </Button>
        {generatedSummary && (
          <Button
            onClick={() => {
              onApply(generatedSummary);
              onClose();
            }}
            size="sm"
            className="gap-1.5"
          >
            <Check className="h-4 w-4" />
            Apply to Resume
          </Button>
        )}
      </DialogFooter>
    </Dialog>
  );
}
