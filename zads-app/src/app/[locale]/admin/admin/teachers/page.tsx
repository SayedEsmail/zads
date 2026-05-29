"use client";

import { useEffect, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { DataTable } from "@/components/admin/DataTable";
import api from "@/lib/api";
import type { ColumnDef } from "@tanstack/react-table";
import type { Teacher } from "@/types";
import { extractError } from "@/lib/utils";
import { ErrorBanner } from "@/components/shared/ErrorBanner";

export default function AdminTeachersPage() {
  const t = useTranslations("admin");
  const tTeacher = useTranslations("teacher");
  const tCommon = useTranslations("common");
  const [data, setData] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get("/admin/teachers")
      .then((r: { data: { data: Teacher[] } }) => setData(r.data.data))
      .catch((e) => setError(extractError(e)))
      .finally(() => setIsLoading(false));
  }, []);

  const columns = useMemo<ColumnDef<Teacher>[]>(() => [
    { accessorFn: (r) => r.user?.name, header: t("name"), id: "name" },
    { accessorFn: (r) => r.user?.phone, header: t("phone"), id: "phone" },
    { accessorKey: "avgRating", header: tTeacher("stats.rating") },
    { accessorKey: "viewsCount", header: tTeacher("stats.views") },
    {
      accessorKey: "isVerified",
      header: tCommon("verified"),
      cell: ({ getValue }) => getValue() ? "✅" : "❌",
    },
  ], [t, tTeacher, tCommon]);

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">{t("teachers")}</h1>
      <ErrorBanner error={error} />
      <DataTable
        data={data}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder={t("searchTeacher")}
      />
    </div>
  );
}
