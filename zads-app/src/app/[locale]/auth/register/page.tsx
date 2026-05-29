import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { GraduationCap, User2 } from "lucide-react";

export default function RegisterPage() {
  return <RegisterPageClient />;
}

function RegisterPageClient() {
  const t = useTranslations("auth");
  const locale = useLocale();

  return (
    <div className="w-full bg-surface p-4 sm:p-8">
      <div className="mb-8 flex flex-col items-center justify-center">
        <img src="/logo.svg" alt="Zads Logo" className="h-16 w-auto object-contain" />
      </div>

      <h2 className="mb-2 text-xl font-semibold">{t("register")}</h2>
      <p className="mb-6 text-sm text-muted-foreground">{t("chooseRole")}</p>

      <div className="space-y-3">
        <Link
          href={`/${locale}/auth/register/client`}
          className="flex items-center gap-4 rounded-xl border border-border p-4 transition-colors hover:border-primary hover:bg-primary/5"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <User2 className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 text-start">
            <p className="font-semibold">{t("clientRole")}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{t("clientRoleDesc")}</p>
          </div>
          <span className="text-muted-foreground inline-block rtl:rotate-180 font-mono text-lg">›</span>
        </Link>

        <Link
          href={`/${locale}/auth/register/teacher`}
          className="flex items-center gap-4 rounded-xl border border-border p-4 transition-colors hover:border-primary hover:bg-primary/5"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary/10">
            <GraduationCap className="h-5 w-5 text-secondary" />
          </div>
          <div className="flex-1 text-start">
            <p className="font-semibold">{t("teacherRole")}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{t("teacherRoleDesc")}</p>
          </div>
          <span className="text-muted-foreground inline-block rtl:rotate-180 font-mono text-lg">›</span>
        </Link>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("haveAccount")}{" "}
        <Link href={`/${locale}/auth/login`} className="font-medium text-primary hover:underline">
          {t("signInNow")}
        </Link>
      </p>
    </div>
  );
}
