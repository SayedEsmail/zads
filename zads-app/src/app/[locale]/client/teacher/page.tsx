"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { useSearchStore } from "@/stores/search";
import { useFavoritesStore } from "@/stores/favorites";
import { useContactRequestsStore } from "@/stores/contact-requests";
import { TeacherCard } from "@/components/shared/TeacherCard";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import type { StudyMode } from "@/types";

export default function TeacherSearchPage() {
  const locale = useLocale();
  const t = useTranslations("request");
  const tClient = useTranslations("client");
  const tCommon = useTranslations("common");
  const {
    teachers, totalTeachers, isLoadingTeachers, error,
    subjects, stages, governorates, cities, areas,
    fetchSubjects, fetchStages, fetchGovernorates, fetchCities, fetchAreas, searchTeachers,
  } = useSearchStore();
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const { createRequest } = useContactRequestsStore();

  const [filters, setFilters] = useState({
    query: "",
    subjectId: "",
    stageId: "",
    governorateId: "",
    cityId: "",
    areaId: "",
    studyMode: "" as StudyMode | "",
    minPrice: "",
    maxPrice: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [priceError, setPriceError] = useState("");

  useEffect(() => {
    fetchSubjects();
    fetchStages();
    fetchGovernorates();
    searchTeachers({});
  }, []);

  useEffect(() => {
    if (filters.governorateId) {
      fetchCities(filters.governorateId);
    }
  }, [filters.governorateId, fetchCities]);

  useEffect(() => {
    if (filters.cityId) {
      fetchAreas(filters.cityId);
    }
  }, [filters.cityId, fetchAreas]);

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
    searchTeachers({
      subjectId: filters.subjectId || undefined,
      stageId: filters.stageId || undefined,
      governorateId: filters.governorateId || undefined,
      cityId: filters.cityId || undefined,
      areaId: filters.areaId || undefined,
      studyMode: (filters.studyMode as StudyMode) || undefined,
      minPrice,
      maxPrice,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">{tClient("findTeacher")}</h1>

      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={filters.query}
            onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
            placeholder={tClient("searchPlaceholder")}
            className="w-full rounded-lg border border-border ps-9 pe-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm transition-colors ${showFilters ? "bg-primary text-white border-primary" : "hover:bg-muted"}`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {tCommon("filter")}
        </button>
        <button
          onClick={handleSearch}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          {tCommon("search")}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="grid grid-cols-2 gap-3 rounded-[1.25rem] border border-slate-100 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-4 sm:grid-cols-3">
          <select
            value={filters.subjectId}
            onChange={(e) => setFilters((f) => ({ ...f, subjectId: e.target.value }))}
            className="rounded-lg border border-border px-2.5 py-2 text-sm focus:outline-none"
          >
            <option value="">{tClient("allSubjects")}</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.nameAr}</option>)}
          </select>
          <select
            value={filters.stageId}
            onChange={(e) => setFilters((f) => ({ ...f, stageId: e.target.value }))}
            className="rounded-lg border border-border px-2.5 py-2 text-sm focus:outline-none"
          >
            <option value="">{tClient("allStages")}</option>
            {stages.map((s) => <option key={s.id} value={s.id}>{s.nameAr}</option>)}
          </select>
          <select
            value={filters.governorateId}
            onChange={(e) => {
              const govId = e.target.value;
              setFilters((f) => ({ ...f, governorateId: govId, cityId: "", areaId: "" }));
            }}
            className="rounded-lg border border-border px-2.5 py-2 text-sm focus:outline-none"
          >
            <option value="">{tClient("allGovernorates")}</option>
            {governorates.map((g) => <option key={g.id} value={g.id}>{g.nameAr}</option>)}
          </select>
          <select
            value={filters.cityId}
            onChange={(e) => {
              const cityId = e.target.value;
              setFilters((f) => ({ ...f, cityId: cityId, areaId: "" }));
            }}
            disabled={!filters.governorateId}
            className="rounded-lg border border-border px-2.5 py-2 text-sm focus:outline-none disabled:bg-muted disabled:text-muted-foreground"
          >
            <option value="">{tClient("allCities")}</option>
            {cities.map((c) => <option key={c.id} value={c.id}>{c.nameAr}</option>)}
          </select>
          <select
            value={filters.areaId}
            onChange={(e) => setFilters((f) => ({ ...f, areaId: e.target.value }))}
            disabled={!filters.cityId}
            className="rounded-lg border border-border px-2.5 py-2 text-sm focus:outline-none disabled:bg-muted disabled:text-muted-foreground"
          >
            <option value="">{tClient("allAreas")}</option>
            {areas.map((a) => <option key={a.id} value={a.id}>{a.nameAr}</option>)}
          </select>
          <select
            value={filters.studyMode}
            onChange={(e) => setFilters((f) => ({ ...f, studyMode: e.target.value as StudyMode | "" }))}
            className="rounded-lg border border-border px-2.5 py-2 text-sm focus:outline-none"
          >
            <option value="">{t("studyMode")}</option>
            <option value="online">{t("online")}</option>
            <option value="offline">{t("offline")}</option>
            <option value="both">{t("both")}</option>
          </select>
          <label className="text-xs font-semibold text-muted-foreground">
            {locale === "ar" ? "السعر الأدنى" : "Minimum price"}
            <input type="number" min="0" step="1" inputMode="numeric" value={filters.minPrice} onChange={(e) => { setFilters((f) => ({ ...f, minPrice: e.target.value })); setPriceError(""); }} placeholder={locale === "ar" ? "أي سعر" : "Any price"} className="mt-1 w-full rounded-lg border border-border px-2.5 py-2 text-sm font-normal text-foreground" />
          </label>
          <label className="text-xs font-semibold text-muted-foreground">
            {locale === "ar" ? "السعر الأقصى" : "Maximum price"}
            <input type="number" min="0" step="1" inputMode="numeric" value={filters.maxPrice} onChange={(e) => { setFilters((f) => ({ ...f, maxPrice: e.target.value })); setPriceError(""); }} placeholder={locale === "ar" ? "أي سعر" : "Any price"} className="mt-1 w-full rounded-lg border border-border px-2.5 py-2 text-sm font-normal text-foreground" />
          </label>
          {priceError && <p role="alert" className="col-span-full text-xs font-medium text-red-600">{priceError}</p>}
        </div>
      )}

      {/* Results */}
      {error && <ErrorBanner error={error} />}
      <p className="text-sm text-muted-foreground">{tClient("teachersCount", { count: totalTeachers })}</p>

      {isLoadingTeachers ? (
        <PageSkeleton rows={4} />
      ) : (
        <div className="space-y-3">
          {teachers.map((teacher) => (
            <TeacherCard
              key={teacher.id}
              teacher={teacher}
              subjects={teacher.subjects}
              isFavorite={isFavorite(teacher.id)}
              onToggleFavorite={(id) =>
                isFavorite(id) ? removeFavorite(id) : addFavorite(id)
              }
              onContact={(id) => {
                createRequest({
                  teacherId: id,
                })
                  .then(() => {
                    toast.success(tClient("requestSent") ?? "تم إرسال الطلب");
                  })
                  .catch((err) => {
                    toast.error(err?.response?.data?.message ?? err.message ?? "خطأ أثناء الإرسال");
                  });
              }}
            />
          ))}
          {teachers.length === 0 && (
            <p className="py-8 text-center text-muted-foreground">{tClient("noResultsWithFilters")}</p>
          )}
        </div>
      )}
    </div>
  );
}
