"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Search, SlidersHorizontal } from "lucide-react";
import type { Governorate, Stage, StudyMode, Subject } from "@/types";
import type { TeacherSearchParams } from "@/lib/server-api";
import { useSearchQuery } from "./SearchQueryContext";

type FormState = {
  subjectId: string;
  stageId: string;
  governorateId: string;
  studyMode: StudyMode | "";
  minPrice: string;
  maxPrice: string;
};

const toForm = (f: TeacherSearchParams): FormState => ({
  subjectId: f.subjectId ?? "",
  stageId: f.stageId ?? "",
  governorateId: f.governorateId ?? "",
  studyMode: f.studyMode ?? "",
  minPrice: f.minPrice?.toString() ?? "",
  maxPrice: f.maxPrice?.toString() ?? "",
});

interface TeacherFiltersProps {
  subjects: Subject[];
  stages: Stage[];
  governorates: Governorate[];
  /** Filters the server rendered the current results with (from the URL). */
  applied: TeacherSearchParams;
}

export function TeacherFilters({ subjects, stages, governorates, applied }: TeacherFiltersProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { query, setQuery } = useSearchQuery();

  const [filters, setFilters] = useState<FormState>(() => toForm(applied));
  const [showFilters, setShowFilters] = useState(false);
  const [priceError, setPriceError] = useState("");

  // Re-sync the form when the applied filters change from outside (reset from
  // the empty state, back/forward navigation).
  const appliedKey = JSON.stringify(applied);
  const [syncedKey, setSyncedKey] = useState(appliedKey);
  if (syncedKey !== appliedKey) {
    setSyncedKey(appliedKey);
    setFilters(toForm(applied));
  }

  const handleSearch = () => {
    const minPrice = filters.minPrice === "" ? undefined : Number(filters.minPrice);
    const maxPrice = filters.maxPrice === "" ? undefined : Number(filters.maxPrice);
    if (
      (minPrice !== undefined && (!Number.isSafeInteger(minPrice) || minPrice < 0)) ||
      (maxPrice !== undefined && (!Number.isSafeInteger(maxPrice) || maxPrice < 0))
    ) {
      setPriceError(locale === "ar" ? "أدخل سعراً صحيحاً موجباً أو صفراً." : "Enter a whole-number price of zero or more.");
      return;
    }
    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
      setPriceError(locale === "ar" ? "يجب ألا يتجاوز الحد الأدنى الحد الأقصى." : "Minimum price must not exceed maximum price.");
      return;
    }
    setPriceError("");

    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== "") qs.set(key, value);
    }
    const search = qs.toString();
    router.push(search ? `${pathname}?${search}` : pathname, { scroll: false });
  };

  const handleClearFilters = () => {
    setFilters(toForm({}));
    setQuery("");
    setPriceError("");
    router.push(pathname, { scroll: false });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            aria-label={locale === "ar" ? "البحث في المعلّمين" : "Search teachers"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={locale === "ar" ? "ابحث في الصفحة الحالية بالاسم، المادة، أو المنطقة..." : "Search this page by name, subject, or area..."}
            className="w-full rounded-xl border border-border bg-slate-50 py-2.5 ps-9 pe-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
          />
        </div>
        <button
          aria-label={locale === "ar" ? "فلاتر البحث" : "Search filters"}
          aria-expanded={showFilters}
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
            showFilters ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-slate-100 text-slate-700"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">{locale === "ar" ? "تصفية متقدمة" : "Filters"}</span>
        </button>
        <button
          onClick={handleSearch}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-dark transition-colors cursor-pointer shadow-sm"
        >
          {locale === "ar" ? "بحث" : "Search"}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="pt-3 border-t border-slate-100 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">{locale === "ar" ? "المادة" : "Subject"}</label>
            <select
              value={filters.subjectId}
              onChange={(e) => setFilters((f) => ({ ...f, subjectId: e.target.value }))}
              className="w-full rounded-lg border border-border px-2.5 py-2 text-xs bg-white"
            >
              <option value="">{locale === "ar" ? "كل المواد" : "All Subjects"}</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {locale === "ar" ? s.nameAr : s.nameEn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">{locale === "ar" ? "المرحلة" : "Stage"}</label>
            <select
              value={filters.stageId}
              onChange={(e) => setFilters((f) => ({ ...f, stageId: e.target.value }))}
              className="w-full rounded-lg border border-border px-2.5 py-2 text-xs bg-white"
            >
              <option value="">{locale === "ar" ? "كل المراحل" : "All Stages"}</option>
              {stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {locale === "ar" ? s.nameAr : s.nameEn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">{locale === "ar" ? "طريقة التدريس" : "Mode"}</label>
            <select
              value={filters.studyMode}
              onChange={(e) => setFilters((f) => ({ ...f, studyMode: e.target.value as StudyMode | "" }))}
              className="w-full rounded-lg border border-border px-2.5 py-2 text-xs bg-white"
            >
              <option value="">{locale === "ar" ? "الكل (حضوري أو أونلاين)" : "All (Online & In-person)"}</option>
              <option value="offline">{locale === "ar" ? "حضوري فقط" : "In-Person Only"}</option>
              <option value="online">{locale === "ar" ? "أونلاين فقط" : "Online Only"}</option>
            </select>
          </div>

          <div>
            <label htmlFor="public-min-price" className="block text-xs font-bold text-slate-600 mb-1">{locale === "ar" ? "السعر الأدنى" : "Minimum price"}</label>
            <input id="public-min-price" type="number" min="0" step="1" inputMode="numeric" value={filters.minPrice} onChange={(e) => { setFilters((f) => ({ ...f, minPrice: e.target.value })); setPriceError(""); }} placeholder={locale === "ar" ? "أي سعر" : "Any price"} className="w-full rounded-lg border border-border px-2.5 py-2 text-xs bg-white" />
          </div>

          <div>
            <label htmlFor="public-max-price" className="block text-xs font-bold text-slate-600 mb-1">{locale === "ar" ? "السعر الأقصى" : "Maximum price"}</label>
            <input id="public-max-price" type="number" min="0" step="1" inputMode="numeric" value={filters.maxPrice} onChange={(e) => { setFilters((f) => ({ ...f, maxPrice: e.target.value })); setPriceError(""); }} placeholder={locale === "ar" ? "أي سعر" : "Any price"} className="w-full rounded-lg border border-border px-2.5 py-2 text-xs bg-white" />
          </div>

          {priceError && <p role="alert" className="sm:col-span-2 md:col-span-4 text-xs font-medium text-red-600">{priceError}</p>}

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">{locale === "ar" ? "المحافظة" : "Governorate"}</label>
            <select
              value={filters.governorateId}
              onChange={(e) => setFilters((f) => ({ ...f, governorateId: e.target.value }))}
              className="w-full rounded-lg border border-border px-2.5 py-2 text-xs bg-white"
            >
              <option value="">{locale === "ar" ? "كل المحافظات" : "All Governorates"}</option>
              {governorates.map((g) => (
                <option key={g.id} value={g.id}>
                  {locale === "ar" ? g.nameAr : g.nameEn}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 md:col-span-4 flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs text-muted-foreground hover:text-slate-900 font-semibold px-3 py-1.5"
            >
              {locale === "ar" ? "إعادة تعيين" : "Reset Filters"}
            </button>
            <button
              type="button"
              onClick={handleSearch}
              className="rounded-lg bg-primary text-white text-xs font-bold px-4 py-1.5 shadow-2xs hover:bg-primary-dark"
            >
              {locale === "ar" ? "تطبيق الفلترة" : "Apply Filters"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
