"use client";

import { useEffect, useState, useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
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

export default function AdminParentsPage() {
  const t = useTranslations("admin");
  const tAuth = useTranslations("auth");
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

  const columns = useMemo<ColumnDef<AdminParent>[]>(() => [
    { accessorFn: (row) => row.user?.name, header: t("name"), id: "name" },
    { accessorFn: (row) => row.user?.phone, header: t("phone"), id: "phone" },
    { accessorFn: (row) => row.user?.email ?? "-", header: t("email"), id: "email" },
    { accessorKey: "clientAccountKind", header: tAuth("accountKind") },
    { accessorFn: (row) => row.user?.status ?? "-", header: t("status"), id: "status" },
  ], [t, tAuth]);

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">{t("clients")}</h1>
      <ErrorBanner error={error} />
      <DataTable data={data} columns={columns} isLoading={isLoading} searchPlaceholder={t("searchClient")} />
    </div>
  );
}
