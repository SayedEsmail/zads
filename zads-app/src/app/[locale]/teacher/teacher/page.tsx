"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Search, FileText } from "lucide-react";
import { useTeacherStore } from "@/stores/teacher";
import { useContactRequestsStore } from "@/stores/contact-requests";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { ErrorBanner } from "@/components/shared/ErrorBanner";

export default function TeacherDashboardPage() {
  const locale = useLocale();
  const t = useTranslations("teacher");
  const tCommon = useTranslations("common");
  const teacherStore = useTeacherStore();
  const contactStore = useContactRequestsStore();

  useEffect(() => {
    teacherStore.fetch();
    teacherStore.fetchStats();
    contactStore.fetchIncoming();
  }, []);

  if (teacherStore.isLoading && !teacherStore.data) return <PageSkeleton />;
  if (teacherStore.error) return <ErrorBanner error={teacherStore.error} onRetry={teacherStore.fetch} />;

  const { stats } = teacherStore;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="rounded-[1.25rem] bg-gradient-to-r from-orange-500 to-amber-500 p-6 sm:p-8 text-white shadow-[0_10px_40px_-10px_rgba(245,158,11,0.4)] relative overflow-hidden isolate">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-32 h-32 bg-amber-200/20 rounded-full blur-xl"></div>
        
        <div className="relative z-10">
          <p className="text-sm font-medium text-orange-100 mb-1">{t("welcome")}</p>
          <p className="text-2xl sm:text-3xl font-bold mb-2">{teacherStore.data?.user?.name} 🎓</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: t("stats.views"), value: stats.views, color: "text-blue-600 bg-blue-100" },
            { label: t("stats.contacts"), value: stats.contactRequests, color: "text-orange-600 bg-orange-100" },
            { label: t("stats.rating"), value: Number(stats.rating).toFixed(1), color: "text-emerald-600 bg-emerald-100" },
          ].map(({ label, value, color }) => (
            <div key={label} className="group rounded-[1.25rem] bg-white p-4 text-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] transition-all duration-300">
              <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 ${color}`}>
                <p className="text-lg font-bold">{value}</p>
              </div>
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
            </div>
          ))}
          <Link
            href={`/${locale}/teacher/subjects`}
            className="group rounded-[1.25rem] bg-white p-4 text-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 border border-transparent hover:border-orange-100"
          >
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 transition-transform duration-300 group-hover:scale-110">
              <p className="text-lg font-bold">{teacherStore.data?.subjects?.length ?? 0}</p>
            </div>
            <p className="text-xs font-medium text-muted-foreground">{t("stats.subjects")}</p>
          </Link>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4">
        <Link href={`/${locale}/teacher/browse`} className="group flex items-center gap-3 rounded-[1.25rem] bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] transition-all duration-300">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
            <Search className="h-5 w-5" />
          </div>
          <span className="font-semibold text-foreground">{t("browseRequests")}</span>
        </Link>
        <Link href={`/${locale}/teacher/requests`} className="group flex items-center gap-3 rounded-[1.25rem] bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] transition-all duration-300">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
            <FileText className="h-5 w-5" />
          </div>
          <span className="font-semibold text-foreground">{t("myRequests")}</span>
        </Link>
      </div>

      {/* Incoming contact requests */}
      <section className="rounded-[1.25rem] bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        <h2 className="mb-4 text-lg font-bold text-foreground">{t("incomingContacts")}</h2>
        <div className="space-y-3">
          {(contactStore.incoming ?? []).slice(0, 5).map((r) => (
            <div key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-slate-50 p-4 border border-transparent transition-all hover:border-blue-100">
              <div>
                <p className="font-bold text-foreground">{r.parent?.user.name}</p>
                <p className="text-sm font-medium text-muted-foreground">{r.subject?.nameAr} — {r.message}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => contactStore.updateStatus(r.id, "accepted")}
                  className="rounded-lg bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-200 transition-colors"
                >
                  {tCommon("accept")}
                </button>
                <button
                  onClick={() => contactStore.updateStatus(r.id, "rejected")}
                  className="rounded-lg bg-rose-100 px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-200 transition-colors"
                >
                  {tCommon("reject")}
                </button>
              </div>
            </div>
          ))}
          {(contactStore.incoming ?? []).length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/20 rounded-xl">
              <p className="text-sm font-medium text-muted-foreground">{t("noIncomingRequests")}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
