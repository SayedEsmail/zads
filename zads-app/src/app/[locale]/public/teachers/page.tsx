import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  const path = `/${locale}/public/teachers`;

  return {
    title: isAr
      ? "دليل المعلّمين — السادس من أكتوبر والجيزة | زاد"
      : "Teachers Directory — 6th of October & Giza | Zads",
    description: isAr
      ? "تصفّح معلّمين حسب المادة والمرحلة والمنطقة في 6 أكتوبر والشيخ زايد والجيزة، وتواصل مباشرة."
      : "Browse teachers by subject, stage, and area in 6th of October, Sheikh Zayed, and Giza — then connect directly.",
    alternates: {
      canonical: path,
      languages: {
        ar: "/ar/public/teachers",
        en: "/en/public/teachers",
      },
    },
  };
}

export { default } from "./TeachersPageClient";
