"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Users, FileText, Heart, Search } from "lucide-react";
import { useClientStore } from "@/stores/client";
import { useTutorRequestsStore } from "@/stores/tutor-requests";
import { useDependentsStore } from "@/stores/dependents";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { TutorRequestCard } from "@/components/shared/TutorRequestCard";

export default function ClientDashboardPage() {
  const { data: session } = useSession();
  const locale = useLocale();
  const t = useTranslations("client");
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");

  const clientStore = useClientStore();
  const tutorStore = useTutorRequestsStore();
  const dependentsStore = useDependentsStore();

  useEffect(() => {
    clientStore.fetch();
    tutorStore.fetch();
    dependentsStore.fetch();
  }, []);

  if (clientStore.isLoading && !clientStore.data) return <PageSkeleton />;
  if (clientStore.error) return <ErrorBanner error={clientStore.error} onRetry={clientStore.fetch} />;

  const stats = [
    {
      label: t("dependents"),
      value: dependentsStore.data?.length ?? 0,
      icon: Users,
      href: `/${locale}/client/client/dependents`,
      color: "bg-primary/10 text-primary",
    },
    {
      label: t("tutorRequests"),
      value: tutorStore.data?.filter((r) => r.status === "active").length ?? 0,
      icon: FileText,
      href: `/${locale}/client/client/requests`,
      color: "bg-secondary/10 text-secondary",
    },
    {
      label: tNav("favorites"),
      value: 0,
      icon: Heart,
      href: `/${locale}/client/client/favorites`,
      color: "bg-destructive/10 text-destructive",
    },
  ];

  const recentRequests = tutorStore.data?.slice(0, 3) ?? [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Welcome */}
      <div className="rounded-2xl bg-gradient-to-l from-primary/5 to-primary/10 p-5">
        <p className="text-sm text-muted-foreground">{t("welcome")}</p>
        <p className="text-xl font-bold text-primary">{session?.user.name} 👋</p>
        {clientStore.data?.clientAccountKind === "guardian" && (
          <p className="mt-1 text-xs text-muted-foreground">
            {t("guardianAccountKindDesc")}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map(({ label, value, icon: Icon, href, color }) => (
          <Link
            key={label}
            href={href}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-surface p-3 text-center hover:shadow-sm"
          >
            <div className={`flex h-9 w-9 items-center justify-center rounded-full ${color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <p className="text-lg font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </Link>
        ))}
      </div>

      {/* Search teachers CTA */}
      <Link
        href={`/${locale}/client/client/teacher`}
        className="flex items-center gap-3 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4 hover:bg-primary/10"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Search className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-primary">{t("findTeacher")}</p>
          <p className="text-xs text-muted-foreground">{t("findTeacherDesc")}</p>
        </div>
      </Link>

      {/* Recent requests */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">{t("tutorRequests")}</h2>
          <Link href={`/${locale}/client/client/requests`} className="text-xs text-primary hover:underline">
            {tCommon("viewAll")}
          </Link>
        </div>
        {tutorStore.isLoading ? (
          <PageSkeleton rows={2} />
        ) : recentRequests.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noRequestsYet")}</p>
        ) : (
          <div className="space-y-3">
            {recentRequests.map((r) => (
              <TutorRequestCard key={r.id} request={r} showActions={false} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
