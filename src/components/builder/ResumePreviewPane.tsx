"use client";

import React from "react";
import { ResumeData } from "@/lib/types/resume";
import { TemplateRenderer } from "@/components/templates/TemplateRenderer";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from "lucide-react";

interface Props {
  data: ResumeData;
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export function ResumePreviewPane({
  data,
  scale,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: Props) {
  return (
    <div className="relative w-full h-full flex flex-col bg-slate-900/5 dark:bg-black/30 overflow-hidden border-l">
      {/* Floating Zoom Controls Bar */}
      <div className="absolute top-4 right-6 z-20 flex items-center gap-1.5 bg-card/90 backdrop-blur-md px-3 py-1.5 rounded-full border shadow-md no-print">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
          onClick={onZoomOut}
          disabled={scale <= 0.4}
          title="Zoom Out"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        <span className="text-xs font-semibold px-1 text-foreground min-w-[3rem] text-center select-none">
          {Math.round(scale * 100)}%
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
          onClick={onZoomIn}
          disabled={scale >= 1.5}
          title="Zoom In"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
        <div className="w-px h-3.5 bg-border mx-0.5" />
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
          onClick={onResetZoom}
          title="Reset Zoom (85%)"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Centered Scrollable Resume Page */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start">
        <div className="transition-all duration-150 ease-out py-4">
          <TemplateRenderer data={data} scale={scale} />
        </div>
      </div>
    </div>
  );
}
