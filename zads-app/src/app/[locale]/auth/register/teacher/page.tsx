"use client";

import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/stores/auth";
import { ErrorBanner } from "@/components/shared/ErrorBanner";

const schema = z
  .object({
    name: z.string().min(2),
    phone: z.string().min(8),
    email: z.string().email().optional().or(z.literal("")),
    password: z.string().min(8),
    confirmPassword: z.string(),
    bio: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterTeacherPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const { registerTeacher, isLoading, error } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    await registerTeacher({
      name: data.name,
      phone: data.phone,
      password: data.password,
      email: data.email || undefined,
      bio: data.bio || undefined,
    });
    router.replace(`/${locale}/teacher/teacher`);
    router.refresh();
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-primary">زاد</h1>
      </div>

      <h2 className="mb-6 text-xl font-semibold">{t("registerTeacher")}</h2>

      <ErrorBanner error={error} className="mb-4" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {[
          { name: "name" as const, label: t("fullName"), type: "text" },
          { name: "phone" as const, label: t("phone"), type: "tel", dir: "ltr" as const, placeholder: "05xxxxxxxx" },
          { name: "email" as const, label: t("email"), type: "email", dir: "ltr" as const },
          { name: "password" as const, label: t("password"), type: "password", placeholder: "••••••••" },
          { name: "confirmPassword" as const, label: t("confirmPassword"), type: "password", placeholder: "••••••••" },
        ].map(({ name, label, type, dir, placeholder }) => (
          <div key={name}>
            <label className="mb-1.5 block text-sm font-medium">{label}</label>
            <input
              {...register(name)}
              type={type}
              dir={dir}
              placeholder={placeholder}
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {errors[name] && (
              <p className="mt-1 text-xs text-destructive">{errors[name]?.message}</p>
            )}
          </div>
        ))}

        <div>
          <label className="mb-1.5 block text-sm font-medium">نبذة عني (اختياري)</label>
          <textarea
            {...register("bio")}
            rows={3}
            className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
        >
          {isLoading ? "..." : t("registerTeacher")}
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
