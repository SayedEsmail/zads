"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import { MapPin, Star, Heart, MessageCircle } from "lucide-react";
import { cn, getInitials, formatPrice } from "@/lib/utils";
import type { Teacher, TeacherSubject } from "@/types";

export interface TeacherCardProps {
  teacher: Teacher;
  subjects?: TeacherSubject[];
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onContact?: (id: string) => void;
  variant?: "compact" | "full";
}

export function TeacherCard({
  teacher,
  subjects,
  isFavorite = false,
  onToggleFavorite,
  onContact,
  variant = "full",
}: TeacherCardProps) {
  const locale = useLocale();
  const user = teacher.user;
  const area = teacher.area;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4 transition-shadow hover:shadow-sm">
      {/* Avatar */}
      <div className="shrink-0">
        {user?.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt={user.name ?? ""}
            width={variant === "full" ? 52 : 40}
            height={variant === "full" ? 52 : 40}
            className="rounded-full object-cover"
          />
        ) : (
          <div className={cn(
            "flex items-center justify-center rounded-full bg-primary/10 text-primary font-semibold",
            variant === "full" ? "h-13 w-13 text-base" : "h-10 w-10 text-sm"
          )}>
            {getInitials(user?.name ?? "?")}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/${locale}/client/teacher/${teacher.id}`}
            className="font-semibold hover:text-primary line-clamp-1"
          >
            {user?.name}
          </Link>
          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(teacher.id)}
              className="shrink-0 text-muted-foreground hover:text-destructive"
              aria-label="Toggle favorite"
            >
              <Heart className={cn("h-4 w-4", isFavorite && "fill-destructive text-destructive")} />
            </button>
          )}
        </div>

        {/* Rating */}
        {variant === "full" && (
          <div className="mt-0.5 flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" />
            <span className="text-xs font-medium">{Number(teacher.avgRating).toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({teacher.ratingCount})</span>
          </div>
        )}

        {/* Location */}
        {area && (
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="line-clamp-1">
              {area.nameAr}
              {area.city?.nameAr && ` · ${area.city.nameAr}`}
            </span>
          </div>
        )}

        {/* Subject chips */}
        {subjects && subjects.length > 0 && variant === "full" && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {subjects.slice(0, 3).map((s) => (
              <span
                key={s.id}
                className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
              >
                {s.subject?.nameAr}
              </span>
            ))}
            {subjects.length > 3 && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                +{subjects.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Online/Offline pricing */}
        {subjects && subjects.length > 0 && variant === "full" && (
          <div className="mt-1.5 flex gap-3 text-xs text-muted-foreground">
            {subjects[0].priceOnline != null && (
              <span>أونلاين: <strong className="text-foreground">{formatPrice(subjects[0].priceOnline)}</strong></span>
            )}
            {subjects[0].priceOffline != null && (
              <span>أوفلاين: <strong className="text-foreground">{formatPrice(subjects[0].priceOffline)}</strong></span>
            )}
          </div>
        )}
      </div>

      {/* Contact button */}
      {onContact && (
        <button
          onClick={() => onContact(teacher.id)}
          className="shrink-0 flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dark"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">تواصل</span>
        </button>
      )}
    </div>
  );
}
