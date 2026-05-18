"use client";

import { useEffect } from "react";
import { useTeacherStore } from "@/stores/teacher";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { PageSkeleton } from "@/components/shared/PageSkeleton";

export default function TeacherSettingsPage() {
  const { data, isLoading, error, fetch } = useTeacherStore();

  useEffect(() => {
    fetch();
  }, [fetch]);

  if (isLoading && !data) return <PageSkeleton rows={5} />;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">إعدادات المعلم</h1>
      <ErrorBanner error={error} onRetry={fetch} />
      <div className="rounded-xl border border-border bg-surface p-5">
        <p className="text-sm text-muted-foreground">هذه الصفحة تعرض بيانات الحساب الأساسية حاليا. تعديل الإعدادات التفصيلي ما زال ضمن أعمال النقل.</p>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">الاسم</dt>
            <dd className="font-medium">{data?.user?.name ?? "-"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">الهاتف</dt>
            <dd className="font-medium">{data?.user?.phone ?? "-"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">الحالة</dt>
            <dd className="font-medium">{data?.isVerified ? "موثق" : "غير موثق"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
