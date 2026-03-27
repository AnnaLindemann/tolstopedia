import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE_NAME = "admin_auth";
const ADMIN_COOKIE_VALUE = "true";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  const isAdminLoginPage = pathname === "/admin/login";
  const isAdminLoginApi = pathname === "/api/admin/login";

  const isAuthenticated =
    request.cookies.get(ADMIN_COOKIE_NAME)?.value === ADMIN_COOKIE_VALUE;

  if (isAdminPage && !isAdminLoginPage && !isAuthenticated) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (isAdminApi && !isAdminLoginApi && !isAuthenticated) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};