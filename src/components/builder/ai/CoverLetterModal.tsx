"use client";

import React, { useState } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Copy, Check, Wand2, Loader2, Download, Lock } from "lucide-react";
import { ResumeData } from "@/lib/types/resume";
import { appendAiDataStreamText, stripAiStreamArtifacts } from "@/lib/ai/parse-data-stream";
import { aiLockMessage, readAiError, useAiAccess } from "@/lib/hooks/useAiAccess";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  resumeData: ResumeData;
}

export function CoverLetterModal({ isOpen, onClose, resumeData }: Props) {
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState(resumeData.personalInfo.jobTitle || "");
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { status: aiStatus, refresh: refreshAiStatus } = useAiAccess(isOpen);
  const lockMessage = aiLockMessage(aiStatus);
  const otherRemaining = aiStatus?.other.remaining ?? 0;
  const aiLocked = Boolean(lockMessage) || otherRemaining <= 0;

  const handleGenerate = async () => {
    if (aiLocked) return;
    setIsLoading(true);
    setError(null);
    setCoverLetter("");

    try {
      const response = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          roleTitle,
          jobDescription,
          resumeData,
        }),
      });

      if (!response.ok) throw new Error(await readAiError(response));
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated = appendAiDataStreamText(accumulated, chunk);
        setCoverLetter(stripAiStreamArtifacts(accumulated));
      }
      void refreshAiStatus();
    } catch (err: any) {
      setError(err.message || "Failed to generate cover letter.");
      void refreshAiStatus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([coverLetter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Cover_Letter_${companyName ? companyName.replace(/\s+/g, "_") : "Application"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} className="max-w-2xl">
      <DialogHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle>AI Tailored Cover Letter Generator</DialogTitle>
            <DialogDescription>
              Create a personalized, compelling cover letter matching your background to any target role.
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
              Company Name
            </label>
            <Input
              placeholder="e.g., Stripe, Vercel, Google"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="text-xs"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
              Target Role Title
            </label>
            <Input
              placeholder="e.g., Senior Full Stack Engineer"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              className="text-xs"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
            Job Description / Key Requirements (Optional)
          </label>
          <Textarea
            rows={3}
            placeholder="Paste role description or key requirements here to make the letter ultra-tailored..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="text-xs"
          />
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleGenerate}
            disabled={isLoading || aiLocked}
            variant="gradient"
            size="sm"
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Writing Cover Letter...
              </>
            ) : aiLocked ? (
              <>
                <Lock className="h-4 w-4" />
                AI Locked
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Generate Cover Letter
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="p-3 text-xs text-destructive bg-destructive/10 rounded-lg">
            {error}
          </div>
        )}

        {coverLetter && (
          <div className="space-y-3 pt-3 border-t">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Generated Cover Letter
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="h-7 text-xs gap-1"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadTxt}
                  className="h-7 text-xs gap-1"
                >
                  <Download className="h-3 w-3" /> Download .txt
                </Button>
              </div>
            </div>
            <div className="p-4 rounded-xl border bg-card text-xs text-foreground font-sans whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto">
              {coverLetter}
            </div>
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
