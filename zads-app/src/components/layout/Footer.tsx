import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("nav");
  const locale = useLocale();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xl font-bold text-primary">زاد</p>

          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link href={`/${locale}`} className="hover:text-primary">{t("home")}</Link>
            <Link href={`/${locale}/about`} className="hover:text-primary">{t("about")}</Link>
            <Link href={`/${locale}/how-it-works`} className="hover:text-primary">{t("howItWorks")}</Link>
          </nav>

          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} زاد. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
