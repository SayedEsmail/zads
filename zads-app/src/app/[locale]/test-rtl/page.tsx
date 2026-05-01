"use client";

import { useLocale } from "next-intl";
import Link from "next/link";

/**
 * P0-13: RTL validation page — validate dir, fonts, and shadcn components in both locales.
 * Delete this page before going to production.
 */
export default function TestRtlPage() {
  const locale = useLocale();
  const isRtl = locale === "ar";

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-8">
      <div className="rounded-xl border border-warning bg-warning/10 p-4 text-sm text-warning">
        ⚠️ Development-only test page. Delete before launch.
      </div>

      <h1 className="text-2xl font-bold">RTL/LTR Validation — {locale.toUpperCase()}</h1>
      <p className="text-muted-foreground">
        dir: <strong>{isRtl ? "rtl ✅" : "ltr (en default)"}</strong>
      </p>

      {/* Arabic text */}
      <section className="space-y-2">
        <h2 className="font-semibold">Arabic Text (IBM Plex Sans Arabic)</h2>
        <p className="text-xl">مرحباً بكم في منصة زاد للتعلم المحلي</p>
        <p className="text-sm text-muted-foreground">الجيرة التعليمية — ابحث عن مدرسك القريب</p>
      </section>

      {/* Inputs */}
      <section className="space-y-3">
        <h2 className="font-semibold">Form Inputs (should align end in RTL)</h2>
        <input type="text" placeholder={isRtl ? "أدخل النص هنا..." : "Enter text here..."} className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        <select className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none">
          <option>{isRtl ? "اختر..." : "Choose..."}</option>
          <option>{isRtl ? "خيار ١" : "Option 1"}</option>
          <option>{isRtl ? "خيار ٢" : "Option 2"}</option>
        </select>
        <textarea rows={2} placeholder={isRtl ? "أدخل الوصف..." : "Enter description..."} className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none" />
      </section>

      {/* Buttons */}
      <section className="space-y-3">
        <h2 className="font-semibold">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <button className="rounded-lg bg-primary px-4 py-2 text-sm text-white">{isRtl ? "زر رئيسي" : "Primary"}</button>
          <button className="rounded-lg border border-border px-4 py-2 text-sm">{isRtl ? "زر ثانوي" : "Secondary"}</button>
          <button className="rounded-lg bg-destructive px-4 py-2 text-sm text-white">{isRtl ? "حذف" : "Delete"}</button>
        </div>
      </section>

      {/* Layout test */}
      <section className="space-y-3">
        <h2 className="font-semibold">Card Layout (inline-start should be on {isRtl ? "RIGHT" : "LEFT"})</h2>
        <div className="flex items-center gap-3 rounded-xl border border-border p-4">
          <div className="h-10 w-10 shrink-0 rounded-full bg-primary/20" />
          <div className="flex-1">
            <p className="font-medium">{isRtl ? "عنصر القائمة" : "List Item"}</p>
            <p className="text-sm text-muted-foreground">{isRtl ? "تفاصيل إضافية" : "Additional detail"}</p>
          </div>
          <span className="text-muted-foreground">›</span>
        </div>
      </section>

      {/* Locale switch */}
      <div className="flex gap-3">
        <Link href="/en/test-rtl" className={`rounded-lg border px-4 py-2 text-sm ${locale === "en" ? "bg-primary text-white" : "border-border hover:bg-muted"}`}>EN (LTR)</Link>
        <Link href="/ar/test-rtl" className={`rounded-lg border px-4 py-2 text-sm ${locale === "ar" ? "bg-primary text-white" : "border-border hover:bg-muted"}`}>AR (RTL)</Link>
      </div>
    </div>
  );
}
