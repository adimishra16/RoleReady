"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ResumeData, TemplateId } from "@/lib/types/resume";
import { createShareableSlugAction } from "@/lib/actions/resume.actions";
import { JobMatcherDrawer } from "./ai/JobMatcherDrawer";
import { CoverLetterModal } from "./ai/CoverLetterModal";
import { TemplateGalleryModal, TEMPLATE_OPTIONS } from "@/components/templates/TemplateGalleryModal";
import { AuthNavActions, ClerkSignedInGate } from "@/components/brand/AuthNavActions";
import { requireSignedInForDownload } from "@/lib/actions/download.actions";
import confetti from "canvas-confetti";
import { exportResumeCanvasToPdf } from "@/lib/pdf/export-resume-pdf";
import {
  ArrowLeft,
  Download,
  Share2,
  Palette,
  LayoutTemplate,
  Target,
  FileText,
  Check,
  Copy,
  Loader2,
  AlertCircle,
  Eye,
  Lock,
} from "lucide-react";

interface Props {
  data: ResumeData;
  saveStatus: "saved" | "saving" | "unsaved" | "error";
  onUpdateTitle: (title: string) => void;
  onUpdateTemplate: (templateId: TemplateId) => void;
  onUpdateThemeColor: (color: string) => void;
  onUpdateFontFamily: (font: string) => void;
  onAddMissingSkill: (skill: string) => void;
  onToggleMobilePreview?: () => void;
  isMobilePreviewOpen?: boolean;
}

const COLOR_PRESETS = [
  { label: "RoleReady Teal", value: "#0d9488" },
  { label: "Emerald Green", value: "#059669" },
  { label: "Deep Teal", value: "#0f766e" },
  { label: "Crimson Rose", value: "#e11d48" },
  { label: "Slate Charcoal", value: "#334155" },
  { label: "Amber Sun", value: "#d97706" },
];

const FONT_PRESETS = [
  { label: "Outfit (Brand)", value: "Outfit, sans-serif" },
  { label: "Inter (Modern Sans)", value: "Inter, sans-serif" },
  { label: "Georgia (Classic Serif)", value: "Georgia, serif" },
  { label: "Playfair (Luxury Serif)", value: "'Playfair Display', serif" },
];

