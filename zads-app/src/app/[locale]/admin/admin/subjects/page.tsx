"use client";

import { useEffect, useState, useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { DataTable } from "@/components/admin/DataTable";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import type { Subject } from "@/types";

export default function AdminSubjectsPage() {
  const t = useTranslations("admin");
  const [data, setData] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ data: Subject[] }>("/subjects")
      .then((res) => setData(res.data.data))
      .catch((err) => setError(err.response?.data?.message ?? err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const columns = useMemo<ColumnDef<Subject>[]>(() => [
    { accessorKey: "nameAr", header: t("arabicName") },
    { accessorKey: "nameEn", header: t("englishName") },
    { accessorKey: "sortOrder", header: t("order") },
    { accessorFn: (row) => (row.isActive ? t("active") : t("inactive")), header: t("status"), id: "status" },
  ], [t]);

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">{t("subjects")}</h1>
      <ErrorBanner error={error} />
      <DataTable data={data} columns={columns} isLoading={isLoading} searchPlaceholder={t("searchSubject")} />
    </div>
  );
}
