"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { ShieldAlert, MessageSquare, ArrowLeft, ArrowRight, HelpCircle, CheckCircle2, AlertTriangle } from "lucide-react";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;

  const [phone, setPhone] = useState("");
  const [showGuidance, setShowGuidance] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setShowGuidance(true);
  };

  return (
    <div className="w-full bg-surface p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm max-w-lg mx-auto text-start">
      <div className="mb-6 flex flex-col items-center justify-center">
        <img src="/logo.svg" alt="Zads Logo" className="h-14 w-auto object-contain" />
      </div>

      <div className="space-y-1 mb-6 text-center">
        <h1 className="text-xl font-bold text-slate-900">{t("forgotPassword")}</h1>
        <p className="text-xs text-muted-foreground">
          {locale === "ar"
            ? "مسار استعادة الوصول والتحقق من ملكية الحساب"
            : "Account access recovery & ownership verification"}
        </p>
      </div>

      {!showGuidance ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-xl bg-amber-50/80 border border-amber-200 p-3.5 text-xs text-amber-950 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>{locale === "ar" ? "تنبيه تشغيلي حول الاستعادة الآلية" : "Operational Notice on Recovery"}</span>
            </div>
            <p className="leading-relaxed text-[11px] text-amber-800">
              {locale === "ar"
                ? "الاستعادة الآلية عبر رسائل SMS معلقة حالياً بانتظار تفعيل بوابة الرسائل القصيرة. يتم استرجاع الحسابات حالياً عبر مسار الدعم التشغيلي بإثبات الملكية لحماية خصوصية بياناتك."
                : "Automated SMS recovery is currently awaiting SMS provider integration. Accounts are restored via our verified support channel with strict proof-of-ownership."}
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">{t("phone")}</label>
            <input
              type="tel"
              dir="ltr"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01xxxxxxxxx"
              className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50/50"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary-dark shadow-sm transition-colors cursor-pointer"
          >
            {locale === "ar" ? "عرض شروط وإجراءات الاستعادة" : "View Recovery Requirements"}
          </button>
        </form>
      ) : (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs space-y-3">
            <p className="font-bold flex items-center gap-1.5 text-slate-900">
              <ShieldAlert className="h-4 w-4 text-primary" />
              <span>{locale === "ar" ? "متطلبات إثبات ملكية الحساب" : "Proof of Ownership Requirements"}</span>
            </p>
            <p className="leading-relaxed text-slate-600 text-[11px]">
              {locale === "ar"
                ? `لاستعادة الحساب المسجل برقم (${phone})، يلتزم مقدم الطلب بتقديم ما يثبت ملكيته للحساب لمنع انتحال الشخصية:`
                : `To restore the account registered with (${phone}), the requester must provide proof of ownership to prevent impersonation:`}
            </p>
            <ul className="space-y-1.5 text-[11px] text-slate-700 list-disc list-inside">
              <li>
                {locale === "ar"
                  ? "التواصل من نفس رقم الهاتف المسجل أو استقبال مكالمة تأكيد على الرقم."
                  : "Communication from the registered phone or answering a verification call."}
              </li>
              <li>
                {locale === "ar"
                  ? "مطابقة الاسم الكامل المسجل في الحساب مع بطاقة إثبات الهوية."
                  : "Matching the registered account full name against an official identity document."}
              </li>
              <li>
                {locale === "ar"
                  ? "للمعلمين: تقديم تفاصيل شهادة التوثيق المرفوعة مسبقاً أو تخصص التدريس."
                  : "For tutors: providing details of previously uploaded credentials or registered subjects."}
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <Link
              href={`/${locale}/public/contact`}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary text-white py-3 text-sm font-bold hover:bg-primary-dark shadow-sm transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              <span>{locale === "ar" ? "تقديم طلب الاستعادة لإدارة المنصة" : "Submit Recovery Request to Administration"}</span>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setShowGuidance(false)}
            className="w-full text-center text-xs text-muted-foreground hover:underline cursor-pointer"
          >
            {locale === "ar" ? "العودة وتعديل رقم الهاتف" : "Go back and edit phone number"}
          </button>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-slate-100 text-center">
        <Link href={`/${locale}/auth/login`} className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
          <Arrow className="h-3.5 w-3.5" />
          <span>{t("backToSignIn")}</span>
        </Link>
      </div>
    </div>
  );
}
