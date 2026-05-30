"use client";

import { useEffect, useState, useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { DataTable } from "@/components/admin/DataTable";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import type { TutorRequest } from "@/types";

export default function AdminTutorRequestsPage() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const [data, setData] = useState<TutorRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ data: TutorRequest[] }>("/admin/tutor-requests")
      .then((res) => setData(res.data.data))
      .catch((err) => setError(err.response?.data?.message ?? err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const columns = useMemo<ColumnDef<TutorRequest>[]>(() => [
    { accessorFn: (row) => row.parent?.user.name ?? "-", header: t("clients"), id: "parent" },
    { accessorFn: (row) => row.subject?.nameAr ?? "-", header: tCommon("subject"), id: "subject" },
    { accessorFn: (row) => row.stage?.nameAr ?? "-", header: tCommon("stage"), id: "stage" },
    { accessorKey: "studyMode", header: tCommon("studyMode") },
    { accessorKey: "status", header: t("status") },
  ], [t, tCommon]);

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">{t("tutorRequests")}</h1>
      <ErrorBanner error={error} />
      <DataTable data={data} columns={columns} isLoading={isLoading} searchPlaceholder={t("searchRequest")} />
    </div>
  );
}
