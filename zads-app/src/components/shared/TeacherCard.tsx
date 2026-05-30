"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
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
  const router = useRouter();
  const tCommon = useTranslations("common");
  const tAdmin = useTranslations("admin");
  const user = teacher.user;
  const area = teacher.area;

  const handleCardClick = () => {
    router.push(`/${locale}/client/teacher/${teacher.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group flex items-start gap-4 rounded-[1.25rem] border border-slate-100 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] hover:border-blue-100 cursor-pointer text-start"
    >
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
            onClick={(e) => e.stopPropagation()}
            className="font-semibold hover:text-primary line-clamp-1"
          >
            {user?.name}
          </Link>
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(teacher.id);
              }}
              className="shrink-0 text-muted-foreground hover:text-destructive relative z-10"
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
              <span>{tCommon("online")}: <strong className="text-foreground">{formatPrice(subjects[0].priceOnline)}</strong></span>
            )}
            {subjects[0].priceOffline != null && (
              <span>{tCommon("offline")}: <strong className="text-foreground">{formatPrice(subjects[0].priceOffline)}</strong></span>
            )}
          </div>
        )}
      </div>

      {/* Contact button */}
      {onContact && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onContact(teacher.id);
          }}
          className="shrink-0 flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dark relative z-10"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{tAdmin("contact")}</span>
        </button>
      )}
    </div>
  );
}
