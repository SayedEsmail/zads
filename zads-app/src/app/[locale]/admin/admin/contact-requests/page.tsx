"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { PageSkeleton } from "@/components/shared/PageSkeleton";

type ContactStats = {
  total: number;
  byStatus: Record<string, number>;
};

export default function AdminContactRequestsPage() {
  const t = useTranslations("admin");
  const [stats, setStats] = useState<ContactStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ data: ContactStats }>("/admin/stats/contacts")
      .then((res) => setStats(res.data.data))
      .catch((err) => setError(err.response?.data?.message ?? err.message))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">{t("contactRequests")}</h1>
      <ErrorBanner error={error} />
      {isLoading ? (
        <PageSkeleton rows={3} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="text-sm text-muted-foreground">{t("total")}</p>
            <p className="mt-2 text-2xl font-bold">{stats?.total ?? 0}</p>
          </div>
          {Object.entries(stats?.byStatus ?? {}).map(([status, count]) => (
            <div key={status} className="rounded-xl border border-border bg-surface p-5">
              <p className="text-sm text-muted-foreground">{status}</p>
              <p className="mt-2 text-2xl font-bold">{count}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
