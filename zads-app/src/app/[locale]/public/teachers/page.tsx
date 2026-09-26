"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { Search, SlidersHorizontal, MapPin, CheckCircle, GraduationCap, ArrowRight, ArrowLeft } from "lucide-react";
import { useSearchStore } from "@/stores/search";
import { TeacherCard } from "@/components/shared/TeacherCard";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import type { StudyMode } from "@/types";

export default function PublicTeachersPage() {
  const locale = useLocale();
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;

  const {
    teachers,
    totalTeachers,
    totalPages,
    isLoadingTeachers,
    error,
    subjects,
    stages,
    governorates,
    fetchSubjects,
    fetchStages,
    fetchGovernorates,
    fetchCities,
    fetchAreas,
    searchTeachers,
  } = useSearchStore();

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

  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const loading = !initialLoadComplete || isLoadingTeachers;
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [priceError, setPriceError] = useState("");

  useEffect(() => {
    fetchSubjects();
    fetchStages();
    fetchGovernorates();
    searchTeachers({}, true).finally(() => setInitialLoadComplete(true));
  }, [fetchSubjects, fetchStages, fetchGovernorates, searchTeachers]);

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

  const handleSearch = (nextPage = 1) => {
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
    setPage(nextPage);
    searchTeachers({
      page: nextPage,
      subjectId: filters.subjectId || undefined,
      stageId: filters.stageId || undefined,
      governorateId: filters.governorateId || undefined,
      cityId: filters.cityId || undefined,
      areaId: filters.areaId || undefined,
      studyMode: (filters.studyMode as StudyMode) || undefined,
      minPrice,
      maxPrice,
    }, true);
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      query: "",
      subjectId: "",
      stageId: "",
      governorateId: "",
      cityId: "",
      areaId: "",
      studyMode: "" as StudyMode | "",
      minPrice: "",
      maxPrice: "",
    };
    setFilters(emptyFilters);
    setPriceError("");
    setPage(1);
    searchTeachers({}, true);
  };

  const filteredTeachers = teachers?.filter((t) => {
    if (!filters.query.trim()) return true;
    const q = filters.query.trim().toLowerCase();
    const nameMatch = t.user?.name?.toLowerCase().includes(q);
    const bioMatch = t.bio?.toLowerCase().includes(q);
    const subjectMatch = t.subjects?.some((s) =>
      Boolean(s.subject?.nameAr?.toLowerCase().includes(q) || s.subject?.nameEn?.toLowerCase().includes(q))
    );
    const locationMatch = [t.area?.nameAr, t.area?.nameEn, t.area?.city?.nameAr,
      t.area?.city?.nameEn, t.area?.city?.governorate?.nameAr, t.area?.city?.governorate?.nameEn]
      .some((name) => name?.toLowerCase().includes(q));
    return nameMatch || bioMatch || subjectMatch || locationMatch;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-primary to-primary-dark p-6 sm:p-8 text-white shadow-md">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              <MapPin className="h-3.5 w-3.5" />
              {locale === "ar" ? "معلمو السادس من أكتوبر والجيزة والقاهرة" : "6th of October, Giza & Cairo Teachers"}
            </span>
            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
              {locale === "ar" ? "اكتشف المعلّمين" : "Discover Teachers"}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-white/90">
              {locale === "ar"
                ? "اعثر على معلّم يناسب احتياجاتك، وتواصل معه لتنسيق التعلّم حضوريًا أو أونلاين."
                : "Find a teacher for your learning needs and connect to arrange in-person or online learning."}
            </p>
          </div>
        </div>

        {/* Search Controls */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                aria-label={locale === "ar" ? "البحث في المعلّمين" : "Search teachers"}
                value={filters.query}
                onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
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
              onClick={() => handleSearch()}
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
                  onChange={(e) => setFilters((f) => ({ ...f, governorateId: e.target.value, cityId: "", areaId: "" }))}
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
                  onClick={() => handleSearch()}
                  className="rounded-lg bg-primary text-white text-xs font-bold px-4 py-1.5 shadow-2xs hover:bg-primary-dark"
                >
                  {locale === "ar" ? "تطبيق الفلترة" : "Apply Filters"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Count & Status */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {loading
              ? (locale === "ar" ? "جاري البحث..." : "Searching...")
              : error ? (locale === "ar" ? "تعذّر تحميل المعلّمين" : "Could not load teachers") : (locale === "ar"
                  ? `عرض ${filteredTeachers?.length ?? 0} معلّم من ${totalTeachers}`
                  : `Showing ${filteredTeachers?.length ?? 0} teachers of ${totalTeachers}`)}
          </span>
          <span className="flex items-center gap-1 text-blue-700 font-medium">
            <CheckCircle className="h-3.5 w-3.5" />
            {locale === "ar" ? "المعلمون الموثقون يخضعون لتدقيق المؤهل" : "Verified badges denote audited credentials"}
          </span>
        </div>

        {/* Teachers List */}
        <ErrorBanner error={error} onRetry={() => handleSearch(page)} />

        {loading ? (
          <PageSkeleton rows={4} />
        ) : error ? null : !filteredTeachers || filteredTeachers.length === 0 ? (
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

        {!error && !loading && totalPages > 1 && (
          <nav aria-label={locale === "ar" ? "صفحات النتائج" : "Results pages"} className="flex justify-center items-center gap-4 text-sm">
            <button disabled={page <= 1} onClick={() => handleSearch(page - 1)} className="disabled:opacity-40">{locale === "ar" ? "السابق" : "Previous"}</button>
            <span>{page} / {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => handleSearch(page + 1)} className="disabled:opacity-40">{locale === "ar" ? "التالي" : "Next"}</button>
          </nav>
        )}

        {/* Join as Teacher Promotion Box */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-start">
            <h3 className="text-base font-bold text-slate-900">
              {locale === "ar" ? "هل أنت معلّم وتريد الوصول إلى متعلّمين؟" : "Are you a teacher looking to connect with learners?"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {locale === "ar"
                ? "انضم إلى زاد واستقبل طلبات تواصل من المتعلّمين وأولياء الأمور."
                : "Join Zads and receive contact requests from learners and guardians."}
            </p>
          </div>
          <Link
            href={`/${locale}/public/join-teacher`}
            className="shrink-0 flex items-center gap-2 rounded-xl bg-slate-900 text-white px-5 py-2.5 text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            <span>{locale === "ar" ? "انضم كمعلم الآن" : "Join as a Teacher"}</span>
            <Arrow className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
