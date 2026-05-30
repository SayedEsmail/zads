"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { MapPin, Star, GraduationCap, Award, Clock, BookOpen } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import api from "@/lib/api";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { formatPrice, getInitials } from "@/lib/utils";
import type { Teacher } from "@/types";
import { useContactRequestsStore } from "@/stores/contact-requests";
import { toast } from "sonner";

const DAYS_AR = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const DAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TeacherDetailPage() {
  const locale = useLocale();
  const { id } = useParams<{ id: string }>();
  const tTeacher = useTranslations("teacher");
  const tCommon = useTranslations("common");
  const tAdmin = useTranslations("admin");
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking states
  const [showDialog, setShowDialog] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [studyMode, setStudyMode] = useState<"online" | "offline">("online");
  const [message, setMessage] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { sent, fetch: fetchSentRequests, createRequest, isLoading: isLoadingRequests } = useContactRequestsStore();

  useEffect(() => {
    fetchSentRequests();
  }, [fetchSentRequests]);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    api
      .get<{ data: Teacher }>(`/teachers/${id}`)
      .then((res) => {
        if (!cancelled) setTeacher(res.data.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message ?? err.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const pendingRequest = sent?.find((r) => r.teacherId === id && r.status === "pending");
  const selectedSubjectRate = teacher?.subjects?.find((s) => s.id === selectedSubjectId);

  // Auto select default studyMode based on pricing availability when subject changes
  // Removed synchronous setState in useEffect and moved directly to event handlers to comply with React Compiler constraints.

  const currentPrice =
    studyMode === "online"
      ? selectedSubjectRate?.priceOnline
      : selectedSubjectRate?.priceOffline;

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let finalMessage = message.trim();
      if (selectedSlot) {
        finalMessage = locale === "ar"
          ? `[الموعد المفضل: ${selectedSlot}]\n${finalMessage}`
          : `[Preferred Time: ${selectedSlot}]\n${finalMessage}`;
      }

      await createRequest({
        teacherId: id,
        subjectId: selectedSubjectRate?.subjectId || undefined,
        stageId: selectedSubjectRate?.stageId || undefined,
        message: finalMessage || undefined,
      });

      toast.success("تم إرسال طلب التواصل المباشر بنجاح!");
      setShowDialog(false);
      setMessage("");
      setSelectedSlot("");
    } catch (err) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      setSubmitError(axiosErr.response?.data?.message ?? axiosErr.message ?? "حدث خطأ أثناء إرسال الطلب");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <PageSkeleton rows={6} />;

  if (!teacher) {
    return (
      <div className="max-w-3xl mx-auto">
        <ErrorBanner error={error ?? tAdmin("teacherNotFound")} />
      </div>
    );
  }

  const user = teacher.user;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <ErrorBanner error={error} />

      <section className="rounded-[1.25rem] border border-slate-100 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-6">
        {/* Profile Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 border-b border-slate-50 pb-5">
          <div className="flex items-center gap-4 text-start">
            {/* Avatar / Initials circle */}
            <div className="shrink-0">
              {user?.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.name ?? ""}
                  width={64}
                  height={64}
                  className="rounded-full object-cover border-2 border-primary/10 shadow-sm"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg shadow-inner">
                  {getInitials(user?.name ?? "?")}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-black text-slate-800 leading-tight">{user?.name}</h1>
              <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground font-medium">
                <span className="flex items-center gap-0.5 text-amber-500">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  <strong className="text-slate-800 text-sm font-bold ms-0.5">{Number(teacher.avgRating).toFixed(1)}</strong>
                  <span className="text-slate-400">({teacher.ratingCount})</span>
                </span>
                <span className="text-slate-300">•</span>
                {teacher.area && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>
                      {teacher.area.nameAr}
                      {teacher.area.city?.nameAr ? ` · ${teacher.area.city.nameAr}` : ""}
                    </span>
                  </span>
                )}
                {teacher.isVerified && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      {tCommon("verified")}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            {pendingRequest ? (
              <span className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl bg-amber-50 border border-amber-200 px-5 py-2.5 text-sm font-bold text-amber-700 shadow-sm cursor-not-allowed">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                {"طلب تواصل معلق"}
              </span>
            ) : (
              <button
                onClick={() => {
                  if (teacher.subjects && teacher.subjects.length > 0) {
                    const firstSub = teacher.subjects[0];
                    setSelectedSubjectId(firstSub.id);
                    if (firstSub.priceOnline != null) {
                      setStudyMode("online");
                    } else if (firstSub.priceOffline != null) {
                      setStudyMode("offline");
                    }
                  }
                  setShowDialog(true);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-dark px-6 py-2.5 text-sm font-bold text-white shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer active:scale-98"
              >
                {"طلب تواصل مباشر"}
              </button>
            )}
          </div>
        </div>

        {/* Bio */}
        {teacher.bio && (
          <div className="mt-5 text-start">
            <p className="text-sm leading-7 text-slate-600 bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50">
              {teacher.bio}
            </p>
          </div>
        )}

        {/* Credentials Grid */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 text-start">
          {teacher.qualification && (
            <div className="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.02)]">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{tCommon("qualification")}</p>
                <p className="font-bold text-slate-800 text-sm mt-0.5 truncate">{teacher.qualification}</p>
              </div>
            </div>
          )}
          {teacher.experienceYears != null && (
            <div className="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.02)]">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <Award className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{tCommon("experienceYears")}</p>
                <p className="font-bold text-slate-800 text-sm mt-0.5">
                  {teacher.experienceYears} {locale === "ar" ? "سنوات" : "Years"}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Weekly Availability Schedule */}
      <section className="space-y-3.5 text-start">
        <h2 className="font-black text-slate-850 text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-slate-450 shrink-0" />
          {locale === "ar" ? "مواعيد العمل المتاحة" : "Available Tutoring Hours"}
        </h2>
        {!teacher.availabilities || teacher.availabilities.length === 0 ? (
          <div className="rounded-[1.25rem] border border-slate-200 bg-white p-5 text-center text-sm text-muted-foreground shadow-sm">
            {locale === "ar"
              ? "المعلم لم يحدد مواعيد عمل ثابتة، يمكنك طلب تواصل مباشر للتنسيق معه."
              : "Teacher has not set fixed weekly hours, request direct contact to coordinate slots."}
          </div>
        ) : (
          <div className="rounded-[1.25rem] border border-slate-100 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] p-5 space-y-3">
            {(locale === "ar" ? DAYS_AR : DAYS_EN).map((dayName, idx) => {
              const daySlots = teacher.availabilities?.filter((s) => s.dayOfWeek === idx) ?? [];
              if (daySlots.length === 0) return null; // Only render days that have slots!

              return (
                <div key={dayName} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-50 last:border-b-0 pb-3 last:pb-0">
                  <div className="font-bold text-slate-700 text-sm w-24 shrink-0">
                    {dayName}
                  </div>
                  <div className="flex-1 flex flex-wrap gap-1.5">
                    {daySlots.map((slot) => {
                      const formatTime = (time: string) => {
                        const [h, m] = time.split(":");
                        const hour = parseInt(h);
                        const ampm = hour >= 12 ? (locale === "ar" ? "م" : "PM") : (locale === "ar" ? "ص" : "AM");
                        const displayHour = hour % 12 || 12;
                        return `${displayHour}:${m} ${ampm}`;
                      };
                      return (
                        <span key={slot.id} className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 border border-orange-100/50 px-3 py-0.5 text-xs font-semibold text-orange-700">
                          <Clock className="w-3 h-3 text-orange-400 shrink-0" />
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Subjects Taught & Pricing */}
      <section className="space-y-3.5 text-start">
        <h2 className="font-black text-slate-850 text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-slate-450 shrink-0" />
          {tTeacher("subjects")}
        </h2>
        {(teacher.subjects ?? []).length === 0 ? (
          <div className="rounded-[1.25rem] border border-slate-200 bg-white p-8 text-center text-sm text-muted-foreground shadow-sm">
            {tAdmin("noSubjects")}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {teacher.subjects?.map((item) => (
              <div
                key={item.id}
                className="group rounded-[1.25rem] border border-slate-100 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col gap-3.5"
              >
                <div className="flex items-start justify-between gap-3 border-b border-slate-50 pb-3">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-800 text-base">{item.subject?.nameAr}</p>
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                      {item.stage?.nameAr}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 shrink-0">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-semibold">{tCommon("duration", { minutes: item.durationMinutes })}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  {item.priceOnline != null && (
                    <span className="rounded-xl bg-sky-50 border border-sky-100/50 px-3 py-1 font-bold text-sky-700 shadow-[0_1px_2px_rgba(14,165,233,0.03)]">
                      💻 {tCommon("online")} {formatPrice(item.priceOnline)}
                    </span>
                  )}
                  {item.priceOffline != null && (
                    <span className="rounded-xl bg-amber-50 border border-amber-100/50 px-3 py-1 font-bold text-amber-700 shadow-[0_1px_2px_rgba(245,158,11,0.03)]">
                      🏠 {tCommon("offline")} {formatPrice(item.priceOffline)}
                    </span>
                  )}
                  {item.priceAtTeacher != null && (
                    <span className="rounded-xl bg-indigo-50 border border-indigo-100/50 px-3 py-1 font-bold text-indigo-700 shadow-[0_1px_2px_rgba(99,102,241,0.03)]">
                      🏫 {tCommon("atTeacher") || "عند المعلم"} {formatPrice(item.priceAtTeacher)}
                    </span>
                  )}
                  {item.priceAtStudent != null && (
                    <span className="rounded-xl bg-purple-50 border border-purple-100/50 px-3 py-1 font-bold text-purple-700 shadow-[0_1px_2px_rgba(168,85,247,0.03)]">
                      🎒 {tCommon("atStudent") || "عند الطالب"} {formatPrice(item.priceAtStudent)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Sleek booking dialog */}
      {showDialog && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center animate-in fade-in duration-200"
          onClick={() => setShowDialog(false)}
        >
          <div
            className="relative w-full max-w-md rounded-t-[1.25rem] bg-white p-6 shadow-2xl animate-in slide-in-from-bottom-5 duration-300 sm:rounded-[1.25rem] text-start border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">
                {"طلب تواصل مباشر مع معلم"}
              </h3>
              <button
                onClick={() => setShowDialog(false)}
                className="h-8 w-8 rounded-full bg-muted/40 hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              {submitError && (
                <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
                  {submitError}
                </div>
              )}

              {/* Subject Taught */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5">
                  {"المادة المراد دراستها"}
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => {
                    const subId = e.target.value;
                    setSelectedSubjectId(subId);
                    const subRate = teacher.subjects?.find((s) => s.id === subId);
                    if (subRate) {
                      if (subRate.priceOnline != null) {
                        setStudyMode("online");
                      } else if (subRate.priceOffline != null) {
                        setStudyMode("offline");
                      }
                    }
                  }}
                  required
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                >
                  <option value="" disabled>{"اختر مادة..."}</option>
                  {teacher.subjects?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.subject?.nameAr} - {s.stage?.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Study Mode */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5">
                  {"طريقة التعلم"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStudyMode("online")}
                    disabled={selectedSubjectRate?.priceOnline == null && selectedSubjectRate?.priceOffline != null}
                    className={`rounded-xl py-2.5 text-xs font-bold border transition-all cursor-pointer ${
                      studyMode === "online"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:bg-muted text-muted-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                    }`}
                  >
                    {"أونلاين"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStudyMode("offline")}
                    disabled={selectedSubjectRate?.priceOffline == null && selectedSubjectRate?.priceOnline != null}
                    className={`rounded-xl py-2.5 text-xs font-bold border transition-all cursor-pointer ${
                      studyMode === "offline"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:bg-muted text-muted-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                    }`}
                  >
                    {"أوفلاين"}
                  </button>
                </div>
              </div>

              {/* Dynamic Rates Display */}
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-muted-foreground">{"سعر الحصة التقديري"}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {selectedSubjectRate?.durationMinutes ? `مدة الحصة: ${selectedSubjectRate.durationMinutes} دقيقة` : ""}
                  </p>
                </div>
                <div className="text-end">
                  {currentPrice != null ? (
                    <span className="text-lg font-extrabold text-primary">
                      {formatPrice(currentPrice)}
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                      {"السعر حسب الاتفاق"}
                    </span>
                  )}
                </div>
              </div>

              {/* Proposed Time Slot */}
              {teacher.availabilities && teacher.availabilities.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5">
                    {locale === "ar" ? "اختر موعداً مقترحاً من جدول المعلم (اختياري)" : "Select a slot from teacher's schedule (optional)"}
                  </label>
                  <select
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                  >
                    <option value="">{locale === "ar" ? "اختر موعداً..." : "Choose a time slot..."}</option>
                    {teacher.availabilities.map((slot) => {
                      const dayName = (locale === "ar" ? DAYS_AR : DAYS_EN)[slot.dayOfWeek];
                      const formatTime = (time: string) => {
                        const [h, m] = time.split(":");
                        const hour = parseInt(h);
                        const ampm = hour >= 12 ? (locale === "ar" ? "م" : "PM") : (locale === "ar" ? "ص" : "AM");
                        const displayHour = hour % 12 || 12;
                        return `${displayHour}:${m} ${ampm}`;
                      };
                      return (
                        <option key={slot.id} value={`${dayName} • ${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`}>
                          {dayName} • {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5">
                  {"رسالتك للمعلم (اختياري)"}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={"اكتب تفاصيل إضافية حول احتياجات ابنك التعليمية..."}
                  rows={3}
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDialog(false)}
                  className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold hover:bg-muted transition-colors cursor-pointer"
                >
                  {"إلغاء"}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isLoadingRequests}
                  className="flex-1 rounded-xl bg-primary hover:bg-primary-dark text-white py-2.5 text-sm font-semibold shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "جاري الإرسال..." : "إرسال الطلب"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
