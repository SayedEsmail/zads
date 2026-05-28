import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { fileURLToPath } from "node:url";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  turbopack: {
    root: fileURLToPath(new URL("../", import.meta.url)),
  },
  // Allow images from API server
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "api.zads.app",
        pathname: "/uploads/**",
      },
    ],
  },

  // /parent/* → /client/* redirects (permanent)
  async redirects() {
    return [
      {
        source: "/:locale/parent/:path*",
        destination: "/:locale/client/:path*",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
