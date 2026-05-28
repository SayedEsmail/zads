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
import type { ClientAccountKind } from "@/types";

const schema = z
  .object({
    name: z.string().min(2, "Name is required"),
    phone: z.string().min(8, "Invalid phone number"),
    password: z.string().min(8, "Minimum 8 characters"),
    confirmPassword: z.string(),
    clientAccountKind: z.enum(["student", "guardian"] as const),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterClientPage() {
  const t = useTranslations("auth");
  const tErr = useTranslations("errors");
  const locale = useLocale();
  const router = useRouter();
  const { registerClient, isLoading, error } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { clientAccountKind: "student" },
  });

  const accountKind = watch("clientAccountKind");

  const onSubmit = async (data: FormValues) => {
    await registerClient({
      name: data.name,
      phone: data.phone,
      password: data.password,
      clientAccountKind: data.clientAccountKind,
    });
    router.replace(`/${locale}/client/client`);
    router.refresh();
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-primary">زاد</h1>
      </div>

      <h2 className="mb-6 text-xl font-semibold">{t("registerClient")}</h2>

      <ErrorBanner error={error} className="mb-4" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t("fullName")}</label>
          <input
            {...register("name")}
            type="text"
            className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t("phone")}</label>
          <input
            {...register("phone")}
            type="tel"
            dir="ltr"
            placeholder="05xxxxxxxx"
            className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t("password")}</label>
          <input
            {...register("password")}
            type="password"
            placeholder="••••••••"
            className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t("confirmPassword")}</label>
          <input
            {...register("confirmPassword")}
            type="password"
            placeholder="••••••••"
            className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Account Kind segmented control */}
        <div>
          <label className="mb-2 block text-sm font-medium">{t("accountKind")}</label>
          <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-border">
            {(["student", "guardian"] as ClientAccountKind[]).map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => setValue("clientAccountKind", kind)}
                className={`py-2.5 text-sm font-medium transition-colors ${
                  accountKind === kind
                    ? "bg-primary text-white"
                    : "bg-surface text-foreground hover:bg-muted"
                }`}
              >
                {t(kind)}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
        >
          {isLoading ? "..." : t("registerClient")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("haveAccount")}{" "}
        <Link href={`/${locale}/auth/login`} className="font-medium text-primary hover:underline">
          {t("signInNow")}
        </Link>
      </p>
    </div>
  );
}
