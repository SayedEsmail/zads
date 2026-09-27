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
  const path = `/${locale}/public/contact`;

  return {
    title: isAr ? "تواصل معنا | زاد" : "Contact Us | Zads",
    description: isAr
      ? "تواصل مع فريق زاد للاستفسارات عن المعلّمين أو الحسابات أو الدعم."
      : "Contact the Zads team about teachers, accounts, or support.",
    alternates: {
      canonical: path,
      languages: { ar: "/ar/public/contact", en: "/en/public/contact" },
    },
  };
}

export default function ContactLayout({ children }: Props) {
  return children;
}
