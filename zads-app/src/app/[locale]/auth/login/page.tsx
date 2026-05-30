"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/stores/auth";
import { ErrorBanner } from "@/components/shared/ErrorBanner";

const schema = z.object({
  phone: z.string().min(8, "Invalid phone number"),
  password: z.string().min(6, "Password too short"),
});
type FormValues = z.infer<typeof schema>;

function getRoleHome(locale: string, userType: string | null): string {
  if (userType === "parent") return `/${locale}/client`;
  if (userType === "teacher") return `/${locale}/teacher`;
  if (userType === "admin") return `/${locale}/admin`;
  return `/${locale}/public`;
}

export default function LoginPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    const userType = await login(data.phone, data.password);
    if (userType) {
      router.replace(getRoleHome(locale, userType));
      router.refresh();
    }
  };

  return (
    <div className="w-full p-4 sm:p-8">
      {/* Logo */}
      <div className="mb-10 flex flex-col items-center justify-center">
        <img src="/logo.svg" alt="Zads Logo" className="h-14 w-auto object-contain" />
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-1">
          {t("welcomeBack") || "Welcome Back!"} 👋
        </h2>
        <p className="text-sm text-muted-foreground">{t("login")}</p>
      </div>

      <ErrorBanner error={error} className="mb-6" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t("phone")}</label>
          <input
            {...register("phone")}
            type="tel"
            dir="ltr"
            placeholder="05xxxxxxxx"
            className="w-full rounded-[1.25rem] border border-border bg-white px-4 py-3.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          {errors.phone && (
            <p className="mt-1.5 px-1 text-xs font-medium text-destructive">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium">{t("password")}</label>
            <Link
              href={`/${locale}/auth/forgot-password`}
              className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {t("forgotPassword")}
            </Link>
          </div>
          <input
            {...register("password")}
            type="password"
            placeholder="••••••••"
            className="w-full rounded-[1.25rem] border border-border bg-white px-4 py-3.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          {errors.password && (
            <p className="mt-1.5 px-1 text-xs font-medium text-destructive">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 w-full rounded-[1.25rem] bg-primary py-4 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark hover:shadow-primary/30 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {isLoading ? "..." : t("login")}
        </button>
      </form>

      <div className="mt-10 text-center text-sm font-medium text-muted-foreground">
        {t("noAccount")}{" "}
        <Link href={`/${locale}/auth/register`} className="text-primary hover:text-primary-dark hover:underline">
          {t("registerNow")}
        </Link>
      </div>
    </div>
  );
}
