"use client";

import { useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { MessageCircle, Phone, Check, X, Clock } from "lucide-react";
import { useContactRequestsStore } from "@/stores/contact-requests";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import api from "@/lib/api";
import { toast } from "sonner";

export default function ClientContactsPage() {
    const locale = useLocale();
    const t = useTranslations("request");
    const tCommon = useTranslations("common");
    const contactStore = useContactRequestsStore();

    const handleContactClick = (requestId: string, channel: 'whatsapp' | 'phone') => {
        api.post('/analytics/contact-click', { requestId, channel }).catch(() => {
            // Non-blocking, analytics failure never interrupts user
        });
    };

    useEffect(() => {
        contactStore.fetch();
    }, []);

    const handleAcceptRequest = async (id: string) => {
        try {
            await contactStore.updateParentStatus(id, "accepted");
            toast.success(locale === "ar" ? "تم قبول طلب المعلم بنجاح!" : "Teacher's request accepted!");
        } catch (err) {
            toast.error(locale === "ar" ? "حدث خطأ أثناء قبول الطلب" : "Error accepting request");
        }
    };

    const handleRejectRequest = async (id: string) => {
        try {
            await contactStore.updateParentStatus(id, "rejected");
            toast.success(locale === "ar" ? "تم رفض الطلب" : "Request rejected");
        } catch (err) {
            toast.error(locale === "ar" ? "حدث خطأ أثناء رفض الطلب" : "Error rejecting request");
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-5 text-start">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    {locale === "ar" ? "طلبات التواصل المباشر" : "Direct Contact Requests"}
                </h1>
                <p className="text-xs text-muted-foreground mt-1">
                    {locale === "ar"
                        ? "عرض طلبات التواصل المباشر المتبادلة بينك وبين المعلمين."
                        : "View direct contact requests exchanged between you and teachers."}
                </p>
            </div>

            <ErrorBanner error={contactStore.error} onRetry={contactStore.fetch} />

            {contactStore.isLoading ? (
                <PageSkeleton rows={4} />
            ) : !contactStore.sent || contactStore.sent.length === 0 ? (
                <div className="rounded-[1.25rem] border border-dashed border-slate-200 p-8 text-center bg-white shadow-sm flex flex-col items-center justify-center space-y-3">
                    <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                        <MessageCircle className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">
                        {t("noContactRequests")}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {(contactStore.sent ?? []).map((r) => {
                        const isTeacherInitiated = r.initiatedBy === "teacher";

                        return (
                            <div
                                key={r.id}
                                className="group rounded-[1.25rem] border border-slate-100 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] p-5 hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.08)] transition-all duration-300 space-y-3.5"
                            >
                                {/* Header Row */}
                                <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                                    <div>
                                        <p className="font-bold text-slate-800 text-base">
                                            {r.teacher?.user.name}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">
                                            {isTeacherInitiated
                                                ? (locale === "ar" ? "طلب تواصل وارد من المعلم" : "Incoming Contact Request from Teacher")
                                                : (locale === "ar" ? "طلب تواصل مباشر منك" : "Direct Contact Request from You")}
                                        </p>
                                    </div>
                                    <span
                                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold flex items-center gap-1 ${
                                            r.status === "accepted"
                                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                : r.status === "rejected"
                                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                                : "bg-amber-50 text-amber-700 border border-amber-200"
                                        }`}
                                    >
                                        {r.status === "pending" && <Clock className="h-3 w-3 animate-spin duration-1000 shrink-0" />}
                                        {r.status === "accepted"
                                            ? (locale === "ar" ? "تم القبول" : "Accepted")
                                            : r.status === "rejected"
                                            ? (locale === "ar" ? "تم الرفض" : "Rejected")
                                            : (locale === "ar" ? "قيد الانتظار" : "Pending")}
                                    </span>
                                </div>

                                {/* Teacher's Message Quote (For incoming teacher requests) */}
                                {isTeacherInitiated && r.message && (
                                    <div className="rounded-2xl bg-slate-50/70 border border-slate-100/80 p-3.5 text-sm text-slate-600 leading-relaxed italic relative">
                                        <span className="absolute start-2 top-0 text-slate-300 text-3xl font-serif select-none">&quot;</span>
                                        <span className="font-bold block text-[10px] text-slate-400 not-italic uppercase tracking-wider mb-1">
                                            {locale === "ar" ? "💬 رسالة المعلم المعروضة:" : "💬 Teacher's Proposal Message:"}
                                        </span>
                                        <p className="ps-4 pe-2 relative z-10">{r.message}</p>
                                    </div>
                                )}

                                {/* Parent's Message Quote (For outgoing parent requests, only shown when pending/rejected) */}
                                {!isTeacherInitiated && r.status !== "accepted" && r.message && (
                                    <div className="rounded-2xl bg-slate-50/70 border border-slate-100/80 p-3.5 text-sm text-slate-600 leading-relaxed italic relative">
                                        <span className="absolute start-2 top-0 text-slate-300 text-3xl font-serif select-none">&quot;</span>
                                        <p className="ps-4 pe-2 relative z-10">{r.message}</p>
                                    </div>
                                )}

                                {/* Teacher's Reply (For outgoing parent requests) */}
                                {!isTeacherInitiated && r.replyMessage && (
                                    <div className="rounded-xl bg-primary/5 border border-primary/10 p-3.5 text-xs text-primary leading-relaxed text-start space-y-1">
                                        <span className="font-bold block">
                                            💬 {locale === "ar" ? "رد المعلم:" : "Teacher's Reply:"}
                                        </span>
                                        <p className="italic font-medium">{r.replyMessage}</p>
                                    </div>
                                )}

                                {/* Parent Action buttons for incoming teacher requests */}
                                {isTeacherInitiated && r.status === "pending" && (
                                    <div className="flex gap-2 pt-1">
                                        <button
                                            onClick={() => handleAcceptRequest(r.id)}
                                            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-md hover:shadow-emerald-600/10 hover:-translate-y-0.5 active:scale-98 transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <Check className="h-4 w-4" />
                                            {tCommon("accept")}
                                        </button>
                                        <button
                                            onClick={() => handleRejectRequest(r.id)}
                                            className="rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 px-4 py-2 text-xs font-bold shadow-sm hover:-translate-y-0.5 active:scale-98 transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <X className="h-4 w-4" />
                                            {tCommon("reject")}
                                        </button>
                                    </div>
                                )}

                                {/* Phone info if accepted */}
                                {r.status === "accepted" && r.teacher?.user?.phone && (
                                    <div className="pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/40 rounded-xl p-3 border border-slate-100">
                                        <div className="text-xs">
                                            <span className="text-muted-foreground block sm:inline">
                                                {locale === "ar" ? "رقم اتصال المعلم:" : "Teacher's Phone Number:"}
                                            </span>
                                            <strong className="text-foreground text-sm font-bold sm:ms-2 select-all tracking-wider">
                                                {r.teacher.user.phone}
                                            </strong>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <a
                                                href={`tel:${r.teacher.user.phone}`}
                                                onClick={() => handleContactClick(r.id, 'phone')}
                                                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary hover:bg-primary-dark text-white px-3 py-1.5 text-xs font-bold shadow-md shadow-primary/10 transition-colors"
                                            >
                                                <Phone className="h-3.5 w-3.5" />
                                                {locale === "ar" ? "اتصال" : "Call"}
                                            </a>
                                            <a
                                                href={`https://wa.me/${r.teacher.user.phone}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={() => handleContactClick(r.id, 'whatsapp')}
                                                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 text-emerald-600 bg-emerald-50/50 hover:bg-emerald-50 px-3 py-1.5 text-xs font-bold transition-colors"
                                            >
                                                WhatsApp
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {/* After accept/reject: show locked messages only (API forbids edits on resolved requests) */}
                                {r.status === "accepted" && (
                                    <div className="space-y-3 pt-3 border-t border-slate-100">
                                        {isTeacherInitiated && r.replyMessage ? (
                                            <div className="text-xs space-y-1">
                                                <span className="text-slate-400 font-bold block">
                                                    {locale === "ar" ? "💬 ردّك على المعلم:" : "💬 Your Reply:"}
                                                </span>
                                                <p className="text-slate-700 bg-slate-50 border border-slate-100 p-3 rounded-xl leading-relaxed italic text-start">
                                                    {r.replyMessage}
                                                </p>
                                            </div>
                                        ) : null}
                                        {!isTeacherInitiated && r.message ? (
                                            <div className="text-xs space-y-1">
                                                <span className="text-slate-400 font-bold block">
                                                    {locale === "ar" ? "💬 رسالتك للمعلم:" : "💬 Your Message:"}
                                                </span>
                                                <p className="text-slate-700 bg-slate-50 border border-slate-100 p-3 rounded-xl leading-relaxed italic text-start">
                                                    {r.message}
                                                </p>
                                            </div>
                                        ) : null}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
