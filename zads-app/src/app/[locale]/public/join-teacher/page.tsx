import type { Metadata } from "next";
import { JoinTeacherContent } from "./JoinTeacherContent";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  const path = `/${locale}/public/join-teacher`;

  return {
    title: isAr
      ? "انضم كمعلّم — زاد | ربط معلّمين ومتعلّمين في 6 أكتوبر"
      : "Join as a Teacher — Zads",
    description: isAr
      ? "أنشئ ملف معلّم على زاد، اعرض تخصصاتك، وتواصل مع المتعلّمين في السادس من أكتوبر والجيزة."
      : "Create a teacher profile on Zads, share your subjects, and connect with learners in 6th of October and Giza.",
    alternates: {
      canonical: path,
      languages: {
        ar: "/ar/public/join-teacher",
        en: "/en/public/join-teacher",
      },
    },
  };
}

export default function JoinTeacherPage() {
  return <JoinTeacherContent />;
}
