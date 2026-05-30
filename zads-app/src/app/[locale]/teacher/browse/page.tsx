"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import api from "@/lib/api";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { TutorRequestCard } from "@/components/shared/TutorRequestCard";
import type { TutorRequest } from "@/types";
import { toast } from "sonner";

export default function TeacherBrowsePage() {
  const t = useTranslations("teacher");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [requests, setRequests] = useState<TutorRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quick message contact modal state
  const [selectedRequest, setSelectedRequest] = useState<TutorRequest | null>(null);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const fetchRequests = () => {
    setIsLoading(true);
    api
      .get<{ data: TutorRequest[] }>("/tutor-requests")
      .then((res) => setRequests(res.data.data))
      .catch((err) => setError(err.response?.data?.message ?? err.message))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    let cancelled = false;
    api
      .get<{ data: TutorRequest[] }>("/tutor-requests")
      .then((res) => {
        if (!cancelled) setRequests(res.data.data);
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
  }, []);

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
    <div className="max-w-3xl mx-auto space-y-4 text-start">
      <div>
        <h1 className="text-xl font-bold">{t("nearbyRequests")}</h1>
        <p className="text-xs text-muted-foreground mt-1">
          {locale === "ar"
            ? "تصفح طلبات الطلاب القريبة منك وقدم عروض تواصل مباشرة."
            : "Browse student requests near you and submit direct contact requests."}
        </p>
      </div>

      <ErrorBanner error={error} onRetry={fetchRequests} />

      {isLoading ? (
        <PageSkeleton rows={4} />
      ) : requests.length === 0 ? (
        <p className="rounded-xl border border-border p-6 text-center text-sm text-muted-foreground">
          {t("noRequestsAvailable")}
        </p>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <TutorRequestCard
              key={request.id}
              request={request}
              showActions={false}
              onContact={(req) => setSelectedRequest(req)}
            />
          ))}
        </div>
      )}

      {/* Custom Contact Modal */}
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