export function BuilderHeader({
  data,
  saveStatus,
  onUpdateTitle,
  onUpdateTemplate,
  onUpdateThemeColor,
  onUpdateFontFamily,
  onAddMissingSkill,
  onToggleMobilePreview,
  isMobilePreviewOpen,
}: Props) {
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [titleValue, setTitleValue] = useState(data.title);

  // Modals
  const [isTemplateGalleryOpen, setIsTemplateGalleryOpen] = useState(false);
  const [isJobMatcherOpen, setIsJobMatcherOpen] = useState(false);
  const [isCoverLetterOpen, setIsCoverLetterOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareSlug, setShareSlug] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [showSignInForDownload, setShowSignInForDownload] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const activeTemplateOpt = TEMPLATE_OPTIONS.find((t) => t.id === data.templateId) || TEMPLATE_OPTIONS[0];

  const handleTitleBlur = () => {
    setIsTitleEditing(false);
    if (titleValue.trim() && titleValue !== data.title) {
      onUpdateTitle(titleValue.trim());
    } else {
      setTitleValue(data.title);
    }
  };

  const handleShare = async () => {
    setIsShareModalOpen(true);
    setIsSharing(true);
    try {
      const res = await createShareableSlugAction(data.id);
      if (res.success && res.slug) {
        setShareSlug(res.slug);
      }
    } finally {
      setIsSharing(false);
    }
  };

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/share/${shareSlug || data.id}`
    : `/share/${shareSlug || data.id}`;

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const runPdfExport = async () => {
    setIsExportingPdf(true);
    setDownloadError(null);
    try {
      await exportResumeCanvasToPdf(data.title || "Resume");

      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {
        /* ignore confetti failures */
      }
    } catch (err) {
      console.error("Direct PDF Export failed, falling back to window.print():", err);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportPdf = async (isSignedIn: boolean) => {
    if (!isSignedIn) {
      setShowSignInForDownload(true);
      return;
    }

    const authCheck = await requireSignedInForDownload();
    if (!authCheck.allowed) {
      setDownloadError(authCheck.message || "Sign in to download your PDF.");
      setShowSignInForDownload(true);
      return;
    }

    await runPdfExport();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card/80 backdrop-blur-md px-4 py-2.5 flex items-center justify-between gap-3 shadow-xs no-print">
      {/* Left: Back & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>

        <div className="min-w-0">
          {isTitleEditing ? (
            <Input
              autoFocus
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => e.key === "Enter" && handleTitleBlur()}
              className="h-7 text-sm font-semibold max-w-[240px]"
            />
          ) : (
            <h1
              onClick={() => setIsTitleEditing(true)}
              className="text-sm font-semibold truncate cursor-pointer hover:text-primary transition-colors flex items-center gap-1.5"
              title="Click to rename"
            >
              {data.title}
              <span className="text-[10px] text-muted-foreground font-normal">✎</span>
            </h1>
          )}

          <div className="flex items-center gap-2 mt-0.5">
            {saveStatus === "saving" && (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Loader2 className="h-2.5 w-2.5 animate-spin" /> Saving...
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Saved
              </span>
            )}
            {saveStatus === "unsaved" && (
              <span className="inline-flex items-center gap-1 text-[11px] text-amber-500">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" /> Unsaved changes
              </span>
            )}
            {saveStatus === "error" && (
              <span className="inline-flex items-center gap-1 text-[11px] text-destructive">
                <AlertCircle className="h-2.5 w-2.5" /> Saved locally
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Middle: Visual Template Gallery Trigger & Customizer */}
      <div className="hidden lg:flex items-center gap-2">
        {/* Visual Template Picker Gallery Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsTemplateGalleryOpen(true)}
          className="gap-2 text-xs font-semibold hover:border-primary hover:text-primary transition-colors shadow-2xs"
        >
          <LayoutTemplate className="h-4 w-4 text-primary" />
          <span>Template: {activeTemplateOpt.name}</span>
          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-normal">
            Change
          </span>
        </Button>

        {/* Color Palette Selector */}
        <div className="flex items-center gap-1.5 bg-muted/60 px-2 py-1 rounded-lg">
          <Palette className="h-3.5 w-3.5 text-muted-foreground" />
          <div className="flex items-center gap-1">
            {COLOR_PRESETS.map((c) => (
              <button
                key={c.value}
                onClick={() => onUpdateThemeColor(c.value)}
                className={`w-4 h-4 rounded-full transition-transform ${
                  data.themeColor === c.value ? "scale-125 ring-2 ring-primary ring-offset-1" : "hover:scale-110"
                }`}
                style={{ backgroundColor: c.value }}
                title={c.label}
              />
            ))}
          </div>
        </div>

        {/* Font Selector */}
        <select
          value={data.fontFamily}
          onChange={(e) => onUpdateFontFamily(e.target.value)}
          className="bg-muted/60 text-xs font-medium rounded-lg px-2.5 py-1.5 border-0 cursor-pointer"
        >
          {FONT_PRESETS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* Right: AI Tools & Export Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <AuthNavActions
          compact
          showDashboardLink={false}
          primaryHref="/sign-up"
          primaryLabel="Get Started"
        />
        {/* AI Action Drawer Launchers */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsJobMatcherOpen(true)}
          className="hidden sm:inline-flex gap-1.5 text-xs text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
        >
          <Target className="h-3.5 w-3.5" />
          Job Matcher
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCoverLetterOpen(true)}
          className="hidden sm:inline-flex gap-1.5 text-xs text-purple-700 dark:text-purple-300 border-purple-500/30 hover:bg-purple-50 dark:hover:bg-purple-950/30"
        >
          <FileText className="h-3.5 w-3.5" />
          Cover Letter
        </Button>

        {/* Share Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="gap-1.5 text-xs"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Share</span>
        </Button>

        {/* Export PDF Button — signed-in only */}
        <ClerkSignedInGate>
          {({ isSignedIn, isLoaded }) => (
            <Button
              variant="gradient"
              size="sm"
              onClick={() => handleExportPdf(isSignedIn)}
              disabled={isExportingPdf || !isLoaded}
              className="gap-1.5 text-xs shadow-sm"
              title={isSignedIn ? "Download PDF" : "Sign in to download PDF"}
            >
              {isExportingPdf ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : isSignedIn ? (
                <Download className="h-3.5 w-3.5" />
              ) : (
                <Lock className="h-3.5 w-3.5" />
              )}
              {isSignedIn ? "Download PDF" : "PDF (Sign in)"}
            </Button>
          )}
        </ClerkSignedInGate>

        {/* Mobile Toggle Preview Button */}
        {onToggleMobilePreview && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onToggleMobilePreview}
            className="lg:hidden text-xs gap-1"
          >
            <Eye className="h-3.5 w-3.5" />
            {isMobilePreviewOpen ? "Edit Form" : "Preview"}
          </Button>
        )}
      </div>

      {/* Template gallery */}
      <TemplateGalleryModal
        isOpen={isTemplateGalleryOpen}
        onClose={() => setIsTemplateGalleryOpen(false)}
        selectedTemplateId={data.templateId}
        onSelectTemplate={(templateId) => {
          onUpdateTemplate(templateId);
        }}
        accentColor={data.themeColor}
      />

      {/* AI Job Matcher Modal */}
      <JobMatcherDrawer
        isOpen={isJobMatcherOpen}
        onClose={() => setIsJobMatcherOpen(false)}
        resumeData={data}
        onAddMissingSkill={onAddMissingSkill}
      />

      {/* AI Cover Letter Modal */}
      <CoverLetterModal
        isOpen={isCoverLetterOpen}
        onClose={() => setIsCoverLetterOpen(false)}
        resumeData={data}
      />

      {/* Share Modal */}
      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Share Public Web Resume
          </DialogTitle>
          <DialogDescription>
            Anyone with this link can view your live, interactive read-only web resume.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-3">
          <div className="flex items-center gap-2">
            <Input readOnly value={shareUrl} className="text-xs bg-muted/40" />
            <Button
              size="sm"
              onClick={copyShareLink}
              className="gap-1.5 text-xs shrink-0"
            >
              {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedLink ? "Copied" : "Copy"}
            </Button>
          </div>

          <div className="p-3 bg-muted/30 rounded-xl text-xs space-y-1 text-muted-foreground">
            <p className="font-semibold text-foreground">Tip for applications</p>
            <p>Paste this link into job applications, email signatures, or LinkedIn.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setIsShareModalOpen(false)}>
            Done
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Sign-in required for PDF */}
      <Dialog open={showSignInForDownload} onOpenChange={setShowSignInForDownload}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-teal-700" />
            Sign in to download PDF
          </DialogTitle>
          <DialogDescription>
            PDF export is available for signed-in RoleReady accounts only.
          </DialogDescription>
        </DialogHeader>
        {downloadError && (
          <p className="text-xs text-destructive my-2">{downloadError}</p>
        )}
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowSignInForDownload(false)}>
            Cancel
          </Button>
          <Link href="/sign-in">
            <Button size="sm" className="bg-teal-700 hover:bg-teal-800 text-white">
              Sign In
            </Button>
          </Link>
        </DialogFooter>
      </Dialog>
    </header>
  );
}
