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
  const path = `/${locale}/public/privacy`;

  return {
    title: isAr ? "سياسة الخصوصية | زاد" : "Privacy Policy | Zads",
    description: isAr
      ? "كيف تتعامل زاد مع بياناتك وخصوصيتك على المنصة."
      : "How Zads handles your data and privacy on the platform.",
    alternates: {
      canonical: path,
      languages: { ar: "/ar/public/privacy", en: "/en/public/privacy" },
    },
  };
}

export default function PrivacyLayout({ children }: Props) {
  return children;
}
