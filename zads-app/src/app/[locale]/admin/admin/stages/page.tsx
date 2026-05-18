"use client";

import { useEffect, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import api from "@/lib/api";
import { DataTable } from "@/components/admin/DataTable";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import type { Stage } from "@/types";

const columns: ColumnDef<Stage>[] = [
  { accessorKey: "nameAr", header: "الاسم العربي" },
  { accessorKey: "nameEn", header: "الاسم الإنجليزي" },
  { accessorKey: "sortOrder", header: "الترتيب" },
  { accessorFn: (row) => (row.isActive ? "نشط" : "متوقف"), header: "الحالة", id: "status" },
];

export default function AdminStagesPage() {
  const [data, setData] = useState<Stage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ data: Stage[] }>("/stages")
      .then((res) => setData(res.data.data))
      .catch((err) => setError(err.response?.data?.message ?? err.message))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">المراحل</h1>
      <ErrorBanner error={error} />
      <DataTable data={data} columns={columns} isLoading={isLoading} searchPlaceholder="ابحث عن مرحلة..." />
    </div>
  );
}
