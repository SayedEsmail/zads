"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { DataTable } from "@/components/admin/DataTable";
import api from "@/lib/api";
import type { ColumnDef } from "@tanstack/react-table";
import type { Teacher } from "@/types";
import { extractError } from "@/lib/utils";
import { ErrorBanner } from "@/components/shared/ErrorBanner";

const columns: ColumnDef<Teacher>[] = [
  { accessorFn: (r) => r.user?.name, header: "الاسم", id: "name" },
  { accessorFn: (r) => r.user?.phone, header: "الهاتف", id: "phone" },
  { accessorKey: "avgRating", header: "التقييم" },
  { accessorKey: "viewsCount", header: "المشاهدات" },
  {
    accessorKey: "isVerified",
    header: "موثق",
    cell: ({ getValue }) => getValue() ? "✅" : "❌",
  },
];

export default function AdminTeachersPage() {
  const t = useTranslations("admin");
  const [data, setData] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get("/admin/teachers")
      .then((r: { data: { data: Teacher[] } }) => setData(r.data.data))
      .catch((e) => setError(extractError(e)))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">{t("teachers")}</h1>
      <ErrorBanner error={error} />
      <DataTable
        data={data}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="ابحث عن معلم..."
      />
    </div>
  );
}
