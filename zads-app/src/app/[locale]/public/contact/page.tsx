"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { Mail, Phone, MapPin, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const locale = useLocale();
  const [name, setName] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !emailOrPhone || !message) {
      toast.error(locale === "ar" ? "يرجى ملء جميع الحقول" : "Please fill in all fields");
      return;
    }

    setIsSubmitted(true);
    toast.success(
      locale === "ar"
        ? "تم استلام رسالتك بنجاح! سيتواصل معك فريق الدعم قريباً."
        : "Message received! Our support team will get in touch shortly."
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8 text-start">
        <div className="space-y-2 text-center max-w-xl mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
            <MessageSquare className="h-3.5 w-3.5" />
            {locale === "ar" ? "فريق الدعم والمساعدة" : "Help & Support"}
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900">
            {locale === "ar" ? "تواصل مع منصة زاد" : "Contact Zads Team"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {locale === "ar"
              ? "نحن هنا لمساعدتك والإجابة على أي استفسارات تخص المعلمين أو أولياء الأمور أو توثيق الحسابات."
              : "We are here to assist with any inquiries regarding teachers, families, or account verification."}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-5">
          {/* Info cards */}
          <div className="md:col-span-2 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                {locale === "ar" ? "قنوات الدعم التشغيلي" : "Operational Support"}
              </h2>

              <div className="space-y-4 text-xs text-slate-600">
                <div className="rounded-xl bg-amber-50/70 border border-amber-200/60 p-3 text-amber-900 leading-relaxed text-[11px]">
                  {locale === "ar"
                    ? "خلال مرحلة الإطلاق التجريبي (Pilot)، يتم استقبال استفسارات الدعم عبر النموذج المرفق وتتم متابعتها مباشرة من إدارة المنصة. ستعلن قنوات الاتصال المباشر فور اعتمادها رسمياً."
                    : "During the initial pilot release, support inquiries submitted through the contact form are reviewed directly by platform administration. Dedicated public lines will be published upon commercial launch."}
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900 text-xs">{locale === "ar" ? "النطاق الجغرافي للتشغيل" : "Operational Coverage"}</strong>
                    <span>{locale === "ar" ? "مدينة السادس من أكتوبر ومحافظة الجيزة، مصر" : "6th of October City & Giza Governorate, Egypt"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5 space-y-2 text-xs text-blue-900">
              <p className="font-bold">
                {locale === "ar" ? "نسيان كلمة المرور أو استرجاع الحساب؟" : "Password Recovery Assistance"}
              </p>
              <p className="text-blue-800/80 leading-relaxed">
                {locale === "ar"
                  ? "لأسباب أمنية ولحماية خصوصية أرقام الهواتف، يتم استرجاع وتعيين كلمات المرور عبر مراجعة موظف الدعم والتحقق من هوية صاحب الرقم."
                  : "For privacy and safety, password resets are handled with verified customer support identification."}
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xs">
              {isSubmitted ? (
                <div className="text-center py-10 space-y-3">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
                  <h3 className="text-lg font-bold text-slate-900">
                    {locale === "ar" ? "تم استلام رسالتك بنجاح!" : "Message Received!"}
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    {locale === "ar"
                      ? "شكراً لتواصلك معنا. سنقوم بالرد عليك عبر رقم الهاتف أو البريد الإلكتروني خلال 24 ساعة."
                      : "Thank you for reaching out. We will get back to you within 24 hours."}
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setName("");
                      setEmailOrPhone("");
                      setMessage("");
                    }}
                    className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    {locale === "ar" ? "إرسال رسالة أخرى" : "Send another message"}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                    {locale === "ar" ? "أرسل لنا استفسارك" : "Send Us a Message"}
                  </h2>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {locale === "ar" ? "الاسم الكريم" : "Your Name"}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={locale === "ar" ? "أحمد محمود" : "John Doe"}
                      className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {locale === "ar" ? "رقم الهاتف أو البريد الإلكتروني" : "Phone or Email"}
                    </label>
                    <input
                      type="text"
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      placeholder="010xxxxxxxx / user@example.com"
                      className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {locale === "ar" ? "تفاصيل الرسالة أو الاستفسار" : "Message Details"}
                    </label>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={locale === "ar" ? "اكتب استفسارك هنا..." : "Type your message here..."}
                      className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50/50"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-white py-3 text-sm font-bold shadow-md hover:bg-primary-dark transition-colors"
                  >
                    <Send className="h-4 w-4" />
                    <span>{locale === "ar" ? "إرسال الرسالة" : "Send Message"}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
