"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/stores/auth";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { sanitizeInternalCallbackUrl } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(8, "Invalid phone number"),
  password: z.string().min(8, "Minimum 8 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterTeacherPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = sanitizeInternalCallbackUrl(searchParams.get("callbackUrl"));
  const { registerTeacher, isLoading, error, registrationComplete } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    const signedIn = await registerTeacher({
      name: data.name,
      phone: data.phone,
      password: data.password,
    });
    if (!signedIn) return;
    router.replace(`/${locale}/teacher`);
    router.refresh();
  };

  return (
    <div className="w-full bg-surface p-4 sm:p-8">
      <div className="mb-6 flex flex-col items-center justify-center">
        <img src="/logo.svg" alt="Zads Logo" className="h-16 w-auto object-contain" />
      </div>

      <h2 className="mb-6 text-xl font-semibold">{t("registerTeacher")}</h2>

      <ErrorBanner error={error} className="mb-4" />

      {registrationComplete && (
        <p className="mb-4 rounded-xl bg-blue-50 p-3 text-sm text-blue-800">
          {locale === "ar"
            ? "تم إنشاء الحساب. يرجى تسجيل الدخول للمتابعة."
            : "Your account has been created. Please sign in to continue."}{" "}
          <Link
            href={callbackUrl ? `/${locale}/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : `/${locale}/auth/login`}
            className="font-bold underline"
          >
            {t("signInNow")}
          </Link>
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t("fullName")}</label>
          <input
            {...register("name")}
            type="text"
            className="w-full rounded-[1.25rem] border border-border bg-white px-4 py-3.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          {errors.name && <p className="mt-1.5 px-1 text-xs font-medium text-destructive">{errors.name.message}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t("phone")}</label>
          <input
            {...register("phone")}
            type="tel"
            dir="ltr"
            placeholder="05xxxxxxxx"
            className="w-full rounded-[1.25rem] border border-border bg-white px-4 py-3.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          {errors.phone && <p className="mt-1.5 px-1 text-xs font-medium text-destructive">{errors.phone.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t("password")}</label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full rounded-[1.25rem] border border-border bg-white px-4 py-3.5 pe-12 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 end-0 flex items-center pe-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && <p className="mt-1.5 px-1 text-xs font-medium text-destructive">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading || registrationComplete}
          className="mt-4 w-full rounded-[1.25rem] bg-primary py-4 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark hover:shadow-primary/30 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {isLoading ? "..." : t("registerTeacher")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("haveAccount")}{" "}
        <Link
          href={callbackUrl ? `/${locale}/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : `/${locale}/auth/login`}
          className="font-medium text-primary hover:underline"
        >
          {t("signInNow")}
        </Link>
      </p>
    </div>
  );
}
