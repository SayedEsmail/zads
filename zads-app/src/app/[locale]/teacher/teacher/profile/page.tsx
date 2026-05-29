"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useTeacherStore } from "@/stores/teacher";
import { useSearchStore } from "@/stores/search";
import { useAuthStore } from "@/stores/auth";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { getInitials } from "@/lib/utils";
import Image from "next/image";

export default function TeacherProfilePage() {
  const t = useTranslations("teacher");
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");
  const teacherStore = useTeacherStore();
  const authStore = useAuthStore();
  const { governorates, cities, areas, fetchGovernorates, fetchCities, fetchAreas } = useSearchStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    teacherStore.fetch();
    fetchGovernorates();
  }, []);

  if (teacherStore.isLoading && !teacherStore.data) return <PageSkeleton />;
  if (teacherStore.error) return <ErrorBanner error={teacherStore.error} onRetry={teacherStore.fetch} />;

  const teacher = teacherStore.data;
  const user = teacher?.user;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await authStore.uploadAvatar(file);
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await teacherStore.updateProfile({
      bio: fd.get("bio") as string,
      qualification: fd.get("qualification") as string,
      experienceYears: Number(fd.get("experienceYears")) || undefined,
      areaId: fd.get("areaId") as string || undefined,
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold">{t("profile")}</h1>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div
          className="relative cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          {user?.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.name ?? ""}
              width={72}
              height={72}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
              {getInitials(user?.name ?? "?")}
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
            <span className="text-xs text-white">{tCommon("change")}</span>
          </div>
        </div>
        <div>
          <p className="font-semibold">{user?.name}</p>
          <p className="text-sm text-muted-foreground">{user?.phone}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{tCommon("avatarInstruction")}</p>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
      </div>

      <ErrorBanner error={teacherStore.error} />

      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">{tAuth("bio")}</label>
          <textarea name="bio" defaultValue={teacher?.bio ?? ""} rows={3} className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">{tCommon("qualification")}</label>
          <input name="qualification" type="text" defaultValue={teacher?.qualification ?? ""} className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">{tCommon("experienceYears")}</label>
          <input name="experienceYears" type="number" min="0" defaultValue={teacher?.experienceYears ?? ""} className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">{tCommon("governorate")}</label>
          <select name="governorateId" onChange={(e) => fetchCities(e.target.value)} className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none">
            <option value="">{tCommon("selectGovernorate")}</option>
            {governorates.map((g) => <option key={g.id} value={g.id}>{g.nameAr}</option>)}
          </select>
        </div>
        {cities.length > 0 && (
          <div>
            <label className="mb-1.5 block text-sm font-medium">{tCommon("city")}</label>
            <select name="cityId" onChange={(e) => fetchAreas(e.target.value)} className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none">
              <option value="">{tCommon("selectCity")}</option>
              {cities.map((c) => <option key={c.id} value={c.id}>{c.nameAr}</option>)}
            </select>
          </div>
        )}
        {areas.length > 0 && (
          <div>
            <label className="mb-1.5 block text-sm font-medium">{tCommon("area")}</label>
            <select name="areaId" defaultValue={teacher?.areaId ?? ""} className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none">
              <option value="">{tCommon("selectArea")}</option>
              {areas.map((a) => <option key={a.id} value={a.id}>{a.nameAr}</option>)}
            </select>
          </div>
        )}
        <button type="submit" disabled={teacherStore.isLoading} className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60">
          {teacherStore.isLoading ? "..." : tCommon("save")}
        </button>
      </form>
    </div>
  );
}
