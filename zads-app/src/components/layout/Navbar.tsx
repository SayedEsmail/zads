"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, Globe } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const t = useTranslations("nav");
  const tAuth = useTranslations("auth");
  const locale = useLocale();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const otherLocale = locale === "ar" ? "en" : "ar";
  const switchLocale = () => {
    const newPath = pathname.replace(`/${locale}`, `/${otherLocale}`);
    router.push(newPath);
  };

  const getDashboardHref = () => {
    if (!session) return `/${locale}/login`;
    const type = session.userType;
    if (type === "parent") return `/${locale}/client`;
    if (type === "TEACHER") return `/${locale}/teacher`;
    if (type === "ADMIN") return `/${locale}/admin`;
    return `/${locale}`;
  };

  const navLinks = [
    { href: `/${locale}`, label: t("home") },
    { href: `/${locale}/about`, label: t("about") },
    { href: `/${locale}/how-it-works`, label: t("howItWorks") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href={`/${locale}`} className="text-xl font-bold text-primary">
          زاد
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-medium text-foreground hover:text-primary">
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Locale switcher */}
          <button
            onClick={switchLocale}
            className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-muted"
            title="Switch language"
          >
            <Globe className="h-3.5 w-3.5" />
            {otherLocale.toUpperCase()}
          </button>

          {session ? (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href={getDashboardHref()}
                className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark"
              >
                {t("dashboard")}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
                className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted"
              >
                {tAuth("logout")}
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href={`/${locale}/login`}
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted"
              >
                {tAuth("login")}
              </Link>
              <Link
                href={`/${locale}/register`}
                className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark"
              >
                {tAuth("register")}
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="rounded-lg border border-border p-1.5 md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-border bg-surface px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm font-medium" onClick={() => setMenuOpen(false)}>
                {l.label}
              </Link>
            ))}
            <hr className="border-border" />
            {session ? (
              <>
                <Link href={getDashboardHref()} className="text-sm font-medium text-primary" onClick={() => setMenuOpen(false)}>
                  {t("dashboard")}
                </Link>
                <button onClick={() => signOut({ callbackUrl: `/${locale}/login` })} className="text-start text-sm text-muted-foreground">
                  {tAuth("logout")}
                </button>
              </>
            ) : (
              <>
                <Link href={`/${locale}/login`} className="text-sm font-medium" onClick={() => setMenuOpen(false)}>
                  {tAuth("login")}
                </Link>
                <Link href={`/${locale}/register`} className="text-sm font-medium text-primary" onClick={() => setMenuOpen(false)}>
                  {tAuth("register")}
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
