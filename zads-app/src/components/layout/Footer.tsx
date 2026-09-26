import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-10 space-y-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex flex-col items-center sm:items-start gap-2">
            <img src="/logo.svg" alt="Zads Logo" className="h-8 w-auto object-contain" />
            <p className="text-xs text-muted-foreground max-w-xs text-center sm:text-start">
              {locale === "ar"
                ? "منصة ربط وتنسيق تعليمي مباشر في السادس من أكتوبر والجيزة."
                : "Direct educational connection platform in 6th of October & Giza."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 text-center sm:text-start">
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-900 block">
                {locale === "ar" ? "المنصة" : "Platform"}
              </span>
              <nav className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                <Link href={`/${locale}/public`} className="hover:text-primary transition-colors">{t("home")}</Link>
                <Link href={`/${locale}/public/teachers`} className="hover:text-primary transition-colors">{locale === "ar" ? "دليل المعلمين" : "Teachers Directory"}</Link>
                <Link href={`/${locale}/public/join-teacher`} className="hover:text-primary transition-colors">{locale === "ar" ? "انضم كمعلم" : "Join as Teacher"}</Link>
                <Link href={`/${locale}/public/how-it-works`} className="hover:text-primary transition-colors">{t("howItWorks")}</Link>
              </nav>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-900 block">
                {locale === "ar" ? "الشركة والقانونية" : "Company & Legal"}
              </span>
              <nav className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                <Link href={`/${locale}/public/about`} className="hover:text-primary transition-colors">{t("about")}</Link>
                <Link href={`/${locale}/public/terms`} className="hover:text-primary transition-colors">{locale === "ar" ? "الشروط والأحكام" : "Terms of Service"}</Link>
                <Link href={`/${locale}/public/privacy`} className="hover:text-primary transition-colors">{locale === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}</Link>
                <Link href={`/${locale}/public/contact`} className="hover:text-primary transition-colors">{locale === "ar" ? "تواصل معنا" : "Contact Us"}</Link>
              </nav>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>
            {tCommon("copyright", { year: new Date().getFullYear() })}
          </p>
          <p className="text-[11px] text-slate-400">
            {locale === "ar" ? "السادس من أكتوبر · الجيزة · جمهورية مصر العربية" : "6th of October · Giza · Egypt"}
          </p>
        </div>
      </div>
    </footer>
  );
}
