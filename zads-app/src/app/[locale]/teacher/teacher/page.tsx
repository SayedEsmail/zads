"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { BarChart2, FileText, Search } from "lucide-react";
import { useTeacherStore } from "@/stores/teacher";
import { useTutorRequestsStore } from "@/stores/tutor-requests";
import { useContactRequestsStore } from "@/stores/contact-requests";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { TutorRequestCard } from "@/components/shared/TutorRequestCard";

export default function TeacherDashboardPage() {
  const locale = useLocale();
  const t = useTranslations("teacher");
  const teacherStore = useTeacherStore();
  const contactStore = useContactRequestsStore();
  const tutorStore = useTutorRequestsStore();

  useEffect(() => {
    teacherStore.fetch();
    teacherStore.fetchStats();
    contactStore.fetchIncoming();
    tutorStore.fetch();
  }, []);

  if (teacherStore.isLoading && !teacherStore.data) return <PageSkeleton />;
  if (teacherStore.error) return <ErrorBanner error={teacherStore.error} onRetry={teacherStore.fetch} />;

  const { stats } = teacherStore;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-l from-secondary/5 to-secondary/10 p-5">
        <p className="text-sm text-muted-foreground">أهلاً بك</p>
        <p className="text-xl font-bold text-secondary">{teacherStore.data?.user?.name} 🎓</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: t("stats.views"), value: stats.views, color: "bg-primary/10 text-primary" },
            { label: t("stats.contacts"), value: stats.contactRequests, color: "bg-secondary/10 text-secondary" },
            { label: t("stats.rating"), value: Number(stats.rating).toFixed(1), color: "bg-success/10 text-success" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border border-border bg-surface p-3 text-center">
              <p className={`text-lg font-bold ${color.split(" ")[1]}`}>{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
          <Link
            href={`/${locale}/teacher/subjects`}
            className="rounded-xl border border-border bg-surface p-3 text-center hover:shadow-sm"
          >
            <p className="text-lg font-bold text-primary">{teacherStore.data?.subjects?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground">{t("stats.subjects")}</p>
          </Link>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <Link href={`/${locale}/teacher/browse`} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 hover:shadow-sm">
          <Search className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">{t("browseRequests")}</span>
        </Link>
        <Link href={`/${locale}/teacher/requests`} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 hover:shadow-sm">
          <FileText className="h-5 w-5 text-secondary" />
          <span className="text-sm font-medium">{t("myRequests")}</span>
        </Link>
      </div>

      {/* Incoming contact requests */}
      <section>
        <h2 className="mb-3 font-semibold">طلبات التواصل الواردة</h2>
        <div className="space-y-3">
          {(contactStore.incoming ?? []).slice(0, 5).map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
              <div>
                <p className="font-medium">{r.parent?.user.name}</p>
                <p className="text-sm text-muted-foreground">{r.subject?.nameAr} — {r.message}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => contactStore.updateStatus(r.id, "accepted")}
                  className="rounded-lg bg-success/10 px-3 py-1.5 text-xs font-medium text-success hover:bg-success/20"
                >
                  قبول
                </button>
                <button
                  onClick={() => contactStore.updateStatus(r.id, "rejected")}
                  className="rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20"
                >
                  رفض
                </button>
              </div>
            </div>
          ))}
          {(contactStore.incoming ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">لا توجد طلبات واردة</p>
          )}
        </div>
      </section>
    </div>
  );
}
