"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { CheckCircle, GraduationCap } from "lucide-react";
import { TeacherCard } from "@/components/shared/TeacherCard";
import type { Teacher } from "@/types";
import { useSearchQuery } from "./SearchQueryContext";

export function VerifiedNote() {
  const locale = useLocale();
  return (
    <span className="flex items-center gap-1 text-blue-700 font-medium">
      <CheckCircle className="h-3.5 w-3.5" />
      {locale === "ar" ? "المعلمون الموثقون يخضعون لتدقيق المؤهل" : "Verified badges denote audited credentials"}
    </span>
  );
}

function matches(t: Teacher, q: string) {
  const nameMatch = t.user?.name?.toLowerCase().includes(q);
  const bioMatch = t.bio?.toLowerCase().includes(q);
  const subjectMatch = t.subjects?.some((s) =>
    Boolean(s.subject?.nameAr?.toLowerCase().includes(q) || s.subject?.nameEn?.toLowerCase().includes(q))
  );
  const locationMatch = [t.area?.nameAr, t.area?.nameEn, t.area?.city?.nameAr,
    t.area?.city?.nameEn, t.area?.city?.governorate?.nameAr, t.area?.city?.governorate?.nameEn]
    .some((name) => name?.toLowerCase().includes(q));
  return nameMatch || bioMatch || subjectMatch || locationMatch;
}

/** Receives the server-fetched page of teachers and applies the in-page text filter. */
export function TeacherList({ teachers, total }: { teachers: Teacher[]; total: number }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { query, setQuery } = useSearchQuery();

  const q = query.trim().toLowerCase();
  const filteredTeachers = q ? teachers.filter((t) => matches(t, q)) : teachers;

  const handleClearFilters = () => {
    setQuery("");
    router.push(pathname, { scroll: false });
  };

  return (
    <>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {locale === "ar"
            ? `عرض ${filteredTeachers.length} معلّم من ${total}`
            : `Showing ${filteredTeachers.length} teachers of ${total}`}
        </span>
        <VerifiedNote />
      </div>

      {filteredTeachers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-3">
          <GraduationCap className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">
            {locale === "ar" ? "لم نجد معلمين مطابقين لمعايير البحث" : "No teachers found matching your criteria"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {locale === "ar"
              ? "جرب إزالة بعض الفلاتر، أو ابحث في نطاق محافظة أو مدينة أوسع."
              : "Try clearing some filters or expanding your search area."}
          </p>
          <button
            onClick={handleClearFilters}
            className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {locale === "ar" ? "إعادة تعيين الفلاتر" : "Clear Filters"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTeachers.map((teacher) => (
            <TeacherCard
              key={teacher.id}
              teacher={teacher}
              subjects={teacher.subjects}
              targetHref={`/${locale}/public/teachers/${teacher.id}`}
            />
          ))}
        </div>
      )}
    </>
  );
}
