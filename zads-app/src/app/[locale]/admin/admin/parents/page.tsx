"use client";

import { useEffect, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import api from "@/lib/api";
import { DataTable } from "@/components/admin/DataTable";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import type { ClientProfile } from "@/types";

type AdminParent = ClientProfile & {
  user?: ClientProfile["user"] & {
    email?: string | null;
    status?: string;
    createdAt?: string;
  };
};

const columns: ColumnDef<AdminParent>[] = [
  { accessorFn: (row) => row.user?.name, header: "الاسم", id: "name" },
  { accessorFn: (row) => row.user?.phone, header: "الهاتف", id: "phone" },
  { accessorFn: (row) => row.user?.email ?? "-", header: "البريد", id: "email" },
  { accessorKey: "clientAccountKind", header: "نوع الحساب" },
  { accessorFn: (row) => row.user?.status ?? "-", header: "الحالة", id: "status" },
];

export default function AdminParentsPage() {
  const [data, setData] = useState<AdminParent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ data: AdminParent[] }>("/admin/parents")
      .then((res) => setData(res.data.data))
      .catch((err) => setError(err.response?.data?.message ?? err.message))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">العملاء</h1>
      <ErrorBanner error={error} />
      <DataTable data={data} columns={columns} isLoading={isLoading} searchPlaceholder="ابحث عن عميل..." />
    </div>
  );
}
