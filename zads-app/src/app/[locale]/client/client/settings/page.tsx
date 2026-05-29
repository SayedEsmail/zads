"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useClientStore } from "@/stores/client";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { PageSkeleton } from "@/components/shared/PageSkeleton";

export default function ClientSettingsPage() {
  const tNav = useTranslations("nav");
  const tClient = useTranslations("client");
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");
  const { data, isLoading, error, fetch } = useClientStore();

  useEffect(() => {
    fetch();
  }, [fetch]);

  if (isLoading && !data) return <PageSkeleton rows={5} />;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">{tNav("settings")}</h1>
      <ErrorBanner error={error} onRetry={fetch} />
      <div className="rounded-[1.25rem] border border-slate-100 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-5">
        <p className="text-sm text-muted-foreground">{tClient("settingsDesc")}</p>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{tAuth("accountKind")}</dt>
            <dd className="font-medium">
              {data?.clientAccountKind === "student" ? tClient("tutor") : tClient("guardian")}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{tCommon("area")}</dt>
            <dd className="font-medium">{data?.area?.nameAr ?? "-"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
