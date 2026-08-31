"use client";

import React, { useState } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Target, CheckCircle2, XCircle, Lightbulb, Loader2, Sparkles, Plus, Lock } from "lucide-react";
import { ResumeData, JobMatchResult } from "@/lib/types/resume";
import { aiLockMessage, readAiError, useAiAccess } from "@/lib/hooks/useAiAccess";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  resumeData: ResumeData;
  onAddMissingSkill: (skill: string) => void;
}

export function JobMatcherDrawer({
  isOpen,
  onClose,
  resumeData,
  onAddMissingSkill,
}: Props) {
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<JobMatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addedSkills, setAddedSkills] = useState<string[]>([]);
  const { status: aiStatus, refresh: refreshAiStatus } = useAiAccess(isOpen);
  const lockMessage = aiLockMessage(aiStatus);
  const otherRemaining = aiStatus?.other.remaining ?? 0;
  const aiLocked = Boolean(lockMessage) || otherRemaining <= 0;

  const handleAnalyze = async () => {
    if (!jobDescription.trim() || aiLocked) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/match-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          resumeData,
        }),
      });

      if (!response.ok) throw new Error(await readAiError(response));
      const data = await response.json();
      setResult(data);
      void refreshAiStatus();
    } catch (err: any) {
      setError(err.message || "Failed to analyze job description.");
      void refreshAiStatus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAdd = (skill: string) => {
    onAddMissingSkill(skill);
    setAddedSkills((prev) => [...prev, skill]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} className="max-w-2xl">
      <DialogHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle>ATS Job Description Matcher</DialogTitle>
            <DialogDescription>
              Compare your resume against any job description to discover missing ATS keywords and boost your match rate.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-4 my-2">
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

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
            Paste Job Description / Requirements
          </label>
          <Textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={4}
            placeholder="Paste requirements, required skills, and job description here..."
            className="text-xs"
          />
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleAnalyze}
            disabled={isLoading || !jobDescription.trim() || aiLocked}
            variant="default"
            size="sm"
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Scanning with ATS Engine...
              </>
            ) : aiLocked ? (
              <>
                <Lock className="h-4 w-4" />
                AI Locked
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Calculate ATS Match Score
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="p-3 text-xs text-destructive bg-destructive/10 rounded-lg">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-4 pt-2 border-t">
            {/* Match Score Bar */}
            <div className="p-4 rounded-xl border bg-card flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Estimated ATS Match Score</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-black text-foreground">{result.matchScore}%</span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    {result.matchScore >= 80 ? "Strong Match" : result.matchScore >= 60 ? "Moderate Match" : "Needs Optimization"}
                  </span>
                </div>
              </div>
              <div className="w-28 bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    result.matchScore >= 80
                      ? "bg-emerald-500"
                      : result.matchScore >= 60
                      ? "bg-amber-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${result.matchScore}%` }}
                />
              </div>
            </div>

            {/* Missing Keywords (Interactive Checklist) */}
            <div className="p-4 rounded-xl border bg-card space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-destructive uppercase tracking-wider">
                <XCircle className="h-4 w-4" />
                <span>Missing Key Hard Skills / Keywords ({result.missingKeywords.length})</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Click "+ Add to Skills" to instantly incorporate missing keywords into your resume.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {result.missingKeywords.map((keyword) => {
                  const isAdded = addedSkills.includes(keyword);
                  return (
                    <button
                      key={keyword}
                      onClick={() => !isAdded && handleQuickAdd(keyword)}
                      disabled={isAdded}
                      className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border transition-all ${
                        isAdded
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-destructive/5 text-destructive border-destructive/20 hover:bg-destructive/15"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Added: {keyword}</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-3 w-3" />
                          <span>{keyword}</span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Matching Keywords */}
            {result.matchingKeywords?.length > 0 && (
              <div className="p-3.5 rounded-xl border bg-card space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Matching Keywords Found ({result.matchingKeywords.length})</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {result.matchingKeywords.map((k) => (
                    <Badge key={k} variant="success" className="text-[11px]">
                      {k}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations?.length > 0 && (
              <div className="p-3.5 rounded-xl border bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/40 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  <Lightbulb className="h-4 w-4" />
                  <span>Optimization Tips</span>
                </div>
                <ul className="list-disc list-outside ml-4 space-y-1 text-xs text-foreground/90">
                  {result.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
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
