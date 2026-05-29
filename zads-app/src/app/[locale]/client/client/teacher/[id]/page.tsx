"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MapPin, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { formatPrice } from "@/lib/utils";
import type { Teacher } from "@/types";

export default function TeacherDetailPage() {
  const { id } = useParams<{ id: string }>();
  const tTeacher = useTranslations("teacher");
  const tCommon = useTranslations("common");
  const tAdmin = useTranslations("admin");
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    api
      .get<{ data: Teacher }>(`/teachers/${id}`)
      .then((res) => {
        if (!cancelled) setTeacher(res.data.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message ?? err.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (isLoading) return <PageSkeleton rows={6} />;

  if (!teacher) {
    return (
      <div className="max-w-3xl mx-auto">
        <ErrorBanner error={error ?? tAdmin("teacherNotFound")} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <ErrorBanner error={error} />

      <section className="rounded-xl border border-border bg-surface p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{teacher.user?.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-warning text-warning" />
                {Number(teacher.avgRating).toFixed(1)} ({teacher.ratingCount})
              </span>
              {teacher.area && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {teacher.area.nameAr}
                  {teacher.area.city?.nameAr ? ` · ${teacher.area.city.nameAr}` : ""}
                </span>
              )}
            </div>
          </div>
          {teacher.isVerified && (
            <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
              {tCommon("verified")}
            </span>
          )}
        </div>

        {teacher.bio && <p className="mt-4 text-sm leading-7 text-muted-foreground">{teacher.bio}</p>}

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {teacher.qualification && (
            <div className="rounded-lg bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">{tCommon("qualification")}</p>
              <p className="font-medium">{teacher.qualification}</p>
            </div>
          )}
          {teacher.experienceYears != null && (
            <div className="rounded-lg bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">{tCommon("experienceYears")}</p>
              <p className="font-medium">{teacher.experienceYears}</p>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">{tTeacher("subjects")}</h2>
        {(teacher.subjects ?? []).length === 0 ? (
          <p className="rounded-xl border border-border p-5 text-sm text-muted-foreground">{tAdmin("noSubjects")}</p>
        ) : (
          teacher.subjects?.map((item) => (
            <div key={item.id} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{item.subject?.nameAr}</p>
                  <p className="text-sm text-muted-foreground">{item.stage?.nameAr}</p>
                </div>
                <p className="text-xs text-muted-foreground">{tCommon("duration", { minutes: item.durationMinutes })}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {item.priceOnline != null && <span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary">{tCommon("online")} {formatPrice(item.priceOnline)}</span>}
                {item.priceOffline != null && <span className="rounded-full bg-secondary/10 px-2.5 py-1 text-secondary">{tCommon("offline")} {formatPrice(item.priceOffline)}</span>}
                {item.priceAtTeacher != null && <span className="rounded-full bg-muted px-2.5 py-1">{tCommon("atTeacher")} {formatPrice(item.priceAtTeacher)}</span>}
                {item.priceAtStudent != null && <span className="rounded-full bg-muted px-2.5 py-1">{tCommon("atStudent")} {formatPrice(item.priceAtStudent)}</span>}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
