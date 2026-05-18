"use client";

import { useEffect } from "react";
import { useClientStore } from "@/stores/client";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { PageSkeleton } from "@/components/shared/PageSkeleton";

export default function ClientSettingsPage() {
  const { data, isLoading, error, fetch } = useClientStore();

  useEffect(() => {
    fetch();
  }, [fetch]);

  if (isLoading && !data) return <PageSkeleton rows={5} />;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">الإعدادات</h1>
      <ErrorBanner error={error} onRetry={fetch} />
      <div className="rounded-xl border border-border bg-surface p-5">
        <p className="text-sm text-muted-foreground">تعديل بيانات العميل التفصيلي ما زال ضمن أعمال النقل. هذه الصفحة متصلة حاليا ببيانات الحساب من الـ API.</p>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">نوع الحساب</dt>
            <dd className="font-medium">{data?.clientAccountKind === "student" ? "طالب" : "ولي أمر"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">المنطقة</dt>
            <dd className="font-medium">{data?.area?.nameAr ?? "-"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
