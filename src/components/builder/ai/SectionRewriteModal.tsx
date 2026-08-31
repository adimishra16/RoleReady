"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Check, Copy, Wand2, Loader2, ArrowRight, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { appendAiDataStreamText, stripAiStreamArtifacts } from "@/lib/ai/parse-data-stream";
import { parseBulletVariations } from "@/lib/ai/parse-bullet-variations";
import { aiLockMessage, readAiError, useAiAccess } from "@/lib/hooks/useAiAccess";

export type RewriteSectionType =
  | "job_title"
  | "summary"
  | "project"
  | "education"
  | "skills"
  | "certification"
  | "language"
  | "custom"
  | "experience_bullet";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialText: string;
  sectionType: RewriteSectionType;
  /** Short label shown in the dialog title */
  title?: string;
  /** Extra context for the model (role, company, etc.) */
  meta?: string;
  onApply: (text: string) => void;
}

const PROMPT_HINT_MAX = 20;

const DEFAULT_TITLES: Record<RewriteSectionType, string> = {
  job_title: "Job Title",
  summary: "Professional Summary",
  project: "Project Description",
  education: "Education",
  skills: "Skills",
  certification: "Certification",
  language: "Language",
  custom: "Custom Section",
  experience_bullet: "Experience Bullet",
};

export function SectionRewriteModal({
  isOpen,
  onClose,
  initialText,
  sectionType,
  title,
  meta,
  onApply,
}: Props) {
  const [text, setText] = useState(initialText);
  const [promptHint, setPromptHint] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { status: aiStatus, refresh: refreshAiStatus } = useAiAccess(isOpen);
  const lockMessage = aiLockMessage(aiStatus);
  const rewriteRemaining = aiStatus?.rewrite.remaining ?? 0;
  const aiLocked = Boolean(lockMessage) || rewriteRemaining <= 0;

  React.useEffect(() => {
    setText(initialText);
    setPromptHint("");
    setStreamedText("");
    setError(null);
  }, [initialText, isOpen]);

  const handleRewrite = async () => {
    if (!text.trim() || aiLocked) return;
    setIsLoading(true);
    setError(null);
    setStreamedText("");

    try {
      const response = await fetch("/api/ai/rewrite-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          sectionType,
          meta,
          context: promptHint.trim().slice(0, PROMPT_HINT_MAX) || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(await readAiError(response));
      }

      if (!response.body) {
        throw new Error("No response body received");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated = appendAiDataStreamText(accumulated, chunk);
        setStreamedText(stripAiStreamArtifacts(accumulated));
      }
      void refreshAiStatus();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred while rewriting.";
      setError(message);
      void refreshAiStatus();
    } finally {
      setIsLoading(false);
    }
  };

  const variations = streamedText ? parseBulletVariations(streamedText) : [];

  const handleCopy = (value: string, idx: number) => {
    void navigator.clipboard.writeText(value);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const dialogTitle = title || DEFAULT_TITLES[sectionType];

  return (
    <Dialog open={isOpen} onOpenChange={onClose} className="max-w-2xl">
      <DialogHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="flex items-center gap-2">
              AI Rewrite — {dialogTitle}
              <Badge variant="ai">3 variations</Badge>
            </DialogTitle>
            <DialogDescription>
              Polish this section for clarity, impact, and ATS-friendly wording.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-4 my-2">
        {aiStatus && (
          <div className="flex items-center justify-between gap-2 text-[11px] rounded-lg border bg-muted/30 px-3 py-2">
            <span className="text-muted-foreground">
              Rewrites left:{" "}
              <span className="font-semibold text-foreground tabular-nums">
                {aiStatus.rewrite.remaining}/{aiStatus.rewrite.limit}
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

        {!lockMessage && aiStatus && rewriteRemaining <= 0 && (
          <div className="p-3 text-xs rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200">
            You have used all {aiStatus.rewrite.limit} AI rewrites for your account.
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
            Current text
          </label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={sectionType === "summary" ? 4 : 3}
            className="text-sm resize-none bg-muted/30"
          />
          {meta && (
            <p className="text-[11px] text-muted-foreground mt-1">
              Context: <span className="font-medium text-foreground">{meta}</span>
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Prompt hint <span className="normal-case font-normal">(optional)</span>
            </label>
            <span className="text-[10px] text-muted-foreground tabular-nums">
              {promptHint.length}/{PROMPT_HINT_MAX}
            </span>
          </div>
          <Input
            value={promptHint}
            onChange={(e) => setPromptHint(e.target.value.slice(0, PROMPT_HINT_MAX))}
            maxLength={PROMPT_HINT_MAX}
            placeholder="e.g. senior tone, metrics"
            className="text-sm bg-muted/30"
          />
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleRewrite}
            disabled={isLoading || !text.trim() || aiLocked}
            variant="gradient"
            size="sm"
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Rewriting…
              </>
            ) : aiLocked ? (
              <>
                <Lock className="h-4 w-4" />
                AI Locked
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Generate variations
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="p-3 text-xs text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
            {error}
          </div>
        )}

        {isLoading && !streamedText && (
          <div className="p-6 rounded-xl border border-dashed text-center space-y-2 animate-pulse">
            <Sparkles className="h-6 w-6 text-teal-600 mx-auto animate-bounce" />
            <p className="text-xs text-muted-foreground">Crafting polished variations…</p>
          </div>
        )}

        {streamedText && (
          <div className="space-y-3 mt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Suggested improvements
            </h4>
            {variations.length > 0 ? (
              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                {variations.map((variation, idx) => (
                  <div
                    key={idx}
                    className="group p-3.5 rounded-xl border border-border bg-card hover:border-teal-500/50 transition-all"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Badge variant="outline" className="text-[10px] font-semibold">
                        Variation {idx + 1}
                      </Badge>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(variation.content, idx)}
                          className="h-7 px-2 text-xs gap-1"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-500" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              Copy
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            onApply(variation.content);
                            onClose();
                          }}
                          className="h-7 px-2.5 text-xs bg-teal-700 hover:bg-teal-800 text-white gap-1"
                        >
                          Apply
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                      {variation.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-lg border bg-muted/20 text-xs whitespace-pre-wrap">
                {streamedText}
              </div>
            )}
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} size="sm">
          Close
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
