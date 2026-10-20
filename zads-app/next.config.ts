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
        protocol: "http",
        hostname: "127.0.0.1",
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
      {
        source: "/:locale/about",
        destination: "/:locale/public/about",
        permanent: true,
      },
      {
        source: "/:locale/how-it-works",
        destination: "/:locale/public/how-it-works",
        permanent: true,
      },
      // Legacy doubled role homes (/client/client, /teacher/teacher, /admin/admin)
      {
        source: "/:locale/client/client",
        destination: "/:locale/client",
        permanent: true,
      },
      {
        source: "/:locale/client/client/:path*",
        destination: "/:locale/client/:path*",
        permanent: true,
      },
      {
        source: "/:locale/teacher/teacher",
        destination: "/:locale/teacher",
        permanent: true,
      },
      {
        source: "/:locale/teacher/teacher/:path*",
        destination: "/:locale/teacher/:path*",
        permanent: true,
      },
      {
        source: "/:locale/admin/admin",
        destination: "/:locale/admin",
        permanent: true,
      },
      {
        source: "/:locale/admin/admin/:path*",
        destination: "/:locale/admin/:path*",
        permanent: true,
      },
    ];
  },

  // Backend proxy is implemented in src/app/api/[...backend]/route.ts so we can
  // strip upstream Helmet headers and keep dashboard calls same-origin.
};

export default withNextIntl(nextConfig);
