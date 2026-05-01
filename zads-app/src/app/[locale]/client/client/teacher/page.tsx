"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Search, SlidersHorizontal } from "lucide-react";
import { useSearchStore } from "@/stores/search";
import { useFavoritesStore } from "@/stores/favorites";
import { TeacherCard } from "@/components/shared/TeacherCard";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import type { StudyMode } from "@/types";

export default function TeacherSearchPage() {
  const locale = useLocale();
  const t = useTranslations("request");
  const {
    teachers, totalTeachers, isLoadingTeachers, error,
    subjects, stages, governorates,
    fetchSubjects, fetchStages, fetchGovernorates, searchTeachers,
  } = useSearchStore();
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();

  const [filters, setFilters] = useState({
    query: "",
    subjectId: "",
    stageId: "",
    governorateId: "",
    studyMode: "" as StudyMode | "",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchSubjects();
    fetchStages();
    fetchGovernorates();
    searchTeachers({});
  }, []);

  const handleSearch = () => {
    searchTeachers({
      subjectId: filters.subjectId || undefined,
      stageId: filters.stageId || undefined,
      governorateId: filters.governorateId || undefined,
      studyMode: (filters.studyMode as StudyMode) || undefined,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">البحث عن معلم</h1>

      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={filters.query}
            onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
            placeholder="ابحث بالاسم أو المادة..."
            className="w-full rounded-lg border border-border ps-9 pe-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm transition-colors ${showFilters ? "bg-primary text-white border-primary" : "hover:bg-muted"}`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          فلتر
        </button>
        <button
          onClick={handleSearch}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          بحث
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-4">
          <select
            value={filters.subjectId}
            onChange={(e) => setFilters((f) => ({ ...f, subjectId: e.target.value }))}
            className="rounded-lg border border-border px-2.5 py-2 text-sm focus:outline-none"
          >
            <option value="">كل المواد</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.nameAr}</option>)}
          </select>
          <select
            value={filters.stageId}
            onChange={(e) => setFilters((f) => ({ ...f, stageId: e.target.value }))}
            className="rounded-lg border border-border px-2.5 py-2 text-sm focus:outline-none"
          >
            <option value="">كل المراحل</option>
            {stages.map((s) => <option key={s.id} value={s.id}>{s.nameAr}</option>)}
          </select>
          <select
            value={filters.governorateId}
            onChange={(e) => setFilters((f) => ({ ...f, governorateId: e.target.value }))}
            className="rounded-lg border border-border px-2.5 py-2 text-sm focus:outline-none"
          >
            <option value="">كل المحافظات</option>
            {governorates.map((g) => <option key={g.id} value={g.id}>{g.nameAr}</option>)}
          </select>
          <select
            value={filters.studyMode}
            onChange={(e) => setFilters((f) => ({ ...f, studyMode: e.target.value as StudyMode | "" }))}
            className="rounded-lg border border-border px-2.5 py-2 text-sm focus:outline-none"
          >
            <option value="">طريقة التعلم</option>
            <option value="online">{t("online")}</option>
            <option value="offline">{t("offline")}</option>
            <option value="both">{t("both")}</option>
          </select>
        </div>
      )}

      {/* Results */}
      <p className="text-sm text-muted-foreground">{totalTeachers} معلم</p>

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
            />
          ))}
          {teachers.length === 0 && (
            <p className="py-8 text-center text-muted-foreground">لا توجد نتائج. جرّب تغيير الفلاتر.</p>
          )}
        </div>
      )}
    </div>
  );
}
