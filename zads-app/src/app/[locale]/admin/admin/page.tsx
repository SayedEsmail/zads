"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { DataTable } from "@/components/admin/DataTable";
import api from "@/lib/api";
import type { ColumnDef } from "@tanstack/react-table";
import type { Teacher } from "@/types";
import { extractError } from "@/lib/utils";
import { ErrorBanner } from "@/components/shared/ErrorBanner";

export default function AdminDashboardPage() {
  const t = useTranslations("admin");
  const [stats, setStats] = useState({ totalTeachers: 0, totalClients: 0, totalRequests: 0, activeSubjects: 0 });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get("/admin/stats").then((r: any) => setStats(r.data.data)).catch((e) => setError(extractError(e)));
  }, []);

  const statCards = [
    { label: t("totalTeachers"), value: stats.totalTeachers, color: "text-primary" },
    { label: t("totalClients"), value: stats.totalClients, color: "text-secondary" },
    { label: t("totalRequests"), value: stats.totalRequests, color: "text-success" },
    { label: t("activeSubjects"), value: stats.activeSubjects, color: "text-info" },
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
