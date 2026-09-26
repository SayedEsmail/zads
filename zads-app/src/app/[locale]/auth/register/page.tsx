"use client";

import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { GraduationCap, User2 } from "lucide-react";
import { sanitizeInternalCallbackUrl } from "@/lib/utils";

export default function RegisterPage() {
  return <RegisterPageClient />;
}

function RegisterPageClient() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const rawCallback = searchParams.get("callbackUrl");
  const callbackUrl = sanitizeInternalCallbackUrl(rawCallback);

  const getTargetUrl = (path: string) => {
    return callbackUrl
      ? `${path}?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : path;
  };

  return (
    <div className="w-full p-4 sm:p-8">
      <div className="mb-10 flex flex-col items-center justify-center">
        <img src="/logo.svg" alt="Zads Logo" className="h-14 w-auto object-contain" />
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-1">
          {t("register")} ✨
        </h2>
        <p className="text-sm text-muted-foreground">{t("chooseRole")}</p>
      </div>

      <div className="space-y-4">
        <Link
          href={getTargetUrl(`/${locale}/auth/register/client`)}
          className="group flex items-center gap-4 rounded-[1.25rem] bg-slate-50 p-5 transition-all hover:bg-white hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-0.5 border border-transparent hover:border-blue-100"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-transform group-hover:scale-110">
            <User2 className="h-6 w-6" />
          </div>
          <div className="flex-1 text-start">
            <p className="text-lg font-bold text-foreground">{t("clientRole")}</p>
            <p className="mt-0.5 text-sm font-medium text-muted-foreground">{t("clientRoleDesc")}</p>
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 rtl:rotate-180" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </span>
        </Link>

        <Link
          href={getTargetUrl(`/${locale}/auth/register/teacher`)}
          className="group flex items-center gap-4 rounded-[1.25rem] bg-slate-50 p-5 transition-all hover:bg-white hover:shadow-lg hover:shadow-orange-500/10 hover:-translate-y-0.5 border border-transparent hover:border-orange-100"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 transition-transform group-hover:scale-110">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="flex-1 text-start">
            <p className="text-lg font-bold text-foreground">{t("teacherRole")}</p>
            <p className="mt-0.5 text-sm font-medium text-muted-foreground">{t("teacherRoleDesc")}</p>
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 rtl:rotate-180" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </span>
        </Link>
      </div>

      <div className="mt-10 text-center text-sm font-medium text-muted-foreground">
        {t("haveAccount")}{" "}
        <Link href={getTargetUrl(`/${locale}/auth/login`)} className="text-primary hover:text-primary-dark hover:underline">
          {t("signInNow")}
        </Link>
      </div>
    </div>
  );
}
