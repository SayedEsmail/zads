import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import { AttributionTracker } from "@/components/shared/AttributionTracker";
import "../globals.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://zads.education";

  return {
    title: isAr
      ? "زاد — منصة ربط المعلمين والطلاب في السادس من أكتوبر والجيزة"
      : "Zads — Direct Tutor Platform in 6th of October & Giza",
    description: isAr
      ? "منصة تعليمية مباشرة لتسهيل التواصل مع أفضل المعلمين الخصوصيين للحصص المنزلية والأونلاين."
      : "Direct platform connecting parents with verified private tutors for home and online sessions.",
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `/${locale}/public`,
      languages: {
        ar: "/ar/public",
        en: "/en/public",
      },
    },
    openGraph: {
      title: isAr
        ? "زاد — منصة ربط المعلمين والطلاب"
        : "Zads — Direct Tutor Platform",
      description: isAr
        ? "تواصل مباشرة مع معلمين معتمدين لتنسيق الحصص المنزلية والأونلاين."
        : "Connect directly with verified tutors for home and online sessions.",
      locale: isAr ? "ar_EG" : "en_US",
      type: "website",
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Locale = (typeof routing.locales)[number];

const DIR_MAP: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  ar: "rtl",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();
  const dir = DIR_MAP[locale as Locale] ?? "ltr";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased" suppressHydrationWarning>
        <SessionProvider>
          <NextIntlClientProvider messages={messages}>
            {children}
            <AttributionTracker />
            <Toaster />
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
