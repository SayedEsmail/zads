import Link from "next/link";
import { MapPin } from "lucide-react";
import { getLocale } from "next-intl/server";

export default async function AreaNotFound() {
  const locale = await getLocale();
  const isAr = locale === "ar";

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4">
      <div className="mx-auto max-w-xl space-y-6 text-center">
        <MapPin className="mx-auto h-12 w-12 text-slate-300" />
        <h1 className="text-2xl font-extrabold text-slate-900">
          {isAr ? "المنطقة دي مش متاحة لسه" : "This area isn't available yet"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isAr
            ? "حالياً بنغطي السادس من أكتوبر والشيخ زايد. تقدر تتصفح دليل المعلّمين لكل المناطق."
            : "We currently cover 6th of October and Sheikh Zayed. You can browse the teacher directory for all areas."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/${locale}/public/areas/6th-of-october`}
            className="rounded-xl border border-border px-6 py-2.5 text-sm font-semibold hover:bg-muted transition-colors"
          >
            {isAr ? "6 أكتوبر" : "6th of October"}
          </Link>
          <Link
            href={`/${locale}/public/areas/sheikh-zayed`}
            className="rounded-xl border border-border px-6 py-2.5 text-sm font-semibold hover:bg-muted transition-colors"
          >
            {isAr ? "الشيخ زايد" : "Sheikh Zayed"}
          </Link>
          <Link
            href={`/${locale}/public/teachers`}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-dark transition-colors"
          >
            {isAr ? "دليل المعلّمين" : "Teacher directory"}
          </Link>
        </div>
      </div>
    </div>
  );
}
