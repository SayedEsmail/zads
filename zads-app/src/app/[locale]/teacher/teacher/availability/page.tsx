"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Clock, Plus, Trash2, Calendar, Save } from "lucide-react";
import { toast } from "sonner";
import { useTeacherAvailabilityStore } from "@/stores/teacher-availability";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { ErrorBanner } from "@/components/shared/ErrorBanner";

const DAYS_AR = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const DAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Generated list of hours from 07:00 to 23:00 (1-hour steps)
const HOURS = Array.from({ length: 17 }, (_, i) => {
  const hour = i + 7;
  return `${hour.toString().padStart(2, "0")}:00`;
});

interface LocalSlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export default function TeacherAvailabilityPage() {
  const locale = useLocale();

  const { data, isLoading, error, fetch, updateAvailability } = useTeacherAvailabilityStore();

  const [localSlots, setLocalSlots] = useState<LocalSlot[]>([]);
  const [form, setForm] = useState({
    dayOfWeek: 0,
    startTime: "09:00",
    endTime: "12:00",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch();
  }, [fetch]);

  // Sync store data to local working slots state when loaded
  useEffect(() => {
    if (data) {
      const timer = setTimeout(() => {
        setLocalSlots(
          data.map((slot) => ({
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
          }))
        );
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [data]);

  if (isLoading && localSlots.length === 0) return <PageSkeleton />;

  const daysList = locale === "ar" ? DAYS_AR : DAYS_EN;

  const handleAddSlot = () => {
    const { dayOfWeek, startTime, endTime } = form;

    // Validation
    const startNum = parseInt(startTime.replace(":", ""));
    const endNum = parseInt(endTime.replace(":", ""));

    if (startNum >= endNum) {
      toast.error(
        locale === "ar"
          ? "يجب أن يكون وقت النهاية بعد وقت البدء"
          : "End time must be after start time"
      );
      return;
    }

    // Check duplicate
    const isDuplicate = localSlots.some(
      (s) => s.dayOfWeek === dayOfWeek && s.startTime === startTime && s.endTime === endTime
    );
    if (isDuplicate) {
      toast.error(
        locale === "ar"
          ? "هذا الموعد مضاف بالفعل في نفس اليوم"
          : "This time slot is already added on the same day"
      );
      return;
    }

    // Add slot
    setLocalSlots((prev) => [...prev, { dayOfWeek, startTime, endTime }].sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
      return a.startTime.localeCompare(b.startTime);
    }));

    toast.success(locale === "ar" ? "تم إضافة الفترة بنجاح" : "Slot added successfully");
  };

  const handleRemoveSlot = (index: number) => {
    setLocalSlots((prev) => prev.filter((_, i) => i !== index));
    toast.success(locale === "ar" ? "تم إزالة الفترة" : "Slot removed");
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await updateAvailability(localSlots);
      toast.success(
        locale === "ar" ? "تم حفظ مواعيد العمل بنجاح" : "Availability schedule saved successfully"
      );
    } catch (err) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message ?? "خطأ أثناء الحفظ");
    } finally {
      setIsSaving(false);
    }
  };

  // Group slots by day of week for rendering
  const getSlotsByDay = (dayIndex: number) => {
    return localSlots.filter((s) => s.dayOfWeek === dayIndex);
  };

  const formatTime = (time: string) => {
    const [h, m] = time.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? (locale === "ar" ? "م" : "PM") : (locale === "ar" ? "ص" : "AM");
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${ampm}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-start">
      {/* Header Banner */}
      <div className="rounded-[1.25rem] bg-gradient-to-r from-orange-500 to-amber-600 p-6 text-white shadow-[0_10px_40px_-10px_rgba(245,158,11,0.3)] relative overflow-hidden isolate">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">
              {locale === "ar" ? "جدول مواعيد العمل الأسبوعية" : "Weekly Availability Schedule"}
            </h1>
            <p className="text-sm text-orange-100/90 mt-1">
              {locale === "ar"
                ? "حدد فترات العمل المتاحة لديك في الأسبوع ليتمكن أولياء الأمور من حجز حصص معك خلالها."
                : "Set your weekly working hours so parents can book matching tutoring slots with you."}
            </p>
          </div>
        </div>
      </div>

      <ErrorBanner error={error} onRetry={fetch} />

      <div className="grid gap-6 md:grid-cols-12 items-start">
        {/* Form Column */}
        <div className="md:col-span-4 rounded-[1.25rem] bg-white p-5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
          <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <Plus className="w-5 h-5 text-orange-500" />
            {locale === "ar" ? "إضافة فترة عمل جديدة" : "Add Time Slot"}
          </h2>

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                {locale === "ar" ? "اختر اليوم" : "Select Day"}
              </label>
              <select
                value={form.dayOfWeek}
                onChange={(e) => setForm((f) => ({ ...f, dayOfWeek: parseInt(e.target.value) }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              >
                {daysList.map((day, idx) => (
                  <option key={day} value={idx}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  {locale === "ar" ? "وقت البدء" : "Start Time"}
                </label>
                <select
                  value={form.startTime}
                  onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                >
                  {HOURS.map((hr) => (
                    <option key={hr} value={hr}>
                      {formatTime(hr)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  {locale === "ar" ? "وقت النهاية" : "End Time"}
                </label>
                <select
                  value={form.endTime}
                  onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                >
                  {HOURS.map((hr) => (
                    <option key={hr} value={hr}>
                      {formatTime(hr)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleAddSlot}
              className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 text-sm transition-all duration-300 flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(245,158,11,0.2)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.35)]"
            >
              <Plus className="w-4.5 h-4.5" />
              {locale === "ar" ? "إضافة الفترة" : "Add Time Slot"}
            </button>
          </div>
        </div>

        {/* Schedule Display Column */}
        <div className="md:col-span-8 space-y-4">
          <div className="rounded-[1.25rem] bg-white border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 p-4 font-bold text-slate-800 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              {locale === "ar" ? "خارطة المواعيد الأسبوعية الحالية" : "Current Weekly Schedule Grid"}
            </div>

            <div className="p-4 space-y-3.5">
              {daysList.map((dayName, idx) => {
                const daySlots = getSlotsByDay(idx);
                return (
                  <div
                    key={dayName}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-50 last:border-b-0 pb-3 last:pb-0"
                  >
                    <div className="font-bold text-slate-700 text-sm w-24 shrink-0">
                      {dayName}
                    </div>

                    <div className="flex-1 flex flex-wrap gap-2">
                      {daySlots.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">
                          {locale === "ar" ? "لا توجد فترات عمل مضافة" : "No slots added"}
                        </span>
                      ) : (
                        daySlots.map((slot) => {
                          const originalIdx = localSlots.findIndex(
                            (s) =>
                              s.dayOfWeek === idx &&
                              s.startTime === slot.startTime &&
                              s.endTime === slot.endTime
                          );
                          return (
                            <span
                              key={`${slot.startTime}-${slot.endTime}`}
                              className="group inline-flex items-center gap-1.5 rounded-full bg-slate-50 hover:bg-red-50 hover:text-red-600 border border-slate-200/60 hover:border-red-200 px-3 py-1 text-xs font-semibold text-slate-600 transition-all duration-300 relative"
                            >
                              <Clock className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-400 shrink-0" />
                              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                              <button
                                onClick={() => handleRemoveSlot(originalIdx)}
                                className="h-4.5 w-4.5 rounded-full bg-slate-200/60 hover:bg-red-500 hover:text-white flex items-center justify-center shrink-0 transition-colors duration-200 focus:outline-none"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            </span>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Save Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white font-bold px-6 py-3 text-sm transition-all duration-300 flex items-center gap-2 shadow-[0_4px_16px_rgba(245,158,11,0.25)] hover:shadow-[0_8px_24px_rgba(245,158,11,0.4)]"
            >
              {isSaving ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <Save className="w-4.5 h-4.5" />
              )}
              {locale === "ar" ? "حفظ جدول المواعيد الكلي" : "Save Weekly Schedule"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
