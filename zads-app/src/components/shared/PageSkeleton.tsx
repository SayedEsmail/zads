"use client";

import { cn } from "@/lib/utils";

interface PageSkeletonProps {
  /** Number of skeleton rows to render */
  rows?: number;
  className?: string;
}

export function PageSkeleton({ rows = 4, className }: PageSkeletonProps) {
  return (
    <div
      className={cn("w-full space-y-4 animate-pulse p-4", className)}
      aria-busy="true"
      aria-label="Loading…"
    >
      {/* Header skeleton */}
      <div className="h-8 w-1/3 rounded-md bg-muted" />
      {/* Content rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-full rounded-md bg-muted" />
          <div className="h-4 w-5/6 rounded-md bg-muted" />
        </div>
      ))}
    </div>
  );
}
