"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import api from "@/lib/api";
import { extractError } from "@/lib/utils";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { 
  Users, 
  GraduationCap, 
  Clock, 
  BookOpen, 
  ArrowUpRight, 
  ShieldCheck, 
  Calendar,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

type DashboardStats = {
  teachers: { total: number; active: number; newLast7Days: number };
  parents: { total: number; newLast7Days: number };
  contactRequests: { total: number; pending: number };
};

export default function AdminDashboardPage() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get<{ data: DashboardStats }>("/admin/dashboard")
      .then((res) => setStats(res.data.data))
      .catch((e) => setError(extractError(e)))
      .finally(() => setIsLoading(false));
  }, []);

  const statCards = [
    { 
      label: t("totalTeachers"), 
      value: stats?.teachers.total ?? 0, 
      desc: locale === "ar" ? `نشط: ${stats?.teachers.active ?? 0} • جديد: +${stats?.teachers.newLast7Days ?? 0}` : `Active: ${stats?.teachers.active ?? 0} • New: +${stats?.teachers.newLast7Days ?? 0}`,
      color: "from-orange-500 to-amber-500", 
      icon: GraduationCap 
    },
    { 
      label: t("totalClients"), 
      value: stats?.parents.total ?? 0, 
      desc: locale === "ar" ? `جديد آخر 7 أيام: +${stats?.parents.newLast7Days ?? 0}` : `New 7 days: +${stats?.parents.newLast7Days ?? 0}`,
      color: "from-blue-500 to-indigo-500", 
      icon: Users 
    },
    { 
      label: t("totalRequests"), 
      value: stats?.contactRequests.total ?? 0, 
      desc: locale === "ar" ? "إجمالي طلبات التواصل المباشر" : "Total direct contact proposals",
      color: "from-emerald-500 to-teal-500", 
      icon: Calendar 
    },
    { 
      label: t("pendingRequests"), 
      value: stats?.contactRequests.pending ?? 0, 
      desc: locale === "ar" ? "طلب تواصل بانتظار الإجراء" : "Awaiting response action",
      color: "from-rose-500 to-pink-500", 
      icon: Clock 
    },
  ];

  const quickLinks = [
    {
      title: locale === "ar" ? "توثيق شهادات المعلمين" : "Teacher Document Verification",
      desc: locale === "ar" ? "مراجعة الشهادات المرفوعة وتفعيل شارة التوثيق" : "Review uploaded certificates & activate verified badge",
      href: `/${locale}/admin/teachers`,
      icon: ShieldCheck,
      color: "border-amber-100 hover:border-amber-300 text-amber-600 bg-amber-50/20"
    },
    {
      title: locale === "ar" ? "إدارة المراحل التعليمية" : "Curriculum Stages CRUD",
      desc: locale === "ar" ? "إضافة وتعديل وتفعيل المراحل الدراسية المختلفة" : "Create, update, and toggle active stages",
      href: `/${locale}/admin/stages`,
      icon: BookOpen,
      color: "border-indigo-100 hover:border-indigo-300 text-indigo-600 bg-indigo-50/20"
    },
    {
      title: locale === "ar" ? "إدارة المواد الدراسية" : "Curriculum Subjects CRUD",
      desc: locale === "ar" ? "إدارة وتصنيف المواد التعليمية النشطة والجديدة" : "Manage and categorize active and new subjects",
      href: `/${locale}/admin/subjects`,
      icon: BookOpen,
      color: "border-emerald-100 hover:border-emerald-300 text-emerald-600 bg-emerald-50/20"
    },
    {
      title: locale === "ar" ? "إدارة وحظر المستخدمين" : "User Status & Ban Control",
      desc: locale === "ar" ? "حظر وفك الحظر عن أولياء الأمور والمدرسين" : "Suspend and activate parent or tutor accounts",
      href: `/${locale}/admin/parents`,
      icon: Users,
      color: "border-rose-100 hover:border-rose-300 text-rose-600 bg-rose-50/20"
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-start">
      {/* Top Banner */}
      <div className="rounded-[1.25rem] bg-slate-900 p-6 text-white shadow-[0_10px_40px_-10px_rgba(15,23,42,0.3)] relative overflow-hidden isolate">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-primary/20 rounded-full blur-2xl"></div>
        <div className="relative z-10 space-y-1">
          <h1 className="text-2xl font-black flex items-center gap-2">
            <span>{t("dashboard")}</span>
            <span className="text-xs bg-primary/20 border border-primary/30 text-primary px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold">
              {locale === "ar" ? "لوحة الإدارة" : "ADMIN SYSTEM"}
            </span>
          </h1>
          <p className="text-slate-400 text-sm">
            {locale === "ar" 
              ? "مرحباً بك في نظام الإدارة المركزي لمنصة Zads التعليمية. تتبع الإحصائيات العامة ووثق حسابات المدرسين فوراً." 
              : "Welcome to Zads Central Administration. Track platform metrics and verify teacher credentials."}
          </p>
        </div>
      </div>

      <ErrorBanner error={error} />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-100 bg-white p-5 animate-pulse space-y-3">
              <div className="h-10 w-10 bg-slate-100 rounded-xl"></div>
              <div className="h-6 w-16 bg-slate-100 rounded"></div>
              <div className="h-4 w-32 bg-slate-100 rounded"></div>
            </div>
          ))
        ) : (
          statCards.map(({ label, value, desc, color, icon: Icon }) => (
            <div 
              key={label} 
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.06)] transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${color} text-white flex items-center justify-center shadow-md`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-black text-slate-800 tracking-tight">{value}</p>
                <p className="text-sm font-bold text-slate-700">{label}</p>
                <p className="text-[11px] text-muted-foreground font-medium">{desc}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Action Navigation */}
      <div className="space-y-4">
        <h2 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-primary" />
          {locale === "ar" ? "إجراءات لوحة التحكم السريعة" : "Administrative Quick Controls"}
        </h2>
        
        <div className="grid gap-4 sm:grid-cols-2">
          {quickLinks.map(({ title, desc, href, icon: Icon, color }) => (
            <Link 
              key={title}
              href={href}
              className={`rounded-2xl border p-5 flex items-start gap-4 transition-all duration-300 group hover:shadow-md hover:scale-[1.01] ${color}`}
            >
              <div className="h-10 w-10 rounded-xl bg-white border border-current/20 flex items-center justify-center shrink-0 shadow-sm">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-1 text-start">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1 group-hover:text-primary transition-colors">
                  <span>{title}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
