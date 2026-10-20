import Link from "next/link";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { ApiError, searchPublicTeachers, type TeacherSearchParams } from "@/lib/server-api";
import { TeacherList, VerifiedNote } from "./TeacherList";
import { RefreshErrorBanner } from "./RefreshErrorBanner";

function pageHref(locale: string, filters: TeacherSearchParams, page: number) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...filters, page })) {
    if (value !== undefined && value !== "" && !(key === "page" && value === 1)) qs.set(key, String(value));
  }
  const search = qs.toString();
  return `/${locale}/public/teachers${search ? `?${search}` : ""}`;
}

/** Server-rendered results: the teacher list is in the initial HTML. */
export async function TeacherResults({ locale, filters }: { locale: string; filters: TeacherSearchParams }) {
  const isAr = locale === "ar";

  let result;
  try {
    result = await searchPublicTeachers(filters);
  } catch (err) {
    const message = err instanceof ApiError ? err.message : isAr ? "تعذّر تحميل المعلّمين" : "Could not load teachers";
    return (
      <>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{isAr ? "تعذّر تحميل المعلّمين" : "Could not load teachers"}</span>
          <VerifiedNote />
        </div>
        <RefreshErrorBanner error={message} />
      </>
    );
  }

  const page = filters.page ?? 1;
  const { total, totalPages } = result.pagination;

  return (
    <>
      <TeacherList teachers={result.data} total={total} />

      {totalPages > 1 && (
        <nav aria-label={isAr ? "صفحات النتائج" : "Results pages"} className="flex justify-center items-center gap-4 text-sm">
          {page <= 1 ? (
            <button disabled className="disabled:opacity-40">{isAr ? "السابق" : "Previous"}</button>
          ) : (
            <Link href={pageHref(locale, filters, page - 1)} scroll={false}>{isAr ? "السابق" : "Previous"}</Link>
          )}
          <span>{page} / {totalPages}</span>
          {page >= totalPages ? (
            <button disabled className="disabled:opacity-40">{isAr ? "التالي" : "Next"}</button>
          ) : (
            <Link href={pageHref(locale, filters, page + 1)} scroll={false}>{isAr ? "التالي" : "Next"}</Link>
          )}
        </nav>
      )}
    </>
  );
}

export function TeacherResultsSkeleton({ locale }: { locale: string }) {
  return (
    <>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{locale === "ar" ? "جاري البحث..." : "Searching..."}</span>
        <VerifiedNote />
      </div>
      <PageSkeleton rows={4} />
    </>
  );
}
