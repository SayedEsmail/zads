import type { Metadata } from "next";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  const path = `/${locale}/public/about`;

  return {
    title: isAr ? "من نحن | زاد" : "About Us | Zads",
    description: isAr
      ? "تعرّف على منصة زاد لربط المعلّمين والمتعلّمين في السادس من أكتوبر والجيزة."
      : "Learn about Zads — connecting teachers and learners in 6th of October and Giza.",
    alternates: {
      canonical: path,
      languages: { ar: "/ar/public/about", en: "/en/public/about" },
    },
  };
}

export default function AboutLayout({ children }: Props) {
  return children;
}
