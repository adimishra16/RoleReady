"use client";

import React from "react";
import { PersonalInfo } from "@/lib/types/resume";
import { Input } from "@/components/ui/input";
import { User, Mail, Phone, MapPin, Globe, Linkedin, Github, Image as ImageIcon } from "lucide-react";

interface Props {
  data: PersonalInfo;
  onChange: (data: Partial<PersonalInfo>) => void;
}

export function PersonalInfoSection({ data, onChange }: Props) {
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
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
            Target Job Title
          </label>
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
            <Globe className="h-3.5 w-3.5" /> Portfolio / Website
          </label>
          <Input
            value={data.website || ""}
            onChange={(e) => onChange({ website: e.target.value })}
            placeholder="https://alexmorgan.dev"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Linkedin className="h-3.5 w-3.5" /> LinkedIn Profile
          </label>
          <Input
            value={data.linkedin || ""}
            onChange={(e) => onChange({ linkedin: e.target.value })}
            placeholder="https://linkedin.com/in/alexmorgan"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Github className="h-3.5 w-3.5" /> GitHub / Other Profile
          </label>
          <Input
            value={data.github || ""}
            onChange={(e) => onChange({ github: e.target.value })}
            placeholder="https://github.com/alexmorgan"
          />
        </div>
      </div>
    </div>
  );
}
