import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function BuilderLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header Skeleton */}
      <div className="h-14 border-b px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
      </div>

      {/* Main Split Body Skeleton */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side */}
        <div className="w-full lg:w-1/2 flex flex-col md:flex-row p-6 gap-6">
          <div className="w-44 space-y-2 hidden md:block">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-xl" />
            ))}
          </div>
          <div className="flex-1 space-y-4 max-w-lg">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-72" />
            <div className="space-y-3 pt-4">
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-24 w-full rounded-md" />
            </div>
          </div>
        </div>

        {/* Right Side A4 Sheet Skeleton */}
        <div className="w-1/2 hidden lg:flex justify-center items-center bg-muted/20 p-8 border-l">
          <Skeleton className="w-[210mm] h-[297mm] max-w-full max-h-[85vh] rounded-lg shadow-md" />
        </div>
      </div>
    </div>
  );
}
