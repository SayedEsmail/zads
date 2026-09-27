"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useContactRequestsStore } from "@/stores/contact-requests";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { Check, X, Phone, Clock, BookOpen, MessageCircle } from "lucide-react";
import { getInitials } from "@/lib/utils";
import api from "@/lib/api";
import { toast } from "sonner";

export default function TeacherRequestsPage() {
  const locale = useLocale();
  const t = useTranslations("teacher");
  const tCommon = useTranslations("common");
  const { incoming, isLoading, error, fetchIncoming, updateStatus } = useContactRequestsStore();

  // Local state to hold inline reply texts per request ID
  const [replyText, setReplyText] = useState<{ [id: string]: string }>({});

  const handleContactClick = (requestId: string, channel: 'whatsapp' | 'phone') => {
    api.post('/analytics/contact-click', { requestId, channel }).catch(() => {
      // Non-blocking, analytics failure never interrupts user
    });
  };

  useEffect(() => {
    fetchIncoming();
  }, [fetchIncoming]);

  const handleSendReply = async (requestId: string, currentStatus: string) => {
    const text = replyText[requestId]?.trim();
    if (!text) return;

    try {
      await updateStatus(requestId, currentStatus as "accepted" | "rejected", text);
      toast.success(locale === "ar" ? "تم إرسال ردك للعميل بنجاح!" : "Reply sent successfully!");
      setReplyText((prev) => {
        const copy = { ...prev };
        delete copy[requestId];
        return copy;
      });
    } catch (err) {
      toast.error(locale === "ar" ? "حدث خطأ أثناء إرسال الرد" : "Error sending reply");
    }
  };

  // Dynamic translated status badge
  const renderStatusBadge = (status: string) => {
    const isAr = locale === "ar";
    if (status === "pending") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-700 shadow-[0_1px_2px_rgba(245,158,11,0.05)]">
          <Clock className="h-3 w-3 animate-spin duration-1000" />
          {isAr ? "قيد الانتظار" : "Pending"}
        </span>
      );
    }
    if (status === "accepted") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700 shadow-[0_1px_2px_rgba(16,185,129,0.05)]">
          <Check className="h-3 w-3" />
          {isAr ? "تم القبول" : "Accepted"}
        </span>
      );
    }
    // rejected
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-xs font-bold text-rose-700 shadow-[0_1px_2px_rgba(244,63,94,0.05)]">
        <X className="h-3 w-3" />
        {isAr ? "تم الرفض" : "Rejected"}
      </span>
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 text-start">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t("incomingContacts")}</h1>
        <p className="text-xs text-muted-foreground mt-1">
          {locale === "ar" 
            ? "عرض وإدارة طلبات التواصل المباشر المرسلة إليك من أولياء الأمور والطلاب."
            : "View and manage direct contact requests sent to you by parents and students."}
        </p>
      </div>

      <ErrorBanner error={error} onRetry={fetchIncoming} />

      {isLoading ? (
        <PageSkeleton rows={4} />
      ) : !incoming || incoming.length === 0 ? (
        <div className="rounded-[1.25rem] border border-dashed border-slate-200 p-8 text-center bg-white shadow-sm flex flex-col items-center justify-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
            <MessageCircle className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">
            {t("noIncomingRequests")}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {incoming.map((request) => (
            <div 
              key={request.id} 
              className="group rounded-[1.25rem] border border-slate-100 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col md:flex-row md:items-start gap-4"
            >
              {/* Parent Initials Avatar */}
              <div className="shrink-0 flex items-center md:items-start">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-base shadow-inner">
                  {getInitials(request.parent?.user.name ?? "?")}
                </div>
              </div>

              {/* Request Info */}
              <div className="flex-1 min-w-0 space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-50 pb-2">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{request.parent?.user.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                      <BookOpen className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>
                        {[request.subject?.nameAr, request.stage?.nameAr].filter(Boolean).join(" · ")}
                      </span>
                      {request.initiatedBy === "teacher" && (
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold shrink-0">
                          {locale === "ar" ? "طلب تواصل مرسل منك" : "Sent Request"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>{renderStatusBadge(request.status)}</div>
                </div>

                {/* Parent Message Quote */}
                {request.message && (
                  <div className="rounded-2xl bg-slate-50/70 border border-slate-100/80 p-3.5 text-sm text-slate-600 leading-relaxed italic relative">
                    <span className="absolute start-2 top-0 text-slate-300 text-3xl font-serif select-none">“</span>
                    <span className="font-bold block text-[10px] text-slate-400 not-italic uppercase tracking-wider mb-1">
                      {request.initiatedBy === "teacher" 
                        ? (locale === "ar" ? "💬 رسالة العرض الخاصة بك:" : "💬 Your Proposal Message:") 
                        : (locale === "ar" ? "💬 رسالة ولي الأمر:" : "💬 Parent's Message:")}
                    </span>
                    <p className="ps-4 pe-2 relative z-10">{request.message}</p>
                  </div>
                )}

                {/* Actions Block */}
                {request.status === "pending" && request.initiatedBy !== "teacher" && (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => updateStatus(request.id, "accepted")}
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-md hover:shadow-emerald-600/10 hover:-translate-y-0.5 active:scale-98 transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="h-4 w-4" />
                      {tCommon("accept")}
                    </button>
                    <button
                      onClick={() => updateStatus(request.id, "rejected")}
                      className="rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 px-4 py-2 text-xs font-bold shadow-sm hover:-translate-y-0.5 active:scale-98 transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                      {tCommon("reject")}
                    </button>
                  </div>
                )}

                {/* If Accepted, show Call & Message details */}
                {request.status === "accepted" && request.parent?.user.phone && (
                  <div className="pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/40 rounded-xl p-3 border border-slate-100">
                    <div className="text-xs">
                      <span className="text-muted-foreground block sm:inline">
                        {locale === "ar" ? "رقم اتصال ولي الأمر:" : "Parent Phone Number:"}
                      </span>
                      <strong className="text-foreground text-sm font-bold sm:ms-2 select-all tracking-wider">
                        {request.parent.user.phone}
                      </strong>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <a
                        href={`tel:${request.parent.user.phone}`}
                        onClick={() => handleContactClick(request.id, 'phone')}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary hover:bg-primary-dark text-white px-3 py-1.5 text-xs font-bold shadow-md shadow-primary/10 transition-colors"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        {locale === "ar" ? "اتصال" : "Call"}
                      </a>
                      <a
                        href={`https://wa.me/${request.parent.user.phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleContactClick(request.id, 'whatsapp')}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 text-emerald-600 bg-emerald-50/50 hover:bg-emerald-50 px-3 py-1.5 text-xs font-bold transition-colors"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>
                )}

                {/* Reply Message Panel */}
                {request.status === "accepted" && (
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    {request.replyMessage ? (
                      <div className="text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-bold block">
                            {locale === "ar" ? "💬 ردّك الحالي على العميل:" : "💬 Your Current Reply:"}
                          </span>
                          <button
                            onClick={() => {
                              setReplyText((prev) => ({ ...prev, [request.id]: request.replyMessage || "" }));
                            }}
                            className="text-primary hover:underline text-[10px] font-bold cursor-pointer bg-transparent border-0"
                          >
                            {locale === "ar" ? "تعديل الرد" : "Edit Reply"}
                          </button>
                        </div>
                        <p className="text-slate-750 bg-slate-50 border border-slate-100 p-3 rounded-xl leading-relaxed italic text-start">
                          {request.replyMessage}
                        </p>
                      </div>
                    ) : null}

                    {(!request.replyMessage || replyText[request.id] !== undefined) && (
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                          {locale === "ar" ? "اكتب رسالة رد للعميل:" : "Write a reply message to parent:"}
                        </label>
                        <div className="flex gap-2">
                          <textarea
                            value={replyText[request.id] ?? ""}
                            onChange={(e) =>
                              setReplyText((prev) => ({ ...prev, [request.id]: e.target.value }))
                            }
                            placeholder={
                              locale === "ar"
                                ? "مثال: أهلاً بك، سأتواصل معك عبر الواتساب لتنسيق المواعيد..."
                                : "Example: Hello, I will reach out via WhatsApp to schedule our first session..."
                            }
                            rows={2}
                            className="flex-1 rounded-xl border border-border px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                          />
                          <button
                            onClick={() => handleSendReply(request.id, request.status)}
                            disabled={!(replyText[request.id] ?? "").trim()}
                            className="self-end rounded-xl bg-primary hover:bg-primary-dark text-white px-4 py-2.5 text-xs font-bold shadow-md transition-colors disabled:opacity-50 cursor-pointer h-[40px] flex items-center justify-center shrink-0"
                          >
                            {locale === "ar" ? "إرسال الرد" : "Send"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
