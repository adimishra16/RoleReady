"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ResumeData } from "@/lib/types/resume";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { scoreResumeAts } from "@/lib/ats/score-resume";
import { aiLockMessage, readAiError, useAiAccess } from "@/lib/hooks/useAiAccess";
import {
  CheckCircle2,
  Circle,
  Gauge,
  Loader2,
  Lock,
  Sparkles,
  Lightbulb,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: ResumeData;
}

type AiResult = {
  score: number;
  grade: string;
  strengths: string[];
  improvements: string[];
  summary: string;
  source: "ai" | "heuristic";
};

export function AtsScoreModal({ isOpen, onClose, data }: Props) {
  const [targetRole, setTargetRole] = useState(data.personalInfo?.jobTitle || "");
  const quick = useMemo(
    () => scoreResumeAts(data, { targetRole }),
    [data, targetRole]
  );
  const [aiResult, setAiResult] = useState<AiResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { status: aiStatus, refresh: refreshAiStatus } = useAiAccess(isOpen);
  const lockMessage = aiLockMessage(aiStatus);
  const otherRemaining = aiStatus?.other.remaining ?? 0;
  const aiLocked = Boolean(lockMessage) || otherRemaining <= 0;

  const display = aiResult
    ? { score: aiResult.score, grade: aiResult.grade, summary: aiResult.summary }
    : { score: quick.score, grade: quick.grade, summary: quick.summary };

  const barColor =
    display.score >= 85
      ? "bg-emerald-500"
      : display.score >= 70
        ? "bg-teal-600"
        : display.score >= 50
          ? "bg-amber-500"
          : "bg-rose-500";

  const handleCheckWithAi = async () => {
    if (aiLocked) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ai/ats-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: data,
          targetRole: targetRole.trim() || data.personalInfo?.jobTitle,
        }),
      });
      if (!response.ok) throw new Error(await readAiError(response));
      const json = (await response.json()) as AiResult;
      setAiResult({
        ...json,
        score: Math.max(0, Math.min(100, Math.round(Number(json.score) || 0))),
      });
      void refreshAiStatus();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "AI ATS check failed.";
      setError(message);
      void refreshAiStatus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} className="max-w-lg max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Gauge className="h-5 w-5 text-teal-700" />
          Role-based ATS Score
        </DialogTitle>
        <DialogDescription>
          Score out of 100 for your target role. Instant checklist is free;{" "}
          <strong>Check with AI</strong> needs the ₹59/mo AI plan.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-5 my-2">
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
            Target role
          </label>
          <Input
            value={targetRole}
            onChange={(e) => {
              setTargetRole(e.target.value);
              setAiResult(null);
            }}
            placeholder="e.g. Full Stack Engineer, Product Manager"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            Scoring uses role keywords (skills, tools, verbs) for this title.
          </p>
        </div>

        <div className="rounded-2xl border bg-muted/30 p-5 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Score out of 100
            </p>
            {targetRole.trim() && (
              <Badge variant="outline" className="text-[10px]">
                {targetRole.trim()}
              </Badge>
            )}
            {aiResult && (
              <Badge
                variant="outline"
                className="text-[10px] border-teal-600/30 text-teal-800 dark:text-teal-300"
              >
                {aiResult.source === "ai" ? "AI reviewed" : "Fallback"}
              </Badge>
            )}
          </div>
          <p className="text-5xl sm:text-6xl font-black tracking-tight text-foreground tabular-nums">
            {display.score}
            <span className="text-2xl sm:text-3xl font-bold text-muted-foreground">/100</span>
          </p>
          <Badge
            variant="outline"
            className={
              display.score >= 70
                ? "border-teal-600/40 text-teal-800 dark:text-teal-300"
                : "border-amber-500/40 text-amber-800 dark:text-amber-300"
            }
          >
            {display.grade}
          </Badge>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
              style={{ width: `${display.score}%` }}
              role="progressbar"
              aria-valuenow={display.score}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <p className="text-xs text-muted-foreground">{display.summary}</p>

          {(quick.roleKeywordsMatched.length > 0 || quick.roleKeywordsMissing.length > 0) && (
            <div className="text-left space-y-2 pt-1">
              {quick.roleKeywordsMatched.length > 0 && (
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  Matched: {quick.roleKeywordsMatched.slice(0, 8).join(", ")}
                </p>
              )}
              {quick.roleKeywordsMissing.length > 0 && (
                <p className="text-[11px] text-amber-800 dark:text-amber-300">
                  Missing: {quick.roleKeywordsMissing.slice(0, 8).join(", ")}
                </p>
              )}
            </div>
          )}

          <div className="pt-1 space-y-2">
            {lockMessage ? (
              <div className="space-y-2">
                <p className="text-[11px] text-amber-800 dark:text-amber-200 flex items-center justify-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" /> {lockMessage}
                </p>
                <Link href="/pricing">
                  <Button size="sm" className="bg-teal-700 hover:bg-teal-800 text-white gap-1.5">
                    Unlock AI · ₹59/mo
                  </Button>
                </Link>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={handleCheckWithAi}
                disabled={isLoading || aiLocked}
                className="gap-1.5 bg-teal-700 hover:bg-teal-800 text-white"
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                {isLoading ? "Checking with AI…" : "Check with AI"}
                {!aiLocked && (
                  <span className="opacity-80 text-[10px]">({otherRemaining} left)</span>
                )}
              </Button>
            )}
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        </div>

        {aiResult && (
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border p-3 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Strengths
              </p>
              <ul className="space-y-1.5">
                {(aiResult.strengths.length ? aiResult.strengths : ["—"]).map((s, i) => (
                  <li key={i} className="text-xs text-muted-foreground leading-relaxed">
                    • {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border p-3 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1">
                <Lightbulb className="h-3.5 w-3.5" /> Improvements
              </p>
              <ul className="space-y-1.5">
                {(aiResult.improvements.length ? aiResult.improvements : ["—"]).map((s, i) => (
                  <li key={i} className="text-xs text-muted-foreground leading-relaxed">
                    • {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Checklist
            </h3>
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {quick.score} / 100
            </span>
          </div>
          <ul className="space-y-2">
            {quick.checks.map((c) => (
              <li
                key={c.id}
                className={`flex gap-2.5 rounded-xl border px-3 py-2.5 text-xs ${
                  c.passed ? "bg-emerald-500/5 border-emerald-500/20" : "bg-card border-border"
                }`}
              >
                {c.passed ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-foreground">{c.label}</p>
                    <span
                      className={`shrink-0 tabular-nums font-bold ${
                        c.passed ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"
                      }`}
                    >
                      {c.id === "role_align"
                        ? `/${c.points}`
                        : c.passed
                          ? `+${c.points}`
                          : `0/${c.points}`}
                    </span>
                  </div>
                  {!c.passed && (
                    <p className="text-muted-foreground mt-0.5 leading-relaxed">{c.tip}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
