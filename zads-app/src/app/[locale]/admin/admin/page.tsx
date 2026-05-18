"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { extractError } from "@/lib/utils";
import { ErrorBanner } from "@/components/shared/ErrorBanner";

type DashboardStats = {
  teachers: { total: number; active: number; newLast7Days: number };
  parents: { total: number; newLast7Days: number };
  contactRequests: { total: number; pending: number };
};

export default function AdminDashboardPage() {
  const t = useTranslations("admin");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ data: DashboardStats }>("/admin/dashboard")
      .then((res) => setStats(res.data.data))
      .catch((e) => setError(extractError(e)));
  }, []);

  const statCards = [
    { label: t("totalTeachers"), value: stats?.teachers.total ?? 0, color: "text-primary" },
    { label: t("totalClients"), value: stats?.parents.total ?? 0, color: "text-secondary" },
    { label: t("totalRequests"), value: stats?.contactRequests.total ?? 0, color: "text-success" },
    { label: t("pendingRequests"), value: stats?.contactRequests.pending ?? 0, color: "text-info" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-xl font-bold">{t("dashboard")}</h1>
      <ErrorBanner error={error} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statCards.map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-border bg-surface p-5 text-center">
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
