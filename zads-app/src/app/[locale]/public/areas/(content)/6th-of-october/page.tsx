import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Users, Search, MessageCircle } from "lucide-react";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  const path = `/${locale}/public/areas/6th-of-october`;

  return {
    title: isAr
      ? "منصة ربط معلّمين وطلاب في 6 أكتوبر | زاد"
      : "Find Teachers & Learners in 6th of October | Zads",
    description: isAr
      ? "اكتشف معلّمين ومتعلّمين في مدينة السادس من أكتوبر وتواصل معهم مباشرة عبر منصة زاد — ربط واكتشاف بدون وسيط."
      : "Discover teachers and learners in 6th of October City and connect directly on Zads — discover and coordinate learning.",
    alternates: {
      canonical: path,
      languages: {
        ar: "/ar/public/areas/6th-of-october",
        en: "/en/public/areas/6th-of-october",
      },
    },
  };
}

export default async function OctoberAreaPage({ params }: Props) {
  const { locale } = await params;
  const isAr = locale === "ar";

  const zones = isAr
    ? ["الحي المتميز", "غرب سوميد", "الأحياء 1–12", "حدائق أكتوبر", "جنوب الأحياء"]
    : ["Al Motamayez", "West Somid", "Districts 1–12", "October Gardens", "South & expansions"];

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4">
      <article className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-3 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
            <MapPin className="h-3.5 w-3.5" />
            {isAr ? "السادس من أكتوبر · الجيزة" : "6th of October · Giza"}
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl leading-tight">
            {isAr
              ? "منصة ربط معلّمين وطلاب في 6 أكتوبر"
              : "A platform connecting teachers and learners in 6th of October"}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {isAr
              ? "زاد تساعد على اكتشاف المعلّمين والمتعلّمين في مدينة السادس من أكتوبر والتواصل لتنسيق فرص التعلّم — بدون سنتر وبدون حجز من خلال المنصة."
              : "Zads helps you discover teachers and learners in 6th of October City and connect to coordinate learning — discovery and contact, not a booking marketplace."}
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-2xs">
          <h2 className="text-lg font-bold text-slate-900">
            {isAr ? "إزاي بتشتغل؟" : "How it works"}
          </h2>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <Search className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>
                {isAr
                  ? "تصفّح دليل المعلّمين حسب المادة والمرحلة والمنطقة."
                  : "Browse the teacher directory by subject, stage, and area."}
              </span>
            </li>
            <li className="flex gap-3">
              <Users className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>
                {isAr
                  ? "اطّلع على الملف والتخصصات وطرق التعلّم المتاحة."
                  : "Review profiles, subjects, and available learning formats."}
              </span>
            </li>
            <li className="flex gap-3">
              <MessageCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>
                {isAr
                  ? "تواصل مباشرة لمناقشة التفاصيل وتنسيق الفرصة."
                  : "Connect directly to discuss details and coordinate."}
              </span>
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            {isAr ? "مناطق شائعة في أكتوبر" : "Popular areas in October"}
          </h2>
          <div className="flex flex-wrap gap-2">
            {zones.map((z) => (
              <span
                key={z}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
              >
                {z}
              </span>
            ))}
          </div>
        </section>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href={`/${locale}/public/teachers`}
            className="rounded-xl bg-primary px-8 py-3 text-center text-sm font-bold text-white shadow-md hover:bg-primary-dark transition-colors"
          >
            {isAr ? "تصفّح معلّمي أكتوبر والجيزة" : "Browse teachers in October & Giza"}
          </Link>
          <Link
            href={`/${locale}/public/join-teacher`}
            className="rounded-xl border border-border px-8 py-3 text-center text-sm font-semibold hover:bg-muted transition-colors"
          >
            {isAr ? "انضم كمعلّم في 6 أكتوبر" : "Join as a teacher in October"}
          </Link>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          <Link href={`/${locale}/public/areas/sheikh-zayed`} className="text-primary hover:underline font-medium">
            {isAr ? "تبحث عن معلّم في الشيخ زايد؟" : "Looking for a teacher in Sheikh Zayed?"}
          </Link>
        </p>
      </article>
    </div>
  );
}
