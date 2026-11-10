import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "padhoorion-vintage-paper-secret-token-key-2025"
);

const COOKIE_NAME = "padho_session";

// Public web routes accessible without login
const PUBLIC_PAGE_ROUTES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/verify",
];

// Public API routes accessible without login
const PUBLIC_API_PREFIXES = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/forgot-password",
  "/api/auth/verify",
  "/api/auth/reset-password",
  "/api/announcements/active",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static assets, images, next internal scripts
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/uploads") ||
    pathname === "/favicon.ico" ||
    pathname === "/logo.png" ||
    pathname === "/icon.png"
  ) {
    return NextResponse.next();
  }

  // Check auth session token
  const token = request.cookies.get(COOKIE_NAME)?.value;
  let isAuthenticated = false;

  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  // Redirect logged-in users away from auth pages to home dashboard
  if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Allow public landing page and auth pages
  const isPublicPage = PUBLIC_PAGE_ROUTES.includes(pathname);
  const isPublicApi = PUBLIC_API_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isPublicPage || isPublicApi) {
    return NextResponse.next();
  }

  // Block unauthenticated access to the entire rest of the website
  if (!isAuthenticated) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Access denied. You must be logged in to access PadhoOrion resources." },
        { status: 401 }
      );
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

