"use client";

import { useTranslations } from "next-intl";
import { X, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TutorRequest } from "@/types";

interface TutorRequestCardProps {
  request: TutorRequest;
  onClose?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

const STATUS_STYLE: Record<string, string> = {
  active: "bg-success/10 text-success",
  fulfilled: "bg-primary/10 text-primary",
  closed: "bg-muted text-muted-foreground",
};

export function TutorRequestCard({
  request,
  onClose,
  onDelete,
  showActions = true,
}: TutorRequestCardProps) {
  const t = useTranslations("request");

  // Dynamically resolve study mode, target label, and status using translation keys
  const getStudyModeLabel = (mode: string) => {
    if (mode === "online") return t("online");
    if (mode === "offline") return t("offline");
    if (mode === "both") return t("both");
    return mode;
  };

  const getTargetLabel = (target: string) => {
    if (target === "self") return t("targetSelf");
    if (target === "dependent") return t("targetDependent");
    return target;
  };

  const getStatusLabel = (status: string) => {
    if (status === "active") return t("active");
    if (status === "fulfilled") return t("fulfilled");
    if (status === "closed") return t("closed");
    return status;
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-2">
        {/* Subject + Stage */}
        <div>
          <p className="font-semibold">{request.subject?.nameAr}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{request.stage?.nameAr}</p>
        </div>

        {/* Status badge */}
        <span className={cn(
          "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
          STATUS_STYLE[request.status] ?? "bg-muted text-muted-foreground"
        )}>
          {getStatusLabel(request.status)}
        </span>
      </div>

      {/* Badges row */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          {getStudyModeLabel(request.studyMode)}
        </span>
        <span className="rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary">
          {getTargetLabel(request.requestTarget)}
        </span>
        {request.parentChild && (
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
            {request.parentChild.name}
          </span>
        )}
      </div>

      {/* Description */}
      {request.description && (
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{request.description}</p>
      )}

      {/* Budget */}
      {(request.budgetMin || request.budgetMax) && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          {t("budgetLabel", { min: request.budgetMin ?? "—", max: request.budgetMax ?? "—" })}
        </p>
      )}

      {/* Actions */}
      {showActions && request.status === "active" && (
        <div className="mt-3 flex items-center gap-2">
          {onClose && (
            <button
              onClick={() => onClose(request.id)}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
            >
              <X className="h-3.5 w-3.5" />
              {t("closeRequest")}
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(request.id)}
              className="flex items-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t("deleteRequest")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
