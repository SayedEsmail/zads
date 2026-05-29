import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { MapPin, Wifi, Clock, Star } from "lucide-react";

export default function LandingPage() {
  const t = useTranslations("landing");
  const locale = useLocale();

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
            href={`/${locale}/auth/register`}
            className="rounded-xl bg-primary px-8 py-3 text-base font-semibold text-white hover:bg-primary-dark"
          >
            {t("startNow")}
          </Link>
          <Link
            href={`/${locale}/public/how-it-works`}
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
          {t("readyToStart")}
        </h2>
        <Link
          href={`/${locale}/auth/register`}
          className="inline-block rounded-xl bg-secondary px-8 py-3 text-base font-semibold text-white hover:bg-secondary-dark"
        >
          {t("startNow")}
        </Link>
      </section>
    </>
  );
}
