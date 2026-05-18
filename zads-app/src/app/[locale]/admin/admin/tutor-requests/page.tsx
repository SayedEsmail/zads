"use client";

import { useEffect, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import api from "@/lib/api";
import { DataTable } from "@/components/admin/DataTable";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import type { TutorRequest } from "@/types";

const columns: ColumnDef<TutorRequest>[] = [
  { accessorFn: (row) => row.parent?.user.name ?? "-", header: "العميل", id: "parent" },
  { accessorFn: (row) => row.subject?.nameAr ?? "-", header: "المادة", id: "subject" },
  { accessorFn: (row) => row.stage?.nameAr ?? "-", header: "المرحلة", id: "stage" },
  { accessorKey: "studyMode", header: "طريقة التعلم" },
  { accessorKey: "status", header: "الحالة" },
];

export default function AdminTutorRequestsPage() {
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

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">طلبات المعلمين</h1>
      <ErrorBanner error={error} />
      <DataTable data={data} columns={columns} isLoading={isLoading} searchPlaceholder="ابحث في الطلبات..." />
    </div>
  );
}
