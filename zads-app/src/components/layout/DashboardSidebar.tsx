"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard, Search, FileText, Heart, Users, User, Settings,
  BookOpen, ListTodo, BarChart2, ShieldCheck, Menu, X, LogOut, GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "client" | "teacher" | "admin";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

function useNavItems(role: Role, locale: string, t: ReturnType<typeof useTranslations>) {
  const base = `/${locale}`;
  if (role === "client") {
    return [
      { href: `${base}/client`, label: t("dashboard"), icon: LayoutDashboard },
      { href: `${base}/client/dependents`, label: t("dependents"), icon: Users },
      { href: `${base}/client/requests`, label: t("requests"), icon: FileText },
      { href: `${base}/client/favorites`, label: t("favorites"), icon: Heart },
      { href: `${base}/client/profile`, label: t("profile"), icon: User },
      { href: `${base}/client/settings`, label: t("settings"), icon: Settings },
    ];
  }
  if (role === "teacher") {
    return [
      { href: `${base}/teacher`, label: t("dashboard"), icon: LayoutDashboard },
      { href: `${base}/teacher/browse`, label: t("browse"), icon: Search },
      { href: `${base}/teacher/requests`, label: t("requests"), icon: FileText },
      { href: `${base}/teacher/subjects`, label: t("subjects"), icon: BookOpen },
      { href: `${base}/teacher/profile`, label: t("profile"), icon: User },
      { href: `${base}/teacher/settings`, label: t("settings"), icon: Settings },
    ];
  }
  // admin
  return [
    { href: `${base}/admin`, label: t("admin"), icon: BarChart2 },
    { href: `${base}/admin/teachers`, label: t("teachers"), icon: GraduationCap },
    { href: `${base}/admin/parents`, label: t("clients"), icon: Users },
    { href: `${base}/admin/subjects`, label: t("subjects"), icon: BookOpen },
    { href: `${base}/admin/stages`, label: t("stages"), icon: ListTodo },
    { href: `${base}/admin/tutor-requests`, label: t("tutorRequests"), icon: FileText },
    { href: `${base}/admin/contact-requests`, label: t("contactRequests"), icon: FileText },
  ];
}

interface Props {
  role: Role;
}

export default function DashboardSidebar({ role }: Props) {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("nav");
  const tAdmin = useTranslations("admin");
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Use nav or admin translations depending on role
  const trans = role === "admin" ? tAdmin : t;
  const navItems = useNavItems(role, locale, trans as any);

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <Link href={`/${locale}`} className="text-lg font-bold text-primary">
          زاد
        </Link>
        <button className="md:hidden" onClick={() => setMobileOpen(false)}>
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
              pathname === href || pathname.startsWith(href + "/")
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
          onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          {useTranslations("auth")("logout")}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="fixed bottom-4 end-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg md:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-y-0 end-0 z-50 w-64 bg-surface shadow-xl transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "translate-x-full rtl:-translate-x-full"
        )}
      >
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-e border-border bg-surface md:block">
        <div className="sticky top-0 h-screen overflow-hidden">
          <SidebarContent />
        </div>
      </aside>
    </>
  );
}
