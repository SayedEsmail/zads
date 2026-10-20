"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { TeacherUnavailable } from "./TeacherUnavailable";

export default function TeacherDetailError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const locale = useLocale();
  const router = useRouter();
  const [, startTransition] = useTransition();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <TeacherUnavailable
      locale={locale}
      error={locale === "ar" ? "حدث خطأ أثناء تحميل بيانات المعلم" : "Something went wrong while loading this teacher"}
      onRetry={() => startTransition(() => { router.refresh(); reset(); })}
    />
  );
}
