import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

 
  const isProtectedRoute =
    req.nextUrl.pathname.startsWith("/dashboard");

  // ❌ No tokens → block protected routes
  if (isProtectedRoute && !accessToken && !refreshToken) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in", "/sign-up"],
};