"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { TutorRequestCard } from "@/components/shared/TutorRequestCard";
import type { TutorRequest } from "@/types";

export default function TeacherBrowsePage() {
  const t = useTranslations("teacher");
  const [requests, setRequests] = useState<TutorRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = () => {
    setIsLoading(true);
    api
      .get<{ data: TutorRequest[] }>("/tutor-requests")
      .then((res) => setRequests(res.data.data))
      .catch((err) => setError(err.response?.data?.message ?? err.message))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    let cancelled = false;
    api
      .get<{ data: TutorRequest[] }>("/tutor-requests")
      .then((res) => {
        if (!cancelled) setRequests(res.data.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message ?? err.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">{t("nearbyRequests")}</h1>
      <ErrorBanner error={error} onRetry={fetchRequests} />
      {isLoading ? (
        <PageSkeleton rows={4} />
      ) : requests.length === 0 ? (
        <p className="rounded-xl border border-border p-6 text-center text-sm text-muted-foreground">
          {t("noRequestsAvailable")}
        </p>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <TutorRequestCard key={request.id} request={request} showActions={false} />
          ))}
        </div>
      )}
    </div>
  );
}
