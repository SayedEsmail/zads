import type { Metadata } from "next";
import { Suspense } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import { AttributionTracker } from "@/components/shared/AttributionTracker";
import { GoogleAnalytics } from "@/components/shared/GoogleAnalytics";
import { PushNotificationRegistrar } from "@/components/shared/PushNotificationRegistrar";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";
import "../globals.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://zads.app";

  return {
    title: isAr
      ? "زاد — منصة ربط المعلمين والمتعلمين في السادس من أكتوبر والجيزة"
      : "Zads — A Platform Connecting Teachers and Learners",
    description: isAr
      ? "منصة تساعد المعلمين والمتعلمين على اكتشاف بعضهم والتواصل لتنسيق فرص التعلم."
      : "A platform where teachers and learners can find each other and coordinate learning directly.",
    metadataBase: new URL(baseUrl),
    alternates: {
      languages: {
        ar: "/ar/public",
        en: "/en/public",
      },
    },
    openGraph: {
      title: isAr
        ? "زاد — منصة ربط المعلمين والمتعلمين"
        : "Zads — Connecting Teachers and Learners",
      description: isAr
        ? "اكتشف المعلمين والمتعلمين وتواصل معهم لتنسيق فرص التعلم."
        : "Find teachers and learners, then connect to coordinate learning.",
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
        {GA_MEASUREMENT_ID ? (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  window.gtag = gtag;
                  gtag('js', new Date());
                  gtag('config', '${GA_MEASUREMENT_ID}');
                `,
              }}
            />
          </>
        ) : null}
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased" suppressHydrationWarning>
        <SessionProvider basePath="/api/nextauth">
          <NextIntlClientProvider messages={messages}>
            {children}
            <Suspense fallback={null}>
              <GoogleAnalytics />
            </Suspense>
            <AttributionTracker />
            <PushNotificationRegistrar />
            <Toaster />
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
