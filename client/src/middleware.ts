import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface JwtPayload {
  userId?: string;
  role?: string;
  exp?: number;
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const base64 = token.split(".")[1];
    if (!base64) return null;
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

function isTokenValid(payload: JwtPayload | null): boolean {
  if (!payload?.exp) return false;
  return payload.exp * 1000 > Date.now();
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const decoded = token ? decodeJwtPayload(decodeURIComponent(token)) : null;
  const loggedIn = token ? isTokenValid(decoded) : false;
  const role = decoded?.role;

  const isDashboard = pathname.startsWith("/dashboard");
  const isApply = pathname.startsWith("/apply");

  if ((isDashboard || isApply) && !loggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (loggedIn && role === "borrower" && isDashboard) {
    return NextResponse.redirect(new URL("/apply", request.url));
  }

  if (loggedIn && role && role !== "borrower" && isApply) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/apply", "/apply/:path*"],
};
