"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useTeacherStore } from "@/stores/teacher";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { PageSkeleton } from "@/components/shared/PageSkeleton";

export default function TeacherSettingsPage() {
  const t = useTranslations("teacher");
  const tAuth = useTranslations("auth");
  const tAdmin = useTranslations("admin");
  const tCommon = useTranslations("common");
  const { data, isLoading, error, fetch } = useTeacherStore();

  useEffect(() => {
    fetch();
  }, [fetch]);

  if (isLoading && !data) return <PageSkeleton rows={5} />;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">{t("settingsTitle")}</h1>
      <ErrorBanner error={error} onRetry={fetch} />
      <div className="rounded-xl border border-border bg-surface p-5">
        <p className="text-sm text-muted-foreground">{t("settingsDesc")}</p>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{tAuth("fullName")}</dt>
            <dd className="font-medium">{data?.user?.name ?? "-"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{tAuth("phone")}</dt>
            <dd className="font-medium">{data?.user?.phone ?? "-"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{tAdmin("status")}</dt>
            <dd className="font-medium">
              {data?.isVerified ? tCommon("verified") : tCommon("unverified")}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
