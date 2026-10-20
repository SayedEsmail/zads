import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ErrorBanner } from "@/components/shared/ErrorBanner";

/** Shared body of the detail route's not-found and error states. */
export function TeacherUnavailable({ locale, error, onRetry }: { locale: string; error: string; onRetry?: () => void }) {
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <ErrorBanner error={error} onRetry={onRetry} />
      <div className="mt-4 text-center">
        <Link
          href={`/${locale}/public/teachers`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          <span>{locale === "ar" ? "العودة لدليل المعلمين" : "Back to teachers directory"}</span>
          <Arrow className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
