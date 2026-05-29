import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

// Routes that require authentication and a specific role
const PROTECTED: Array<{ pattern: RegExp; role: string | string[] }> = [
  { pattern: /^\/[^/]+\/client(\/.*)?$/, role: "parent" },   // API enum: parent = client/learner
  { pattern: /^\/[^/]+\/teacher(\/.*)?$/, role: "teacher" },
  { pattern: /^\/[^/]+\/admin(\/.*)?$/, role: "admin" },
];

// Auth routes: redirect to role home if already authenticated
const AUTH_PATHS = /^\/[^/]+\/auth\/(login|register|forgot-password)(\/.*)?$/;

function getRoleHome(locale: string, userType: string): string {
  if (userType === "parent") return `/${locale}/client/client`;
  if (userType === "teacher") return `/${locale}/teacher/teacher`;
  if (userType === "admin") return `/${locale}/admin/admin`;
  return `/${locale}/public`;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Next.js internals and static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    /\.(.*)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Extract locale from path (first segment)
  const locale = pathname.split("/")[1] || routing.defaultLocale;

  if (routing.locales.includes(locale as "en" | "ar") && pathname === `/${locale}`) {
    return NextResponse.redirect(new URL(`/${locale}/public`, request.url));
  }

  // Decode JWT from NextAuth session cookie (Edge-compatible, no CASL)
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  // If on an auth page and already logged in → redirect to role home
  if (AUTH_PATHS.test(pathname) && token?.userType) {
    const home = getRoleHome(locale, token.userType as string);
    return NextResponse.redirect(new URL(home, request.url));
  }

  // Check protected routes
  for (const { pattern, role } of PROTECTED) {
    if (pattern.test(pathname)) {
      if (!token) {
        const loginUrl = new URL(`/${locale}/auth/login`, request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }

      const roles = Array.isArray(role) ? role : [role];
      if (!roles.includes(token.userType as string)) {
        // Wrong role → redirect to their own home
        const home = getRoleHome(locale, token.userType as string);
        return NextResponse.redirect(new URL(home, request.url));
      }
    }
  }

  // Legacy /parent/* → /client/* redirect
  if (/^\/[^/]+\/parent(\/.*)?$/.test(pathname)) {
    const newPath = pathname.replace(/\/parent/, "/client/client");
    return NextResponse.redirect(new URL(newPath, request.url), 301);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match all paths except Next.js internals and static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
