import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Search, MessageCircle, GraduationCap } from "lucide-react";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  const path = `/${locale}/public/areas/sheikh-zayed`;

  return {
    title: isAr
      ? "ازاي تلاقي معلّم قريب منك في الشيخ زايد | زاد"
      : "How to Find a Teacher Near You in Sheikh Zayed | Zads",
    description: isAr
      ? "اكتشف معلّمين قريبين في الشيخ زايد وتواصل معهم عبر زاد — منصة ربط واكتشاف للمتعلّمين والأسر في الجيزة."
      : "Discover nearby teachers in Sheikh Zayed and connect on Zads — a discovery platform for learners and families in Giza.",
    alternates: {
      canonical: path,
      languages: {
        ar: "/ar/public/areas/sheikh-zayed",
        en: "/en/public/areas/sheikh-zayed",
      },
    },
  };
}

export default async function SheikhZayedAreaPage({ params }: Props) {
  const { locale } = await params;
  const isAr = locale === "ar";

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4">
      <article className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-3 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
            <MapPin className="h-3.5 w-3.5" />
            {isAr ? "الشيخ زايد · الجيزة" : "Sheikh Zayed · Giza"}
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl leading-tight">
            {isAr
              ? "ازاي تلاقي معلّم قريب منك في الشيخ زايد"
              : "How to find a teacher near you in Sheikh Zayed"}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {isAr
              ? "زاد تساعدك تكتشف معلّمين في الشيخ زايد والمناطق القريبة، وتشوف ملفاتهم وتتواصل معاهم مباشرة لتنسيق فرص التعلّم."
              : "Zads helps you discover teachers in Sheikh Zayed and nearby areas, review profiles, and connect directly to coordinate learning."}
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-2xs">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            {isAr ? "خطوات بسيطة" : "Simple steps"}
          </h2>
          <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside">
            <li>
              {isAr
                ? "افتح دليل المعلّمين وفلتر حسب المادة أو المرحلة أو المنطقة."
                : "Open the teacher directory and filter by subject, stage, or area."}
            </li>
            <li>
              {isAr
                ? "اقرأ الملف: التخصصات، الخبرة، وطرق التعلّم (أونلاين / حضوري)."
                : "Read the profile: subjects, experience, and learning formats (online / in-person)."}
            </li>
            <li>
              {isAr
                ? "ابعت طلب تواصل ونسّق التفاصيل مباشرة مع المعلّم."
                : "Send a contact request and coordinate details directly with the teacher."}
            </li>
          </ol>
        </section>

        <section className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5 text-sm text-slate-700 leading-relaxed">
          <div className="flex gap-3">
            <Search className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p>
              {isAr
                ? "زاد منصة ربط واكتشاف — مش سنتر ومش بنحجز دروس من خلالنا. الهدف إنك تلاقي المعلّم المناسب وتتواصل."
                : "Zads is a discovery and connection platform — not a learning center and not a booking intermediary. The goal is to help you find the right teacher and connect."}
            </p>
          </div>
        </section>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href={`/${locale}/public/teachers`}
            className="rounded-xl bg-primary px-8 py-3 text-center text-sm font-bold text-white shadow-md hover:bg-primary-dark transition-colors inline-flex items-center justify-center gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            {isAr ? "دور على معلّم في زايد والجيزة" : "Find a teacher in Zayed & Giza"}
          </Link>
          <Link
            href={`/${locale}/public/areas/6th-of-october`}
            className="rounded-xl border border-border px-8 py-3 text-center text-sm font-semibold hover:bg-muted transition-colors"
          >
            {isAr ? "صفحة 6 أكتوبر" : "6th of October page"}
          </Link>
        </div>
      </article>
    </div>
  );
}
