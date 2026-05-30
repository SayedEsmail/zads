"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard, Search, FileText, Heart, Users, User, Settings,
  BookOpen, ListTodo, BarChart2, Menu, X, LogOut, GraduationCap, Globe, MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "client" | "teacher" | "admin";

type Translator = (key: string) => string;

function useNavItems(role: Role, locale: string, t: Translator) {
  if (role === "client") {
    const base = `/${locale}/client/client`;
    return [
      { href: base, label: t("dashboard"), icon: LayoutDashboard },
      { href: `${base}/teacher`, label: t("searchTeachers"), icon: Search },
      { href: `${base}/dependents`, label: t("dependents"), icon: Users },
      { href: `${base}/requests`, label: t("requestsClient"), icon: FileText },
      { href: `${base}/contacts`, label: t("contactRequests"), icon: MessageCircle },
      { href: `${base}/favorites`, label: t("favorites"), icon: Heart },
      { href: `${base}/profile`, label: t("profile"), icon: User },
    ];
  }
  if (role === "teacher") {
    const base = `/${locale}/teacher/teacher`;
    return [
      { href: base, label: t("dashboard"), icon: LayoutDashboard },
      { href: `${base}/browse`, label: t("browseTeacher"), icon: Search },
      { href: `${base}/requests`, label: t("requestsTeacher"), icon: FileText },
      { href: `${base}/subjects`, label: t("subjects"), icon: BookOpen },
      { href: `${base}/profile`, label: t("profile"), icon: User },
    ];
  }
  // admin
  const base = `/${locale}/admin/admin`;
  return [
    { href: base, label: t("admin"), icon: BarChart2 },
    { href: `${base}/teachers`, label: t("teachers"), icon: GraduationCap },
    { href: `${base}/parents`, label: t("clients"), icon: Users },
    { href: `${base}/subjects`, label: t("subjects"), icon: BookOpen },
    { href: `${base}/stages`, label: t("stages"), icon: ListTodo },
    { href: `${base}/tutor-requests`, label: t("tutorRequests"), icon: FileText },
    { href: `${base}/contact-requests`, label: t("contactRequests"), icon: FileText },
  ];
}

interface Props {
  role: Role;
}

export default function DashboardSidebar({ role }: Props) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("nav");
  const tAdmin = useTranslations("admin");
  const tAuth = useTranslations("auth");
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Use nav or admin translations depending on role
  const trans = role === "admin" ? tAdmin : t;
  const navItems = useNavItems(role, locale, trans);

  const otherLocale = locale === "ar" ? "en" : "ar";
  const switchLocale = () => {
    const newPath = pathname.replace(`/${locale}`, `/${otherLocale}`);
    router.push(newPath);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Header close button for Mobile Drawer only */}
      <div className="flex items-center justify-end border-b border-border p-4 md:hidden">
        <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* User info */}
      {session && (
        <div className="border-b border-border px-4 py-3">
          <p className="font-medium text-sm">{session.user.name}</p>
          <p className="text-xs text-muted-foreground">{session.user.phone}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              (href === `/${locale}/${role}/${role}` ? pathname === href : (pathname === href || pathname.startsWith(href + "/")))
                ? "bg-primary/10 text-primary"
                : "text-foreground hover:bg-muted"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Sign out */}
      <div className="border-t border-border p-3">
        <button
          onClick={() => signOut({ callbackUrl: `/${locale}/auth/login` })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          {tAuth("logout")}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Global Top Header (Desktop & Mobile) */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/50 bg-white/80 backdrop-blur-md px-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] shrink-0">
        <Link href={`/${locale}/${role}/${role}`} className="flex items-center">
          <img src="/logo.svg" alt="Zads Logo" className="h-10 md:h-12 w-auto object-contain" />
        </Link>
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <button
            onClick={switchLocale}
            className="flex items-center gap-1.5 rounded-xl border border-border/50 bg-white px-3 py-1.5 text-xs font-semibold shadow-sm hover:bg-muted text-foreground transition-colors"
            title="Switch language / تغيير اللغة"
          >
            <Globe className="h-4 w-4 text-primary" />
            <span>{otherLocale.toUpperCase()}</span>
          </button>
          
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-xl border border-border/50 bg-white p-2 shadow-sm hover:bg-muted text-foreground md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-y-0 end-0 z-50 w-64 bg-white shadow-2xl transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "translate-x-full rtl:-translate-x-full"
        )}
      >
        {sidebarContent}
      </div>

      {/* Desktop sidebar (Fixed below top header) */}
      <aside className="hidden w-64 border-e border-border/50 bg-white shadow-[4px_0_24px_-4px_rgba(0,0,0,0.02)] md:block fixed top-16 start-0 bottom-0 z-20">
        <div className="h-full overflow-y-auto">
          {sidebarContent}
        </div>
      </aside>
    </>
  );
}
