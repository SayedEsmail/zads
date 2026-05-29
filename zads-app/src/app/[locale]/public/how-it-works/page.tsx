import { useTranslations } from "next-intl";

export default function HowItWorksPage() {
  const t = useTranslations("howItWorks");

  const steps = [
    { n: "1", title: t("steps.account.title"), desc: t("steps.account.desc") },
    { n: "2", title: t("steps.find.title"), desc: t("steps.find.desc") },
    { n: "3", title: t("steps.connect.title"), desc: t("steps.connect.desc") },
    { n: "4", title: t("steps.start.title"), desc: t("steps.start.desc") },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-4 text-3xl font-bold text-primary">
        {t("title")}
      </h1>
      <p className="mb-10 text-muted-foreground">
        {t("subtitle")}
      </p>

      <div className="space-y-5">
        {steps.map(({ n, title, desc }) => (
          <div key={n} className="flex items-start gap-5 rounded-2xl border border-border bg-surface p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-white">
              {n}
            </div>
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
