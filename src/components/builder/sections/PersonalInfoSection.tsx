"use client";

import React, { useState } from "react";
import { PersonalInfo } from "@/lib/types/resume";
import { Input } from "@/components/ui/input";
import { User, Mail, Phone, MapPin, Globe, Linkedin, Github, Image as ImageIcon } from "lucide-react";
import { AiRewriteButton } from "@/components/builder/ai/AiRewriteButton";
import { SectionRewriteModal } from "@/components/builder/ai/SectionRewriteModal";

interface Props {
  data: PersonalInfo;
  onChange: (data: Partial<PersonalInfo>) => void;
}

export function PersonalInfoSection({ data, onChange }: Props) {
  const [rewriteOpen, setRewriteOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-foreground">Personal Information</h3>
        <p className="text-xs text-muted-foreground">
          Enter your essential contact details and target job role for ATS identification.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" /> Full Name
          </label>
          <Input
            value={data.fullName || ""}
            onChange={(e) => onChange({ fullName: e.target.value })}
            placeholder="e.g., Alex Morgan"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Target Job Title
            </label>
            <AiRewriteButton
              disabled={!data.jobTitle?.trim()}
              onClick={() => setRewriteOpen(true)}
            />
          </div>
          <Input
            value={data.jobTitle || ""}
            onChange={(e) => onChange({ jobTitle: e.target.value })}
            placeholder="e.g., Senior Full Stack Engineer"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" /> Email Address
          </label>
          <Input
            type="email"
            value={data.email || ""}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="alex.morgan@example.com"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5" /> Phone Number
          </label>
          <Input
            value={data.phone || ""}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="+1 (555) 234-5678"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> Location
          </label>
          <Input
            value={data.location || ""}
            onChange={(e) => onChange({ location: e.target.value })}
            placeholder="San Francisco, CA (or Remote)"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5" /> Website
          </label>
          <Input
            value={data.website || ""}
            onChange={(e) => onChange({ website: e.target.value })}
            placeholder="https://yourportfolio.com"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Linkedin className="h-3.5 w-3.5" /> LinkedIn
          </label>
          <Input
            value={data.linkedin || ""}
            onChange={(e) => onChange({ linkedin: e.target.value })}
            placeholder="linkedin.com/in/username"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Github className="h-3.5 w-3.5" /> GitHub
          </label>
          <Input
            value={data.github || ""}
            onChange={(e) => onChange({ github: e.target.value })}
            placeholder="github.com/username"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <ImageIcon className="h-3.5 w-3.5" /> Avatar URL (optional)
          </label>
          <Input
            value={data.avatarUrl || ""}
            onChange={(e) => onChange({ avatarUrl: e.target.value })}
            placeholder="https://…"
          />
        </div>
      </div>

      <SectionRewriteModal
        isOpen={rewriteOpen}
        onClose={() => setRewriteOpen(false)}
        initialText={data.jobTitle || ""}
        sectionType="job_title"
        meta={data.fullName || undefined}
        onApply={(t) => onChange({ jobTitle: t })}
      />
    </div>
  );
}
