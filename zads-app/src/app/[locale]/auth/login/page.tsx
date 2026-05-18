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
    await login(data.phone, data.password);
    // Middleware handles redirect after session is set
    router.refresh();
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
      {/* Logo */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary">زاد</h1>
        <p className="mt-1 text-sm text-muted-foreground">Zad</p>
      </div>

      <h2 className="mb-6 text-xl font-semibold">{t("login")}</h2>

      <ErrorBanner error={error} className="mb-4" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t("phone")}</label>
          <input
            {...register("phone")}
            type="tel"
            dir="ltr"
            placeholder="05xxxxxxxx"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium">{t("password")}</label>
            <Link
              href={`/${locale}/auth/forgot-password`}
              className="text-xs text-primary hover:underline"
            >
              {t("forgotPassword")}
            </Link>
          </div>
          <input
            {...register("password")}
            type="password"
            placeholder="••••••••"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "..." : t("login")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("noAccount")}{" "}
        <Link href={`/${locale}/auth/register`} className="font-medium text-primary hover:underline">
          {t("registerNow")}
        </Link>
      </p>
    </div>
  );
}
