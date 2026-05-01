import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

// Routes that require authentication and a specific role
const PROTECTED: Array<{ pattern: RegExp; role: string | string[] }> = [
  { pattern: /^\/[^/]+\/client(\/.*)?$/, role: "parent" },   // API enum: parent = client/learner
  { pattern: /^\/[^/]+\/teacher(\/.*)?$/, role: "TEACHER" },
  { pattern: /^\/[^/]+\/admin(\/.*)?$/, role: "ADMIN" },
];

// Auth routes: redirect to role home if already authenticated
const AUTH_PATHS = /^\/[^/]+\/(login|register|forgot-password)(\/.*)?$/;

function getRoleHome(locale: string, userType: string): string {
  if (userType === "parent") return `/${locale}/client`;
  if (userType === "TEACHER") return `/${locale}/teacher`;
  if (userType === "ADMIN") return `/${locale}/admin`;
  return `/${locale}`;
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

  // Decode JWT from NextAuth session cookie (Edge-compatible, no CASL)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
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
        const loginUrl = new URL(`/${locale}/login`, request.url);
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
    const newPath = pathname.replace(/\/parent/, "/client");
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
