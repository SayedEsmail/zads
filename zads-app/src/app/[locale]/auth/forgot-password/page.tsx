"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/api";
import { extractError } from "@/lib/utils";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setApiError(null);
    try {
      await api.post("/auth/forgot-password", data);
      setSuccess(true);
    } catch (err) {
      setApiError(extractError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-surface p-4 sm:p-8">
      <div className="mb-6 flex flex-col items-center justify-center">
        <img src="/logo.svg" alt="Zads Logo" className="h-16 w-auto object-contain" />
      </div>

      <h2 className="mb-2 text-xl font-semibold">{t("forgotPassword")}</h2>

      {success ? (
        <div className="mt-4 rounded-lg bg-success/10 p-4 text-sm text-success">
          {t("resetLinkSent")}
        </div>
      ) : (
        <>
          {apiError && (
            <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {apiError}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t("email")}</label>
              <input
                {...register("email")}
                type="email"
                dir="ltr"
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
            >
              {isLoading ? "..." : t("sendResetLink")}
            </button>
          </form>
        </>
      )}

      <p className="mt-6 text-center text-sm">
        <Link href={`/${locale}/auth/login`} className="font-medium text-primary hover:underline">
          <span className="inline-block rtl:rotate-180">←</span> {t("backToSignIn")}
        </Link>
      </p>
    </div>
  );
}
