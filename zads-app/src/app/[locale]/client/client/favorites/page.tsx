"use client";

import { useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Heart } from "lucide-react";
import { useFavoritesStore } from "@/stores/favorites";
import { TeacherCard } from "@/components/shared/TeacherCard";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import Link from "next/link";

export default function FavoritesPage() {
  const locale = useLocale();
  const t = useTranslations("client");
  const { data, isLoading, error, fetch, isFavorite, removeFavorite } = useFavoritesStore();

  useEffect(() => { fetch(); }, []);

  if (isLoading && !data) return <PageSkeleton />;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">{t("favorites")} <Heart className="inline h-5 w-5 text-destructive" /></h1>

      <ErrorBanner error={error} onRetry={fetch} />

      {!data || data.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <Heart className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">لا يوجد معلمون في المفضلة</p>
          <Link href={`/${locale}/client/client/teacher`} className="mt-3 block text-sm text-primary hover:underline">
            ابحث عن معلم
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((fav) => fav.teacher && (
            <TeacherCard
              key={fav.id}
              teacher={fav.teacher}
              subjects={fav.teacher.subjects}
              isFavorite={isFavorite(fav.teacher.id)}
              onToggleFavorite={(id) => removeFavorite(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
