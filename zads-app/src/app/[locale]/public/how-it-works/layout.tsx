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
  const path = `/${locale}/public/how-it-works`;

  return {
    title: isAr ? "كيف تعمل زاد | ربط معلّمين ومتعلّمين" : "How Zads Works",
    description: isAr
      ? "اكتشف كيف تربط زاد بين المعلّمين والمتعلّمين للتواصل وتنسيق فرص التعلّم."
      : "See how Zads connects teachers and learners so they can communicate and coordinate learning.",
    alternates: {
      canonical: path,
      languages: { ar: "/ar/public/how-it-works", en: "/en/public/how-it-works" },
    },
  };
}

export default function HowItWorksLayout({ children }: Props) {
  return children;
}
