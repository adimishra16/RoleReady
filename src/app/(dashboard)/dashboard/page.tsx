"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { TemplateId } from "@/lib/types/resume";
import { createResumeAction } from "@/lib/actions/resume.actions";
import { VisualTemplateCardPicker } from "@/components/templates/VisualTemplateCardPicker";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { AuthNavActions } from "@/components/brand/AuthNavActions";
import { BRAND } from "@/lib/brand";
import {
  Plus,
  Calendar,
  Trash2,
  Copy,
  ExternalLink,
  Edit3,
  Search,
  ArrowRight,
  Lock,
} from "lucide-react";

interface ResumeListItem {
  id: string;
  title: string;
  templateId: TemplateId;
  themeColor: string;
  updatedAt: string;
  jobTitle: string;
}

const MAX_RESUMES = BRAND.maxResumesPerUser;

export default function DashboardPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [listHydrated, setListHydrated] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("modern");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const atResumeLimit = resumes.length >= MAX_RESUMES;

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("cv_builder_user_resumes");
      if (stored) {
        const parsed = JSON.parse(stored) as ResumeListItem[];
        // Drop legacy seeded demo if it was never edited as a real user resume
        const cleaned = parsed.filter((r) => r.id !== "resume-frontend-lead");
        setResumes(cleaned.slice(0, MAX_RESUMES));
        if (cleaned.length !== parsed.length) {
          localStorage.setItem("cv_builder_user_resumes", JSON.stringify(cleaned));
        }
      } else {
        setResumes([]);
      }
    } catch {
      setResumes([]);
    }
    setListHydrated(true);
  }, []);

  const saveResumesList = (items: ResumeListItem[]) => {
    const capped = items.slice(0, MAX_RESUMES);
    setResumes(capped);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("cv_builder_user_resumes", JSON.stringify(capped));
      } catch {}
    }
  };

  const openCreateModal = () => {
    if (atResumeLimit) {
      setCreateError(`You can create up to ${MAX_RESUMES} resumes per account.`);
      return;
    }
    setCreateError(null);
    setNewTitle("");
    setSelectedTemplate("modern");
    setIsCreateModalOpen(true);
  };

  const handleCreateNew = async () => {
    if (!newTitle.trim() || atResumeLimit) return;
    setIsCreating(true);
    setCreateError(null);

    try {
      const res = await createResumeAction(
        "user_demo",
        newTitle.trim(),
        selectedTemplate
      );

      if (!res.success) {
        setCreateError(res.error || "Could not create resume.");
        return;
      }

      const newId = res.resume?.id || "res_" + Date.now();
      const blank = res.resume;

      if (typeof window !== "undefined" && blank) {
        try {
          localStorage.setItem(
            "cv_builder_resume_" + newId,
            JSON.stringify(blank)
          );
        } catch {}
      }

      const newItem: ResumeListItem = {
        id: newId,
        title: newTitle.trim(),
        templateId: selectedTemplate,
        themeColor: blank?.themeColor || "#0d9488",
        updatedAt: "Just now",
        jobTitle: blank?.personalInfo?.jobTitle || "—",
      };

      const updatedList = [newItem, ...resumes].slice(0, MAX_RESUMES);
      saveResumesList(updatedList);

      setIsCreateModalOpen(false);
      setNewTitle("");
      router.push(`/builder/${newId}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteResume = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = resumes.filter((r) => r.id !== id);
    saveResumesList(updated);
    setCreateError(null);
  };

  const handleDuplicateResume = (item: ResumeListItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (resumes.length >= MAX_RESUMES) {
      setCreateError(`Resume limit reached (${MAX_RESUMES} max). Delete one to duplicate.`);
      return;
    }
    const duplicateId = "res_copy_" + Date.now();
    const duplicateItem: ResumeListItem = {
      ...item,
      id: duplicateId,
      title: `${item.title} (Copy)`,
      updatedAt: "Just now",
    };
    saveResumesList([duplicateItem, ...resumes]);
  };

  const filteredResumes = resumes.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Dashboard Top Navigation */}
      <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between">
        <Link href="/">
          <BrandLogo size="sm" />
        </Link>

        <div className="flex items-center gap-3">
          <AuthNavActions primaryHref="/sign-up" primaryLabel="Get Started" />
          <Button
            size="sm"
            onClick={openCreateModal}
            disabled={atResumeLimit}
            className="gap-2 text-xs shadow-md bg-teal-700 hover:bg-teal-800 text-white disabled:opacity-60"
          >
            {atResumeLimit ? <Lock className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {atResumeLimit ? "Limit reached" : "New Resume"}
          </Button>
        </div>
      </header>

      {/* Main Dashboard Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 sm:p-8 space-y-8">
        {/* Welcome & Stats Hero */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-600/10 via-teal-700/5 to-amber-500/10 border border-teal-600/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1.5">
            <Badge className="mb-1 bg-teal-700/10 text-teal-800 dark:text-teal-300 border-teal-700/20" variant="outline">
              {BRAND.tagline}
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Your Resume Hub
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              Start from a template and build your own resume — up to {MAX_RESUMES} per account.
              Sign in to download PDFs.
            </p>
          </div>

            <div className="flex flex-wrap gap-3">
            <Link href="/profile">
              <div className="bg-card px-4 py-3 rounded-2xl border shadow-xs text-center min-w-[110px] hover:border-teal-600/40 transition-colors cursor-pointer">
                <span className="text-sm font-black text-teal-800 dark:text-teal-300">Profile</span>
                <p className="text-[11px] text-muted-foreground uppercase font-semibold mt-0.5">
                  Edit details
                </p>
              </div>
            </Link>
            <Link href="/pricing">
              <div className="bg-card px-4 py-3 rounded-2xl border shadow-xs text-center min-w-[110px] hover:border-teal-600/40 transition-colors cursor-pointer">
                <span className="text-sm font-black text-teal-800 dark:text-teal-300">Plans</span>
                <p className="text-[11px] text-muted-foreground uppercase font-semibold mt-0.5">
                  ₹59 / ₹119
                </p>
              </div>
            </Link>
            <div className="bg-card px-4 py-3 rounded-2xl border shadow-xs text-center min-w-[110px]">
              <span className="text-2xl font-black text-foreground">
                {resumes.length}/{MAX_RESUMES}
              </span>
              <p className="text-[11px] text-muted-foreground uppercase font-semibold">Resumes</p>
            </div>
          </div>
        </div>

        {createError && (
          <div className="p-3 text-xs rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200">
            {createError}
          </div>
        )}

        {/* Resumes Grid Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">My Resumes</h2>
            <p className="text-xs text-muted-foreground">
              {atResumeLimit
                ? `You've used all ${MAX_RESUMES} resume slots. Delete one to create another.`
                : resumes.length === 0
                  ? "No resumes yet — pick a template to start building."
                  : "Select a resume to edit, or create a new one for another role."}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search resumes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>
          </div>
        </div>

        {/* Resumes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Create new resume card */}
          {!atResumeLimit && (
            <div
              onClick={openCreateModal}
              className="group cursor-pointer rounded-2xl border-2 border-dashed border-border hover:border-teal-600/60 bg-muted/20 hover:bg-teal-600/5 p-6 flex flex-col items-center justify-center text-center min-h-[220px] transition-all duration-200 shadow-xs hover:shadow-md"
            >
              <div className="h-12 w-12 rounded-2xl bg-teal-600/10 group-hover:bg-teal-700 group-hover:text-white text-teal-700 flex items-center justify-center mb-3 transition-colors">
                <Plus className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-sm text-foreground group-hover:text-teal-700 transition-colors">
                {resumes.length === 0 ? "Create your first resume" : "+ New Resume"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                {resumes.length === 0
                  ? "Choose a template and fill in your details"
                  : `${MAX_RESUMES - resumes.length} of ${MAX_RESUMES} slots remaining`}
              </p>
            </div>
          )}

          {listHydrated && resumes.length === 0 && (
            <div className="sm:col-span-1 lg:col-span-2 rounded-2xl border bg-card/60 p-6 flex flex-col justify-center min-h-[220px]">
              <h3 className="font-bold text-base text-foreground">Build from a template</h3>
              <p className="text-xs text-muted-foreground mt-2 max-w-md leading-relaxed">
                We don&apos;t pre-fill a sample resume. Click{" "}
                <span className="font-semibold text-foreground">Create your first resume</span>, pick
                a design, then add your experience, skills, and education in the builder.
              </p>
              <Button
                size="sm"
                onClick={openCreateModal}
                className="mt-4 w-fit gap-1.5 bg-teal-700 hover:bg-teal-800 text-white"
              >
                Choose template <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          {/* Existing Resume Cards */}
          {filteredResumes.map((item) => (
            <div
              key={item.id}
              className="group rounded-2xl border bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-200 p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <Badge variant="outline" className="text-[10px] capitalize font-medium">
                    {item.templateId} Template
                  </Badge>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={(e) => handleDuplicateResume(item, e)}
                      disabled={atResumeLimit}
                      title={atResumeLimit ? "Resume limit reached" : "Duplicate Resume"}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      onClick={(e) => handleDeleteResume(item.id, e)}
                      title="Delete Resume"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <Link href={`/builder/${item.id}`}>
                  <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                </Link>
                <p className="text-xs text-muted-foreground mt-0.5">{item.jobTitle}</p>
              </div>

              <div className="pt-6 border-t mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1 text-[11px]">
                  <Calendar className="h-3 w-3" /> {item.updatedAt}
                </span>

                <div className="flex items-center gap-2">
                  <Link href={`/share/${item.id}`} target="_blank">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] text-muted-foreground gap-1">
                      <ExternalLink className="h-3 w-3" /> View
                    </Button>
                  </Link>
                  <Link href={`/builder/${item.id}`}>
                    <Button size="sm" className="h-7 px-3 text-xs gap-1">
                      <Edit3 className="h-3 w-3" /> Edit
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Template picker modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Resume</DialogTitle>
          <DialogDescription>
            Enter a title and choose your starting visual document design.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 my-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
              Resume Title / Target Application
            </label>
            <Input
              placeholder="e.g., Resume - Senior Full Stack Engineer"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
              className="text-sm font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5 block">
              CHOOSE STARTING TEMPLATE DESIGN:
            </label>

            {/* Template card grid */}
            <VisualTemplateCardPicker
              selectedTemplate={selectedTemplate}
              onSelectTemplate={(templateId) => setSelectedTemplate(templateId)}
              className="max-h-[380px] overflow-y-auto pr-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            size="sm"
            onClick={handleCreateNew}
            disabled={!newTitle.trim() || isCreating}
            className="gap-1.5"
          >
            Create Resume <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
