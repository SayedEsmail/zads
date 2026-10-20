"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { ErrorBanner } from "@/components/shared/ErrorBanner";

export default function TeachersError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const locale = useLocale();
  const router = useRouter();
  const [, startTransition] = useTransition();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <ErrorBanner
        error={locale === "ar" ? "تعذّر تحميل المعلّمين" : "Could not load teachers"}
        onRetry={() => startTransition(() => { router.refresh(); reset(); })}
      />
    </div>
  );
}
