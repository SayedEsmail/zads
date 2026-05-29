"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Globe } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const otherLocale = locale === "ar" ? "en" : "ar";
  const switchLocale = () => {
    const newPath = pathname.replace(`/${locale}`, `/${otherLocale}`);
    router.push(newPath);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface px-4 py-8 relative">
      {/* Dynamic Language Switcher */}
      <div className="absolute top-6 right-6 rtl:right-auto rtl:left-6">
        <button
          onClick={switchLocale}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium hover:bg-muted text-foreground transition-colors shadow-sm"
          title="Switch language / تغيير اللغة"
        >
          <Globe className="h-4 w-4" />
          <span>{otherLocale.toUpperCase()}</span>
        </button>
      </div>

      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
