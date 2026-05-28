import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Allow images from API server
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
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
