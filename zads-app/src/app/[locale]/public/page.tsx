import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { MapPin, Wifi, Clock, Star, CheckCircle, GraduationCap, ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  const t = useTranslations("landing");
  const locale = useLocale();
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;

  const features = [
    {
      icon: MapPin,
      title: t("features.local.title"),
      desc: t("features.local.desc"),
    },
    {
      icon: Wifi,
      title: t("features.onlineOffline.title"),
      desc: t("features.onlineOffline.desc"),
    },
    {
      icon: Star,
      title: t("features.verified.title"),
      desc: t("features.verified.desc"),
    },
    {
      icon: Clock,
      title: t("features.family.title"),
      desc: t("features.family.desc"),
    },
  ];

  const steps = [
    { n: "1", title: t("steps.find.title"), desc: t("steps.find.desc") },
    { n: "2", title: t("steps.connect.title"), desc: t("steps.connect.desc") },
    { n: "3", title: t("steps.start.title"), desc: t("steps.start.desc") },
  ];

  const octoberZones = [
    { nameAr: "الحي المتميز", nameEn: "Al Motamayez" },
    { nameAr: "غرب سوميد", nameEn: "West Somid" },
    { nameAr: "الأحياء السكنية (1 - 12)", nameEn: "Districts 1 to 12" },
    { nameAr: "الشيخ زايد", nameEn: "Sheikh Zayed" },
    { nameAr: "حدائق أكتوبر", nameEn: "October Gardens" },
    { nameAr: "جنوب الأحياء والتوسعات", nameEn: "South & Expansions" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background px-4 py-16 text-center">
        <div className="mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary mb-4">
            <CheckCircle className="h-3.5 w-3.5" />
            {locale === "ar" ? "منصة التعليم المباشر الأولى في السادس من أكتوبر" : "Direct Tutoring in 6th of October & Giza"}
          </span>
          <h1 className="mb-4 text-3xl font-extrabold leading-tight text-primary sm:text-4xl lg:text-5xl">
            {t("heroTitle")}
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-base text-muted-foreground sm:text-lg">
            {t("heroSubtitle")}
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href={`/${locale}/public/teachers`}
              className="rounded-xl bg-primary px-8 py-3 text-base font-semibold text-white shadow-md hover:bg-primary-dark transition-colors"
            >
              {t("exploreTeachers")}
            </Link>
            <Link
              href={`/${locale}/public/join-teacher`}
              className="rounded-xl border border-border px-8 py-3 text-base font-medium hover:bg-muted transition-colors"
            >
              {locale === "ar" ? "انضم كمعلم" : "Join as a Teacher"}
            </Link>
          </div>
        </div>
      </section>

      {/* 6th of October Regional Focus Banner */}
      <section className="px-4 py-8 bg-slate-50 border-y border-slate-100">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span>{locale === "ar" ? "تغطية شاملة لمدينة السادس من أكتوبر ومحيطها" : "Covering 6th of October & Surroundings"}</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {locale === "ar"
                  ? "معلمون معتمدون لجميع المناهج: عام، لغات، تجريبي، أزهري، ودولي."
                  : "Verified tutors for National, Language, Al-Azhar, and International curricula."}
              </p>
            </div>
            <Link
              href={`/${locale}/public/teachers`}
              className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
            >
              <span>{locale === "ar" ? "تصفح معلمي منطقتك" : "Browse local tutors"}</span>
              <Arrow className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {octoberZones.map((z) => (
              <Link
                key={z.nameEn}
                href={`/${locale}/public/teachers`}
                className="rounded-xl border border-slate-200/80 bg-white p-3 text-center text-xs font-semibold text-slate-700 hover:border-primary hover:text-primary transition-all shadow-2xs"
              >
                {locale === "ar" ? z.nameAr : z.nameEn}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-center text-2xl font-bold">{t("featuresTitle")}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-border p-5 bg-white shadow-2xs">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-1 font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/30 px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-2xl font-bold">{t("howItWorksTitle")}</h2>
          <div className="space-y-4">
            {steps.map(({ n, title, desc }) => (
              <div key={n} className="flex items-start gap-4 rounded-xl border border-border bg-white p-4 shadow-2xs">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {n}
                </div>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Direct Contact Callout */}
      <section className="px-4 py-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-blue-100 bg-blue-50/50 p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-start">
          <ShieldCheck className="h-10 w-10 text-primary shrink-0" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-slate-900">
              {locale === "ar" ? "نموذج تنسيق مباشر وشفاف" : "Direct & Transparent Coordination"}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {locale === "ar"
                ? "منصة زاد تربط أولياء الأمور والطلاب بالمعلمين مباشرة لتسهيل التواصل والاتفاق المباشر وفق احتياجات المتعلم."
                : "Zads directly connects parents and students with educators for straightforward coordination according to student needs."}
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-12 text-center bg-slate-50 border-t border-slate-100">
        <h2 className="mb-4 text-2xl font-bold">
          {t("readyToStart")}
        </h2>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link
            href={`/${locale}/public/teachers`}
            className="rounded-xl bg-primary px-8 py-3 text-base font-semibold text-white hover:bg-primary-dark shadow-sm"
          >
            {t("exploreTeachers")}
          </Link>
          <Link
            href={`/${locale}/auth/register`}
            className="rounded-xl border border-border px-8 py-3 text-base font-semibold hover:bg-muted"
          >
            {locale === "ar" ? "تسجيل حساب جديد" : "Create an Account"}
          </Link>
        </div>
      </section>
    </>
  );
}
