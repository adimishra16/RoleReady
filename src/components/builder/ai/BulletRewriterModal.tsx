"use client";

import React, { useState } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Check, Copy, Wand2, Loader2, ArrowRight, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { appendAiDataStreamText, stripAiStreamArtifacts } from "@/lib/ai/parse-data-stream";
import { parseBulletVariations } from "@/lib/ai/parse-bullet-variations";
import { aiLockMessage, readAiError, useAiAccess } from "@/lib/hooks/useAiAccess";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialBullet: string;
  jobTitle?: string;
  company?: string;
  onApply: (newBullet: string) => void;
}

const PROMPT_HINT_MAX = 20;

export function BulletRewriterModal({
  isOpen,
  onClose,
  initialBullet,
  jobTitle,
  company,
  onApply,
}: Props) {
  const [bullet, setBullet] = useState(initialBullet);
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
    setBullet(initialBullet);
    setPromptHint("");
    setStreamedText("");
    setError(null);
  }, [initialBullet, isOpen]);

  const handleRewrite = async () => {
    if (!bullet.trim() || aiLocked) return;
    setIsLoading(true);
    setError(null);
    setStreamedText("");

    try {
      const response = await fetch("/api/ai/rewrite-bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bullet,
          jobTitle,
          company,
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
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while rewriting.");
      void refreshAiStatus();
    } finally {
      setIsLoading(false);
    }
  };

  const variations = streamedText ? parseBulletVariations(streamedText) : [];

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} className="max-w-2xl">
      <DialogHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="flex items-center gap-2">
              AI Bullet Point Enhancer
              <Badge variant="ai">STAR / XYZ Formula</Badge>
            </DialogTitle>
            <DialogDescription>
              Transform your bullet point into a high-impact, quantified achievement statement.
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
            Current Bullet Point
          </label>
          <Textarea
            value={bullet}
            onChange={(e) => setBullet(e.target.value)}
            rows={2}
            placeholder="e.g., Built frontend features with React and improved performance"
            className="text-sm resize-none bg-muted/30"
          />
          {jobTitle && (
            <p className="text-[11px] text-muted-foreground mt-1">
              Optimizing for: <span className="font-medium text-foreground">{jobTitle}</span> at{" "}
              <span className="font-medium text-foreground">{company || "Company"}</span>
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
            placeholder="e.g. led team, cut costs"
            className="text-sm bg-muted/30"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            Add up to 20 characters to steer the rewrite (metric, skill, or focus).
          </p>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleRewrite}
            disabled={isLoading || !bullet.trim() || aiLocked}
            variant="gradient"
            size="sm"
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Rewriting with AI...
              </>
            ) : aiLocked ? (
              <>
                <Lock className="h-4 w-4" />
                AI Locked
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Generate High-Impact Variations
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="p-3 text-xs text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
            {error}
          </div>
        )}

        {/* Streaming / Result Variations */}
        {isLoading && !streamedText && (
          <div className="p-6 rounded-xl border border-dashed text-center space-y-2 animate-pulse">
            <Sparkles className="h-6 w-6 text-purple-500 mx-auto animate-bounce" />
            <p className="text-xs text-muted-foreground">
              Formulating action verbs & metrics using STAR / Google XYZ formula...
            </p>
          </div>
        )}

        {streamedText && (
          <div className="space-y-3 mt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Suggested Improvements</span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-normal">
                Click "Apply" on any version to insert
              </span>
            </h4>

            {variations.length > 0 ? (
              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                {variations.map((variation, idx) => (
                    <div
                      key={idx}
                      className="group p-3.5 rounded-xl border border-border bg-card hover:border-purple-400/60 hover:shadow-sm transition-all duration-150 relative"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <Badge variant="outline" className="text-[10px] font-semibold text-purple-600 dark:text-purple-300">
                          {variation.tag.replace(/^Option \d+/, `Variation ${idx + 1}`)}
                        </Badge>
                        <div className="flex items-center gap-1.5 opacity-90">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(variation.content, idx)}
                            className="h-7 px-2 text-xs gap-1"
                          >
                            {copiedIndex === idx ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-500" />
                                <span className="text-emerald-500">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                Copy
                              </>
                            )}
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              onApply(variation.content);
                              onClose();
                            }}
                            className="h-7 px-2.5 text-xs bg-purple-600 hover:bg-purple-700 text-white gap-1"
                          >
                            Apply
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-foreground leading-relaxed">{variation.content}</p>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="p-3 rounded-lg border bg-muted/20 text-xs text-foreground whitespace-pre-wrap leading-relaxed">
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
