"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Users, FileText, Heart, Search, ChevronRight } from "lucide-react";
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
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: t("tutorRequests"),
      value: tutorStore.data?.filter((r) => r.status === "active").length ?? 0,
      icon: FileText,
      href: `/${locale}/client/client/requests`,
      color: "bg-orange-100 text-orange-600",
    },
    {
      label: tNav("favorites"),
      value: 0,
      icon: Heart,
      href: `/${locale}/client/client/favorites`,
      color: "bg-rose-100 text-rose-600",
    },
  ];

  const recentRequests = tutorStore.data?.slice(0, 3) ?? [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Welcome */}
      <div className="rounded-[1.25rem] bg-gradient-to-r from-blue-600 to-indigo-600 p-6 sm:p-8 text-white shadow-[0_10px_40px_-10px_rgba(37,99,235,0.4)] relative overflow-hidden isolate">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-32 h-32 bg-indigo-400/20 rounded-full blur-xl"></div>
        
        <div className="relative z-10">
          <p className="text-sm font-medium text-blue-100 mb-1">{t("welcome")}</p>
          <p className="text-2xl sm:text-3xl font-bold mb-2">{session?.user.name} 👋</p>
          {clientStore.data?.clientAccountKind === "guardian" && (
            <p className="text-sm text-blue-100/90 max-w-md leading-relaxed">
              {t("guardianAccountKindDesc")}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, href, color }) => (
          <Link
            key={label}
            href={href}
            className="group flex flex-col items-center gap-2 rounded-[1.25rem] bg-white p-4 text-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Search teachers CTA */}
      <Link
        href={`/${locale}/client/client/teacher`}
        className="group flex items-center justify-between rounded-[1.25rem] bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-blue-100"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
            <Search className="h-6 w-6" />
          </div>
          <div>
            <p className="font-bold text-foreground text-lg">{t("findTeacher")}</p>
            <p className="text-sm text-muted-foreground">{t("findTeacherDesc")}</p>
          </div>
        </div>
        <div className="h-8 w-8 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
          <ChevronRight className="h-4 w-4 rtl:rotate-180" />
        </div>
      </Link>

      {/* Recent requests */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">{t("tutorRequests")}</h2>
          <Link href={`/${locale}/client/client/requests`} className="text-sm font-medium text-primary hover:text-blue-700 hover:underline">
            {tCommon("viewAll")}
          </Link>
        </div>
        {tutorStore.isLoading ? (
          <PageSkeleton rows={2} />
        ) : recentRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/20 rounded-xl">
            <div className="w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center mb-3">
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">{t("noRequestsYet")}</p>
          </div>
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
