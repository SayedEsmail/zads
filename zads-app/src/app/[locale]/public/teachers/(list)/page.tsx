import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { MapPin, ArrowRight, ArrowLeft } from "lucide-react";
import { getGovernorates, getStages, getSubjects, type TeacherSearchParams } from "@/lib/server-api";
import { TeacherFilters } from "./TeacherFilters";
import { TeacherResults, TeacherResultsSkeleton } from "./TeacherResults";
import { SearchQueryProvider } from "./SearchQueryContext";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  const path = `/${locale}/public/teachers`;

  return {
    title: isAr
      ? "دليل المعلّمين — السادس من أكتوبر والجيزة | زاد"
      : "Teachers Directory — 6th of October & Giza | Zads",
    description: isAr
      ? "تصفّح معلّمين حسب المادة والمرحلة والمنطقة في 6 أكتوبر والشيخ زايد والجيزة، وتواصل مباشرة."
      : "Browse teachers by subject, stage, and area in 6th of October, Sheikh Zayed, and Giza — then connect directly.",
    alternates: {
      canonical: path,
      languages: {
        ar: "/ar/public/teachers",
        en: "/en/public/teachers",
      },
    },
  };
}

/** Applied filters live in the URL; anything malformed is dropped rather than sent upstream. */
function parseFilters(sp: Record<string, string | string[] | undefined>): TeacherSearchParams {
  const str = (key: string) => {
    const v = sp[key];
    const s = (Array.isArray(v) ? v[0] : v)?.trim();
    return s && s.length <= 64 ? s : undefined;
  };
  const int = (key: string, min: number) => {
    const s = str(key);
    if (s === undefined) return undefined;
    const n = Number(s);
    return Number.isSafeInteger(n) && n >= min ? n : undefined;
  };

  const studyMode = str("studyMode");
  let minPrice = int("minPrice", 0);
  let maxPrice = int("maxPrice", 0);
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    minPrice = maxPrice = undefined;
  }

  return {
    page: int("page", 1) ?? 1,
    subjectId: str("subjectId"),
    stageId: str("stageId"),
    governorateId: str("governorateId"),
    studyMode: studyMode === "online" || studyMode === "offline" ? studyMode : undefined,
    minPrice,
    maxPrice,
  };
}

export default async function PublicTeachersPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const filters = parseFilters(await searchParams);
  const isAr = locale === "ar";
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  // Lookups are cached for an hour and fast; the teacher search is the slow
  // part and streams in behind its own Suspense boundary below.
  const [subjects, stages, governorates] = await Promise.all([
    getSubjects(),
    getStages(),
    getGovernorates(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-primary to-primary-dark p-6 sm:p-8 text-white shadow-md">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              <MapPin className="h-3.5 w-3.5" />
              {isAr ? "معلمو السادس من أكتوبر والجيزة والقاهرة" : "6th of October, Giza & Cairo Teachers"}
            </span>
            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isAr ? "اكتشف المعلّمين" : "Discover Teachers"}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-white/90">
              {isAr
                ? "اعثر على معلّم يناسب احتياجاتك، وتواصل معه لتنسيق التعلّم حضوريًا أو أونلاين."
                : "Find a teacher for your learning needs and connect to arrange in-person or online learning."}
            </p>
          </div>
        </div>

        <SearchQueryProvider>
          <TeacherFilters
            subjects={subjects}
            stages={stages}
            governorates={governorates}
            applied={filters}
          />

          {/* Keyed so every new search shows the skeleton instead of stale results. */}
          <Suspense key={JSON.stringify(filters)} fallback={<TeacherResultsSkeleton locale={locale} />}>
            <TeacherResults locale={locale} filters={filters} />
          </Suspense>
        </SearchQueryProvider>

        {/* Join as Teacher Promotion Box */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-start">
            <h3 className="text-base font-bold text-slate-900">
              {isAr ? "هل أنت معلّم وتريد الوصول إلى متعلّمين؟" : "Are you a teacher looking to connect with learners?"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isAr
                ? "انضم إلى زاد واستقبل طلبات تواصل من المتعلّمين وأولياء الأمور."
                : "Join Zads and receive contact requests from learners and guardians."}
            </p>
          </div>
          <Link
            href={`/${locale}/public/join-teacher`}
            className="shrink-0 flex items-center gap-2 rounded-xl bg-slate-900 text-white px-5 py-2.5 text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            <span>{isAr ? "انضم كمعلم الآن" : "Join as a Teacher"}</span>
            <Arrow className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
