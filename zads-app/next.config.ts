import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { fileURLToPath } from "node:url";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  outputFileTracingRoot: fileURLToPath(new URL("./", import.meta.url)),
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

  // Proxy /api/* to the Express backend
  // We exclude NextAuth routes so they hit our local API, but allow /api/auth/profile to proxy to backend
  async rewrites() {
    const apiBase = process.env.API_BASE_URL || "https://api.zads.app";
    return [
      {
        source: "/api/:path((?!auth/(?:callback|csrf|error|providers|session|signin|signout|verify-request)).*)",
        destination: `${apiBase}/api/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
