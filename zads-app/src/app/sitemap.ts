import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://zads.education";
  const locales = ["ar", "en"];
  const publicRoutes = [
    "/public",
    "/public/teachers",
    "/public/join-teacher",
    "/public/about",
    "/public/how-it-works",
    "/public/terms",
    "/public/privacy",
    "/public/contact",
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const route of publicRoutes) {
      entries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route.includes("teachers") ? "daily" : "monthly",
        priority: route === "/public" ? 1.0 : route.includes("teachers") ? 0.9 : 0.6,
      });
    }
  }

  return entries;
}
