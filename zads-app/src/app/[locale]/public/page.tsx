import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { MapPin, Wifi, Clock, Star } from "lucide-react";

export default function LandingPage() {
  const t = useTranslations("landing");
  const tAuth = useTranslations("auth");
  const locale = useLocale();

  const features = [
    {
      icon: MapPin,
      title: locale === "ar" ? "في منطقتك" : "Local Teachers",
      desc: locale === "ar" ? "اعثر على مدرسين قريبين منك بسهولة" : "Find tutors near you, in your neighborhood",
    },
    {
      icon: Wifi,
      title: locale === "ar" ? "أونلاين وأوفلاين" : "Online & Offline",
      desc: locale === "ar" ? "احجز دروساً أونلاين أو وجهاً لوجه" : "Book lessons online or face-to-face",
    },
    {
      icon: Star,
      title: locale === "ar" ? "مدرسون موثوقون" : "Verified Tutors",
      desc: locale === "ar" ? "مدرسون بتقييمات حقيقية وخبرة موثّقة" : "Tutors with real ratings and verified experience",
    },
    {
      icon: Clock,
      title: locale === "ar" ? "لنفسك أو لتابعيك" : "For You & Your Family",
      desc: locale === "ar" ? "احجز دروساً لنفسك أو لأبنائك في نفس الحساب" : "Book for yourself or your dependents under one account",
    },
  ];

  const steps = [
    { n: "1", title: locale === "ar" ? "ابحث عن معلم" : "Find a Teacher", desc: locale === "ar" ? "استخدم الفلاتر لتحديد المادة والمنطقة وطريقة التعلم" : "Use filters to find the right tutor by subject, area, and mode" },
    { n: "2", title: locale === "ar" ? "تواصل وانسّق" : "Connect & Coordinate", desc: locale === "ar" ? "تواصل مع المعلم مباشرةً وحدد الموعد المناسب" : "Contact the tutor directly and set up your first session" },
    { n: "3", title: locale === "ar" ? "ابدأ التعلم" : "Start Learning", desc: locale === "ar" ? "ابدأ رحلتك التعليمية أونلاين أو أوجهاً لوجه" : "Begin your learning journey online or in-person" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background px-4 py-16 text-center">
        <h1 className="mb-4 text-3xl font-bold leading-tight text-primary sm:text-4xl lg:text-5xl">
          {t("heroTitle")}
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-base text-muted-foreground sm:text-lg">
          {t("heroSubtitle")}
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href={`/${locale}/register`}
            className="rounded-xl bg-primary px-8 py-3 text-base font-semibold text-white hover:bg-primary-dark"
          >
            {t("startNow")}
          </Link>
          <Link
            href={`/${locale}/how-it-works`}
            className="rounded-xl border border-border px-8 py-3 text-base font-medium hover:bg-muted"
          >
            {t("exploreTeachers")}
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-center text-2xl font-bold">{t("featuresTitle")}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-border p-5">
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
              <div key={n} className="flex items-start gap-4 rounded-xl border border-border bg-surface p-4">
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

      {/* Final CTA */}
      <section className="px-4 py-12 text-center">
        <h2 className="mb-4 text-2xl font-bold">
          {locale === "ar" ? "جاهز للبدء؟" : "Ready to start?"}
        </h2>
        <Link
          href={`/${locale}/register`}
          className="inline-block rounded-xl bg-secondary px-8 py-3 text-base font-semibold text-white hover:bg-secondary-dark"
        >
          {t("startNow")}
        </Link>
      </section>
    </>
  );
}
