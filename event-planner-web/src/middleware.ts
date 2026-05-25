import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "./lib/authConstants";

const PUBLIC_PATHS = new Set(["/", "/login", "/register"]);

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (pathname.startsWith("/api/auth/")) return true;
  return false;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasToken = req.cookies.has(AUTH_COOKIE_NAME);

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (!hasToken) {
    const url = req.nextUrl.clone();
    const target = pathname + (req.nextUrl.search || "");
    url.pathname = "/login";
    url.search = `?redirect=${encodeURIComponent(target)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
