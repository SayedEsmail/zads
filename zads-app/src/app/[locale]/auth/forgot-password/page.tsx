"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { ShieldAlert, Phone, MessageSquare, ArrowLeft, ArrowRight, HelpCircle } from "lucide-react";

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

  const whatsappMessage = encodeURIComponent(
    locale === "ar"
      ? `مرحباً فريق دعم منصة زاد، أحتاج إلى استعادة كلمة المرور لحسابي المسجل برقم: ${phone}`
      : `Hello Zads Support, I need assistance recovering the password for my account registered with phone: ${phone}`
  );

  return (
    <div className="w-full bg-surface p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm max-w-md mx-auto text-start">
      <div className="mb-6 flex flex-col items-center justify-center">
        <img src="/logo.svg" alt="Zads Logo" className="h-14 w-auto object-contain" />
      </div>

      <div className="space-y-1 mb-6 text-center">
        <h1 className="text-xl font-bold text-slate-900">{t("forgotPassword")}</h1>
        <p className="text-xs text-muted-foreground">
          {locale === "ar"
            ? "استعادة حسابك وتعيين كلمة المرور بأمان"
            : "Recover your account and reset your password securely"}
        </p>
      </div>

      {!showGuidance ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-xl bg-blue-50/70 border border-blue-100 p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
            <HelpCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {locale === "ar"
                ? "حسابك في زاد مرتبط برقم هاتفك المصري. أدخل رقم هاتفك لنرشدك لخطوات الاسترجاع المعتمدة."
                : "Your Zads account is linked to your Egyptian phone number. Enter it below for recovery instructions."}
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
            {locale === "ar" ? "متابعة استعادة الحساب" : "Proceed with Recovery"}
          </button>
        </form>
      ) : (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-xs text-emerald-950 space-y-2">
            <p className="font-bold flex items-center gap-1.5 text-emerald-800">
              <ShieldAlert className="h-4 w-4 text-emerald-600" />
              <span>{locale === "ar" ? "إجراء الأمان المعتمد لاستعادة الحساب" : "Account Verification Procedure"}</span>
            </p>
            <p className="leading-relaxed">
              {locale === "ar"
                ? `لحماية خصوصية المعلمين والعائلات، يتم تأكيد ملكية الرقم (${phone}) وإعادة تعيين كلمة المرور مباشرة عبر فريق خدمة العملاء.`
                : `To protect account privacy, ownership of (${phone}) is confirmed directly via our customer support team.`}
            </p>
          </div>

          <div className="space-y-2.5">
            <a
              href={`https://wa.me/201000000000?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-600 text-white py-3 text-sm font-bold hover:bg-emerald-700 shadow-sm transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              <span>{locale === "ar" ? "تواصل عبر واتساب لاسترجاع الحساب" : "Contact via WhatsApp"}</span>
            </a>

            <Link
              href={`/${locale}/public/contact`}
              className="flex items-center justify-center gap-2 w-full rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span>{locale === "ar" ? "قنوات الدعم الأخرى والاتصال" : "Other Support Channels"}</span>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setShowGuidance(false)}
            className="w-full text-center text-xs text-muted-foreground hover:underline"
          >
            {locale === "ar" ? "تغيير رقم الهاتف" : "Change phone number"}
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
