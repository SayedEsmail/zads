"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Search, FileText, Eye, Star, BookOpen, MessageSquare, ChevronRight, Check, X } from "lucide-react";
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

  const isLocationComplete = !!teacherStore.data?.areaId;
  const isBioComplete = !!teacherStore.data?.bio;
  const hasSubjects = !!(teacherStore.data?.subjects && teacherStore.data.subjects.length > 0);
  const showCompletionBanner = !isLocationComplete || !isBioComplete || !hasSubjects;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="rounded-[1.25rem] bg-gradient-to-r from-blue-600 to-indigo-600 p-6 sm:p-8 text-white shadow-[0_10px_40px_-10px_rgba(37,99,235,0.4)] relative overflow-hidden isolate">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-32 h-32 bg-indigo-400/20 rounded-full blur-xl"></div>
        
        <div className="relative z-10">
          <p className="text-sm font-medium text-blue-100 mb-1">{t("welcome")}</p>
          <p className="text-2xl sm:text-3xl font-bold mb-2">{teacherStore.data?.user?.name} 👋</p>
          <p className="text-sm text-blue-100/90 max-w-md leading-relaxed">
            {locale === "ar" ? "أهلاً بك في منصة زاد التعليمية للمعلمين المتميزين" : "Welcome to the Zads learning platform for excellent teachers"}
          </p>
        </div>
      </div>

      {/* Profile Completion Alert Banner */}
      {showCompletionBanner && (
        <div className="rounded-[1.25rem] border border-amber-200 bg-amber-50/70 backdrop-blur-md p-5 text-amber-950 shadow-[0_4px_20px_-4px_rgba(245,158,11,0.08)] space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 font-bold text-sm">!</span>
            <div className="text-start">
              <h3 className="font-bold text-base text-amber-950">{t("setupAlertTitle")}</h3>
              <p className="text-xs text-amber-800 mt-0.5">{t("setupAlertDesc")}</p>
            </div>
          </div>
          
          <ul className="space-y-2 text-xs font-semibold px-9 text-start">
            <li className="flex items-center gap-2">
              <span className={`h-4.5 w-4.5 rounded-full flex items-center justify-center border text-[10px] ${
                isLocationComplete ? "bg-emerald-100 border-emerald-300 text-emerald-700 font-bold" : "border-amber-300 bg-white text-transparent"
              }`}>✓</span>
              <Link href={`/${locale}/teacher/teacher/profile`} className={`hover:underline ${isLocationComplete ? "text-slate-400 line-through font-normal" : "text-primary"}`}>
                {t("setupLocation")}
              </Link>
            </li>
            
            <li className="flex items-center gap-2">
              <span className={`h-4.5 w-4.5 rounded-full flex items-center justify-center border text-[10px] ${
                hasSubjects ? "bg-emerald-100 border-emerald-300 text-emerald-700 font-bold" : "border-amber-300 bg-white text-transparent"
              }`}>✓</span>
              <Link href={`/${locale}/teacher/teacher/subjects`} className={`hover:underline ${hasSubjects ? "text-slate-400 line-through font-normal" : "text-primary"}`}>
                {t("setupSubjects")}
              </Link>
            </li>

            <li className="flex items-center gap-2">
              <span className={`h-4.5 w-4.5 rounded-full flex items-center justify-center border text-[10px] ${
                isBioComplete ? "bg-emerald-100 border-emerald-300 text-emerald-700 font-bold" : "border-amber-300 bg-white text-transparent"
              }`}>✓</span>
              <Link href={`/${locale}/teacher/teacher/profile`} className={`hover:underline ${isBioComplete ? "text-slate-400 line-through font-normal" : "text-primary"}`}>
                {t("setupBio")}
              </Link>
            </li>
          </ul>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: t("stats.views"), value: stats.views, icon: Eye, color: "bg-blue-50 text-blue-600" },
            { label: t("stats.contacts"), value: stats.contactRequests, icon: MessageSquare, color: "bg-orange-50 text-orange-600" },
            { label: t("stats.rating"), value: Number(stats.rating).toFixed(1), icon: Star, color: "bg-emerald-50 text-emerald-600" },
            { label: t("stats.subjects"), value: teacherStore.data?.subjects?.length ?? 0, icon: BookOpen, color: "bg-indigo-50 text-indigo-600", href: `/${locale}/teacher/teacher/subjects` },
          ].map(({ label, value, icon: Icon, color, href }) => {
            const content = (
              <>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-105 ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1 text-start">
                  <p className="text-xl font-extrabold text-foreground leading-tight">{value}</p>
                  <p className="text-[11px] font-semibold text-muted-foreground truncate mt-0.5">{label}</p>
                </div>
              </>
            );

            return href ? (
              <Link
                key={label}
                href={href}
                className="group flex items-center gap-3 rounded-[1rem] bg-white p-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 border border-transparent hover:border-indigo-100"
              >
                {content}
              </Link>
            ) : (
              <div
                key={label}
                className="group flex items-center gap-3 rounded-[1rem] bg-white p-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300"
              >
                {content}
              </div>
            );
          })}
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href={`/${locale}/teacher/teacher/browse`}
          className="group flex items-center justify-between rounded-[1.25rem] bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-blue-100"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Search className="h-6 w-6" />
            </div>
            <div className="text-right">
              <p className="font-bold text-foreground text-lg">{t("browseRequests")}</p>
              <p className="text-xs text-muted-foreground">
                {locale === "ar" ? "ابحث عن فرص التدريس المتاحة في منطقتك" : "Find teaching opportunities in your area"}
              </p>
            </div>
          </div>
          <div className="h-8 w-8 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </div>
        </Link>

        <Link
          href={`/${locale}/teacher/teacher/requests`}
          className="group flex items-center justify-between rounded-[1.25rem] bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-orange-100"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
              <FileText className="h-6 w-6" />
            </div>
            <div className="text-right">
              <p className="font-bold text-foreground text-lg">{t("myRequests")}</p>
              <p className="text-xs text-muted-foreground">
                {locale === "ar" ? "أدر طلبات التواصل المباشر وحجوزات الطلاب" : "Manage direct contact requests from students"}
              </p>
            </div>
          </div>
          <div className="h-8 w-8 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </div>
        </Link>
      </div>

      {/* Incoming contact requests */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">{t("incomingContacts")}</h2>
          <Link href={`/${locale}/teacher/teacher/requests`} className="text-sm font-medium text-primary hover:text-blue-700 hover:underline">
            {tCommon("viewAll")}
          </Link>
        </div>
        
        <div className="space-y-3">
          {(contactStore.incoming ?? []).slice(0, 5).map((r) => {
            const initials = r.parent?.user?.name ? r.parent.user.name.split(" ").slice(0, 2).map(n => n[0]).join("") : "U";
            return (
              <div key={r.id} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[1.25rem] bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-transparent hover:border-blue-100/50 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                    {initials}
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-foreground text-base">{r.parent?.user?.name}</p>
                      {r.subject && (
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                          {r.subject.nameAr}
                        </span>
                      )}
                      {r.stage && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                          {r.stage.nameAr}
                        </span>
                      )}
                    </div>
                    {r.message && (
                      <p className="text-sm text-muted-foreground bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 mt-1.5 italic relative">
                        {r.message}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => contactStore.updateStatus(r.id, "accepted")}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-95 transition-all duration-150"
                  >
                    <Check className="h-4 w-4" />
                    {tCommon("accept")}
                  </button>
                  <button
                    onClick={() => contactStore.updateStatus(r.id, "rejected")}
                    className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 hover:bg-rose-100 active:scale-95 transition-all duration-150"
                  >
                    <X className="h-4 w-4" />
                    {tCommon("reject")}
                  </button>
                </div>
              </div>
            );
          })}
          
          {(contactStore.incoming ?? []).length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center bg-muted/20 rounded-[1.25rem]">
              <div className="w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center mb-3">
                <FileText className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">{t("noIncomingRequests")}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
