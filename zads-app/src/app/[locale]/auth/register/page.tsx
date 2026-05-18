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
    <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary">زاد</h1>
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
          <div className="flex-1 text-end">
            <p className="font-semibold">{t("clientRole")}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{t("clientRoleDesc")}</p>
          </div>
          <span className="text-muted-foreground">›</span>
        </Link>

        <Link
          href={`/${locale}/auth/register/teacher`}
          className="flex items-center gap-4 rounded-xl border border-border p-4 transition-colors hover:border-primary hover:bg-primary/5"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary/10">
            <GraduationCap className="h-5 w-5 text-secondary" />
          </div>
          <div className="flex-1 text-end">
            <p className="font-semibold">{t("teacherRole")}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{t("teacherRoleDesc")}</p>
          </div>
          <span className="text-muted-foreground">›</span>
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
