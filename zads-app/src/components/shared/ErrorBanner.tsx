"use client";

import { useTranslations } from "next-intl";
import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorBannerProps {
  error: string | null;
  onRetry?: () => void;
  className?: string;
}

export function ErrorBanner({ error, onRetry, className }: ErrorBannerProps) {
  const tCommon = useTranslations("common");

  if (!error) return null;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive",
        className
      )}
      role="alert"
    >
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="flex-1 text-sm">{error}</div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-1.5 rounded-md border border-destructive/40 px-2.5 py-1 text-xs font-medium transition-colors hover:bg-destructive/20"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {tCommon("retry")}
        </button>
      )}
    </div>
  );
}
