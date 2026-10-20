import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Star,
  CheckCircle,
  Clock,
  BookOpen,
  Calendar,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { getTeacher } from "@/lib/server-api";
import { formatPrice, getInitials } from "@/lib/utils";
import { TrackTeacherView } from "./TrackTeacherView";

const DAYS_AR = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const DAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type Props = { params: Promise<{ id: string; locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = await params;
  const isAr = locale === "ar";
  // Same request-scoped call as the page (React cache), so the API counts one view.
  const teacher = await getTeacher(id).catch(() => null);
  if (!teacher) {
    return { title: isAr ? "المعلم غير موجود | زاد" : "Teacher not found | Zads" };
  }

  const name = teacher.user?.name ?? "";
  const subjects = [...new Set(teacher.subjects?.map((s) => (isAr ? s.subject?.nameAr : s.subject?.nameEn)).filter(Boolean))]
    .slice(0, 3)
    .join(isAr ? "، " : ", ");
  const area = teacher.area ? (isAr ? teacher.area.nameAr : teacher.area.nameEn ?? teacher.area.nameAr) : "";
  const path = `/${locale}/public/teachers/${id}`;

  return {
    title: isAr ? `${name}${subjects ? ` — ${subjects}` : ""} | زاد` : `${name}${subjects ? ` — ${subjects}` : ""} | Zads`,
    description: teacher.bio?.slice(0, 160) ||
      (isAr
        ? `ملف المعلم ${name}${area ? ` في ${area}` : ""}: المواد والأسعار والمواعيد المتاحة على زاد.`
        : `${name}'s teacher profile${area ? ` in ${area}` : ""}: subjects, rates and availability on Zads.`),
    alternates: {
      canonical: path,
      languages: {
        ar: `/ar/public/teachers/${id}`,
        en: `/en/public/teachers/${id}`,
      },
    },
    openGraph: {
      title: name,
      type: "profile",
      locale: isAr ? "ar_EG" : "en_US",
      ...(teacher.user?.avatarUrl ? { images: [teacher.user.avatarUrl] } : {}),
    },
  };
}

export default async function PublicTeacherDetailPage({ params }: Props) {
  const { id, locale } = await params;
  // Profile is public; only the contact link target depends on the session.
  const [teacher, session] = await Promise.all([getTeacher(id), auth()]);
  if (!teacher) notFound();

  const user = teacher.user;
  const area = teacher.area;
  const isParent = session?.userType === "parent";
  const contactUrl = isParent
    ? `/${locale}/client/teacher/${teacher.id}`
    : `/${locale}/auth/login?callbackUrl=${encodeURIComponent(`/${locale}/client/teacher/${teacher.id}`)}`;

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4">
      <TrackTeacherView teacherId={teacher.id} />
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href={`/${locale}/public`} className="hover:text-primary">
            {locale === "ar" ? "الرئيسية" : "Home"}
          </Link>
          <span>/</span>
          <Link href={`/${locale}/public/teachers`} className="hover:text-primary">
            {locale === "ar" ? "المعلمون" : "Teachers"}
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-800">{user?.name}</span>
        </nav>

        {/* Profile Header */}
        <div className="rounded-[1.25rem] border border-slate-100 bg-white p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 border-b border-slate-50 pb-5">
            <div className="flex items-center gap-4 text-start">
              <div className="shrink-0">
                {user?.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.name ?? ""}
                    width={68}
                    height={68}
                    className="rounded-full object-cover border-2 border-primary/10 shadow-2xs"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xl">
                    {getInitials(user?.name ?? "?")}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-extrabold text-slate-900">{user?.name}</h1>
                  {teacher.isVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
                      <CheckCircle className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                      {locale === "ar" ? "معلم معتمد وموثق" : "Verified Teacher"}
                    </span>
                  )}
                </div>

                {area && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span>
                      {area.nameAr}
                      {area.city?.nameAr && ` · ${area.city.nameAr}`}
                    </span>
                  </p>
                )}

                {/* Rating — hide until there are reviews */}
                {Number(teacher.ratingCount) > 0 && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="text-xs font-bold text-slate-800">
                      {Number(teacher.avgRating).toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-400">
                      ({teacher.ratingCount} {locale === "ar" ? "تقييم" : "reviews"})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* CTA Contact Button */}
            <Link
              href={contactUrl}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-primary-dark transition-all text-center"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{locale === "ar" ? "طلب تواصل مباشر" : "Request Contact"}</span>
            </Link>
          </div>

          {/* Teacher Badges & Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 block">{locale === "ar" ? "الخبرة التعليمية" : "Experience"}</span>
              <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                {teacher.experienceYears
                  ? (locale === "ar" ? `${teacher.experienceYears} سنوات` : `${teacher.experienceYears} Years`)
                  : (locale === "ar" ? "غير محدد" : "Not specified")}
              </span>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 block">{locale === "ar" ? "المؤهل الدراسي" : "Qualification"}</span>
              <span className="text-sm font-bold text-slate-800 mt-0.5 block truncate">
                {teacher.qualification || (locale === "ar" ? "مؤهل جامعي تربوي" : "Degree")}
              </span>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-semibold text-slate-400 block">{locale === "ar" ? "طرق التدريس" : "Lesson Mode"}</span>
              <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                {locale === "ar" ? "حضوري منزلي / أونلاين" : "Home / Online"}
              </span>
            </div>
          </div>

          {/* Bio */}
          {teacher.bio && (
            <div className="space-y-2 pt-2">
              <h2 className="text-sm font-bold text-slate-800">{locale === "ar" ? "نبذة تعريفية" : "About the Teacher"}</h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{teacher.bio}</p>
            </div>
          )}
        </div>

        {/* Subjects & Pricing Section */}
        <div className="rounded-[1.25rem] border border-slate-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-slate-900">{locale === "ar" ? "المواد والمراحل والأسعار التقديرية" : "Subjects & Rates"}</h2>
          </div>

          {!teacher.subjects || teacher.subjects.length === 0 ? (
            <p className="text-xs text-muted-foreground">{locale === "ar" ? "لم تتم إضافة مواد بعد" : "No subjects listed yet"}</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {teacher.subjects.map((sub) => (
                <div key={sub.id} className="rounded-xl border border-slate-200/80 p-4 space-y-2.5 bg-white">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">
                        {locale === "ar" ? sub.subject?.nameAr : sub.subject?.nameEn}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {locale === "ar" ? sub.stage?.nameAr : sub.stage?.nameEn}
                      </p>
                    </div>
                    {sub.durationMinutes && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        <Clock className="h-3 w-3" />
                        {sub.durationMinutes} {locale === "ar" ? "دقيقة" : "min"}
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    {sub.isOnline && sub.priceOnline != null && (
                      <div>
                        <span className="text-slate-400 block text-[10px]">{locale === "ar" ? "أونلاين" : "Online"}</span>
                        <strong className="text-primary font-bold">{formatPrice(sub.priceOnline)}</strong>
                      </div>
                    )}
                    {sub.isOffline && sub.priceOffline != null && (
                      <div>
                        <span className="text-slate-400 block text-[10px]">{locale === "ar" ? "حضوري منزلي" : "In-Person"}</span>
                        <strong className="text-primary font-bold">{formatPrice(sub.priceOffline)}</strong>
                      </div>
                    )}
                    {((sub.isOnline && sub.priceOnline == null) || (sub.isOffline && sub.priceOffline == null)) && (
                      <span className="text-emerald-700 font-semibold text-xs bg-emerald-50 px-2 py-0.5 rounded-full">
                        {locale === "ar" ? "السعر حسب الاتفاق" : "Rate negotiable"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Availability Schedule */}
        {teacher.availabilities && teacher.availabilities.length > 0 && (
          <div className="rounded-[1.25rem] border border-slate-100 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold text-slate-900">{locale === "ar" ? "المواعيد المتاحة للتدريس" : "Available Teaching Schedule"}</h2>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {teacher.availabilities.map((slot) => {
                const dayName = (locale === "ar" ? DAYS_AR : DAYS_EN)[slot.dayOfWeek];
                return (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-2 text-xs"
                  >
                    <span className="font-bold text-slate-700">{dayName}</span>
                    <span className="text-slate-500 font-medium">
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Safety & Trust Note */}
        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 flex items-start gap-3 text-xs text-blue-900">
          <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">
              {locale === "ar" ? "تواصل مباشر وبخصوصية كاملة" : "Direct and Private Communication"}
            </p>
            <p className="text-blue-800/80 leading-relaxed">
              {locale === "ar"
                ? "يتم إرسال طلب التواصل مباشرة إلى المعلم دون أي وسيط، ولا يتم الكشف عن أرقام الهواتف إلا بعد موافقة الطرفين لضمان الخصوصية."
                : "Your request is sent directly to the teacher. Phone numbers are protected and only shared once both parties agree."}
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-2 pb-6">
          <Link
            href={contactUrl}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-primary-dark transition-all"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{locale === "ar" ? "تواصل مع هذا المعلم الآن" : "Contact This Teacher Now"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
