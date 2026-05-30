"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { FileText, Eye, Star, BookOpen, ChevronRight } from "lucide-react";
import { useTeacherStore } from "@/stores/teacher";
import { useContactRequestsStore } from "@/stores/contact-requests";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { TutorRequestCard } from "@/components/shared/TutorRequestCard";
import type { TutorRequest } from "@/types";
import { toast } from "sonner";
import api from "@/lib/api";

export default function TeacherDashboardPage() {
  const locale = useLocale();
  const t = useTranslations("teacher");
  const tCommon = useTranslations("common");
  const teacherStore = useTeacherStore();
  const contactStore = useContactRequestsStore();

  const [tutorRequests, setTutorRequests] = useState<TutorRequest[]>([]);
  const [isLoadingTutorRequests, setIsLoadingTutorRequests] = useState(true);
  const [tutorRequestsError, setTutorRequestsError] = useState<string | null>(null);

  // Proposal modal state
  const [selectedRequest, setSelectedRequest] = useState<TutorRequest | null>(null);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    teacherStore.fetch();
    teacherStore.fetchStats();
    contactStore.fetchIncoming();

    // Fetch top 3 nearby tutor requests
    api.get<{ data: TutorRequest[] }>("/tutor-requests?limit=3")
      .then((res) => setTutorRequests(res.data.data))
      .catch((err) => setTutorRequestsError(err.response?.data?.message ?? err.message))
      .finally(() => setIsLoadingTutorRequests(false));
  }, []);

  if (teacherStore.isLoading && !teacherStore.data) return <PageSkeleton />;
  if (teacherStore.error) return <ErrorBanner error={teacherStore.error} onRetry={teacherStore.fetch} />;

  const { stats } = teacherStore;

  const isLocationComplete = !!teacherStore.data?.areaId;
  const isBioComplete = !!teacherStore.data?.bio;
  const hasSubjects = !!(teacherStore.data?.subjects && teacherStore.data.subjects.length > 0);
  const showCompletionBanner = !isLocationComplete || !isBioComplete || !hasSubjects;

  // Unified 3-column stats list matching client
  const statsList = stats ? [
    {
      label: t("stats.views"),
      value: stats.views,
      icon: Eye,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: t("stats.rating"),
      value: Number(stats.rating).toFixed(1),
      icon: Star,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: t("stats.subjects"),
      value: teacherStore.data?.subjects?.length ?? 0,
      icon: BookOpen,
      href: `/${locale}/teacher/subjects`,
      color: "bg-indigo-50 text-indigo-600",
    },
  ] : [];

  const handleSendContact = () => {
    if (!selectedRequest) return;
    setIsSending(true);
    api
      .post("/contact-requests/teacher", {
        parentId: selectedRequest.parentId,
        subjectId: selectedRequest.subjectId,
        stageId: selectedRequest.stageId,
        message: message.trim() || undefined,
      })
      .then(() => {
        toast.success(
          locale === "ar"
            ? "تم إرسال طلب التواصل للعميل بنجاح!"
            : "Contact request sent to client successfully!"
        );
        setSelectedRequest(null);
        setMessage("");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message ?? err.message);
      })
      .finally(() => setIsSending(false));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-start">
      {/* Header */}
      <div className="rounded-[1.25rem] bg-gradient-to-r from-blue-600 to-indigo-600 p-6 sm:p-8 text-white shadow-[0_10px_40px_-10px_rgba(37,99,235,0.4)] relative overflow-hidden isolate">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-32 h-32 bg-indigo-400/20 rounded-full blur-xl"></div>
        
        <div className="relative z-10">
          <p className="text-sm font-medium text-blue-100 mb-1">{t("welcome")}</p>
          <p className="text-2xl sm:text-3xl font-bold mb-2">{teacherStore.data?.user?.name} 👋</p>
          <p className="text-sm text-blue-100/90 max-w-md leading-relaxed">
            {locale === "ar"
              ? "أهلاً بك في منصة زاد التعليمية للمعلمين المتميزين"
              : "Welcome to the Zads learning platform for excellent teachers"}
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
              <Link href={`/${locale}/teacher/profile`} className={`hover:underline ${isLocationComplete ? "text-slate-400 line-through font-normal" : "text-primary"}`}>
                {t("setupLocation")}
              </Link>
            </li>
            
            <li className="flex items-center gap-2">
              <span className={`h-4.5 w-4.5 rounded-full flex items-center justify-center border text-[10px] ${
                hasSubjects ? "bg-emerald-100 border-emerald-300 text-emerald-700 font-bold" : "border-amber-300 bg-white text-transparent"
              }`}>✓</span>
              <Link href={`/${locale}/teacher/subjects`} className={`hover:underline ${hasSubjects ? "text-slate-400 line-through font-normal" : "text-primary"}`}>
                {t("setupSubjects")}
              </Link>
            </li>

            <li className="flex items-center gap-2">
              <span className={`h-4.5 w-4.5 rounded-full flex items-center justify-center border text-[10px] ${
                isBioComplete ? "bg-emerald-100 border-emerald-300 text-emerald-700 font-bold" : "border-amber-300 bg-white text-transparent"
              }`}>✓</span>
              <Link href={`/${locale}/teacher/profile`} className={`hover:underline ${isBioComplete ? "text-slate-400 line-through font-normal" : "text-primary"}`}>
                {t("setupBio")}
              </Link>
            </li>
          </ul>
        </div>
      )}

      {/* Stats (Unified 3-column stats list matching client) */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          {statsList.map(({ label, value, icon: Icon, href, color }) => {
            const content = (
              <>
                <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground leading-none mb-1">{value}</p>
                  <p className="text-xs font-semibold text-muted-foreground">{label}</p>
                </div>
              </>
            );

            return href ? (
              <Link
                key={label}
                href={href}
                className="group flex flex-col items-center gap-2 rounded-[1.25rem] bg-white p-4 text-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300"
              >
                {content}
              </Link>
            ) : (
              <div
                key={label}
                className="group flex flex-col items-center gap-2 rounded-[1.25rem] bg-white p-4 text-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300"
              >
                {content}
              </div>
            );
          })}
        </div>
      )}

      {/* Direct Contact Requests Big CTA Card (Unified layout & showing count) */}
      {stats && (
        <Link
          href={`/${locale}/teacher/requests`}
          className="group flex items-center justify-between rounded-[1.25rem] bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-orange-100"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-foreground text-lg leading-tight mb-1">
                {locale === "ar" ? "طلبات التواصل المباشر" : "Direct Contact Requests"}{" "}
                <span className="text-primary-dark">({stats.contactRequests})</span>
              </p>
              <p className="text-sm text-muted-foreground">
                {locale === "ar"
                  ? "أدر طلبات التواصل المباشر والردود وحجوزات الطلاب"
                  : "Manage direct contact requests, replies, and student bookings"}
              </p>
            </div>
          </div>
          <div className="h-8 w-8 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300 shrink-0">
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </div>
        </Link>
      )}

      {/* Available Teaching Opportunities Section (Symmetric nearby tutor requests display) */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">
            {locale === "ar" ? "فرص التدريس المتاحة في منطقتك" : "Available Teaching Opportunities"}
          </h2>
          <Link href={`/${locale}/teacher/browse`} className="text-sm font-semibold text-primary hover:text-blue-700 hover:underline">
            {tCommon("viewAll")}
          </Link>
        </div>

        <ErrorBanner error={tutorRequestsError} />

        {isLoadingTutorRequests ? (
          <PageSkeleton rows={2} />
        ) : tutorRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/20 rounded-[1.25rem]">
            <div className="w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center mb-3">
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {t("noRequestsAvailable")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tutorRequests.map((request) => (
              <TutorRequestCard
                key={request.id}
                request={request}
                showActions={false}
                onContact={(req) => setSelectedRequest(req)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Custom Proposal Modal for Direct Contact */}
      {selectedRequest && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            className="w-full max-w-md rounded-t-2xl bg-white p-6 sm:rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-2 font-bold text-lg">
              {locale === "ar" ? "تواصل مباشر مع ولي الأمر" : "Direct Contact with Parent"}
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              {locale === "ar"
                ? `إرسال رسالة عرض لولي الأمر بخصوص طلب ${selectedRequest.subject?.nameAr}`
                : `Send a proposal message to parent regarding ${selectedRequest.subject?.nameEn || selectedRequest.subject?.nameAr}`}
            </p>

            <div className="space-y-3">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                {locale === "ar" ? "اكتب رسالة العرض الخاصة بك:" : "Write your proposal message:"}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  locale === "ar"
                    ? "مثال: أهلاً بك، أنا أستاذ متخصص في هذه المادة ولدي خبرة طويلة وأريد مساعدتكم..."
                    : "Example: Hello, I am a specialized teacher in this subject with long experience and would love to help you..."
                }
                rows={4}
                className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
              />
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={handleSendContact}
                disabled={isSending || !message.trim()}
                className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-60 transition-colors cursor-pointer"
              >
                {isSending ? tCommon("loading") : (locale === "ar" ? "إرسال الرسالة" : "Send Message")}
              </button>
              <button
                onClick={() => setSelectedRequest(null)}
                className="flex-1 rounded-xl border border-border py-2.5 text-sm hover:bg-muted transition-colors cursor-pointer"
              >
                {tCommon("cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
