"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth";
import { useClientStore } from "@/stores/client";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { PageSkeleton } from "@/components/shared/PageSkeleton";

export default function ClientProfilePage() {
  const auth = useAuthStore();
  const client = useClientStore();

  useEffect(() => {
    auth.fetchProfile();
    client.fetch();
  }, [auth.fetchProfile, client.fetch]);

  if ((auth.isLoading || client.isLoading) && !auth.profile) return <PageSkeleton rows={5} />;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">الملف الشخصي</h1>
      <ErrorBanner error={auth.error || client.error} />
      <div className="rounded-xl border border-border bg-surface p-5">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">الاسم</dt>
            <dd className="font-medium">{auth.profile?.name ?? client.data?.user?.name ?? "-"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">الهاتف</dt>
            <dd className="font-medium">{auth.profile?.phone ?? client.data?.user?.phone ?? "-"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">نوع الحساب</dt>
            <dd className="font-medium">{client.data?.clientAccountKind === "student" ? "طالب" : "ولي أمر"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">المنطقة</dt>
            <dd className="font-medium">{client.data?.area?.nameAr ?? "-"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
