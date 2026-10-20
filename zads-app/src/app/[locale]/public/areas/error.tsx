"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AlertCircle, RefreshCw } from "lucide-react";

// Same look as ErrorBanner, written out so these otherwise JS-free pages do
// not pull tailwind-merge (via cn) into their bundle just for a fallback.
export default function AreaError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const locale = useLocale();
  const tCommon = useTranslations("common");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive" role="alert">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="flex-1 text-sm">
          {locale === "ar" ? "حدث خطأ أثناء تحميل الصفحة" : "Something went wrong while loading this page"}
        </div>
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-1.5 rounded-md border border-destructive/40 px-2.5 py-1 text-xs font-medium transition-colors hover:bg-destructive/20"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {tCommon("retry")}
        </button>
      </div>
    </div>
  );
}
