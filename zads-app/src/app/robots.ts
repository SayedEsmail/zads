import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://zads.app";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/ar/public/", "/en/public/", "/ar/public/teachers/", "/en/public/teachers/"],
      disallow: ["/api/", "/*/client/", "/*/teacher/", "/*/admin/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
