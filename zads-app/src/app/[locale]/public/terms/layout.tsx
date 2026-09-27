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
  const path = `/${locale}/public/terms`;

  return {
    title: isAr ? "الشروط والأحكام | زاد" : "Terms of Service | Zads",
    description: isAr
      ? "شروط استخدام منصة زاد لربط المعلّمين والمتعلّمين."
      : "Terms of use for the Zads teacher–learner connection platform.",
    alternates: {
      canonical: path,
      languages: { ar: "/ar/public/terms", en: "/en/public/terms" },
    },
  };
}

export default function TermsLayout({ children }: Props) {
  return children;
}
