import { useTranslations } from "next-intl";

export default function AboutPage() {
  const t = useTranslations("about");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-4 text-3xl font-bold text-primary">
        {t("title")}
      </h1>
      <div className="prose max-w-none text-foreground">
        <p className="text-lg leading-relaxed text-muted-foreground">
          {t("intro")}
        </p>
        <h2 className="mt-8 text-xl font-semibold">{t("missionTitle")}</h2>
        <p className="text-muted-foreground">
          {t("missionDesc")}
        </p>
        <h2 className="mt-8 text-xl font-semibold">{t("whyUsTitle")}</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>{t("whyUs.geo")}</li>
          <li>{t("whyUs.flex")}</li>
          <li>{t("whyUs.account")}</li>
          <li>{t("whyUs.ratings")}</li>
        </ul>
      </div>
    </div>
  );
}
