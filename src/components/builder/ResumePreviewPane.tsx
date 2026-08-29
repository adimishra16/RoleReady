"use client";

import React, { useEffect, useRef } from "react";
import { ResumeData } from "@/lib/types/resume";
import { TemplateRenderer } from "@/components/templates/TemplateRenderer";
import { Button } from "@/components/ui/button";
import { A4_WIDTH_PX } from "@/lib/pdf/export-resume-pdf";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface Props {
  data: ResumeData;
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  /** Called when the pane width changes so phone preview can match A4 proportions */
  onFitScale?: (fitScale: number) => void;
}

export function ResumePreviewPane({
  data,
  scale,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitScale,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !onFitScale) return;

    const updateFit = () => {
      const pad = window.innerWidth < 640 ? 24 : 64;
      const available = Math.max(200, el.clientWidth - pad);
      const fit = Math.min(1, Math.max(0.32, available / A4_WIDTH_PX));
      // Round to 2 decimals so tiny resize noise doesn't thrash state
      onFitScale(Math.round(fit * 100) / 100);
    };

    updateFit();
    const ro = new ResizeObserver(updateFit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [onFitScale]);

  // Layout space must shrink with scale or the page looks “cut off” / wrong on phones
  const layoutWidth = A4_WIDTH_PX * scale;

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-900/5 dark:bg-black/30 overflow-hidden border-l">
      <div className="absolute top-3 right-3 sm:top-4 sm:right-6 z-20 flex items-center gap-1.5 bg-card/90 backdrop-blur-md px-2.5 sm:px-3 py-1.5 rounded-full border shadow-md no-print">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
          onClick={onZoomOut}
          disabled={scale <= 0.32}
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
          title="Fit to width"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-auto p-3 sm:p-8 flex justify-center items-start"
      >
        <div className="transition-all duration-150 ease-out py-2 sm:py-4" style={{ width: layoutWidth }}>
          <TemplateRenderer data={data} scale={scale} />
        </div>
      </div>
    </div>
  );
}
