import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

const ALLOWED_REDIRECT_ROUTES = [
  "/dashboard",
  "/feedbacks",
  "/hospital-management",
  "/profile",
  "/settings",
];

const AUTH_ROUTES = [
  "/activate-account",
  "/email-verified",
  "/forgot-password",
  "/reset-password",
  "/sign-in",
  "/two-factor",
  "/verify-email",
];

const canRedirect = (path: string): boolean => {
  const pathname = path.split("?")[0];

  if (
    pathname.startsWith("http://") ||
    pathname.startsWith("https://") ||
    pathname.startsWith("//")
  ) {
    return false;
  }

  return ALLOWED_REDIRECT_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
};

const isPublicRoute = (pathname: string): boolean => {
  if (
    pathname === "/" ||
    pathname === "/survey" ||
    pathname === "/follow-up"
  ) {
    return true;
  }

  // Expression régulière pour /[departmentId]/survey (ex: /cardio/survey, /urgences/survey)
  if (/^\/[^/]+\/survey\/?$/.test(pathname)) {
    return true;
  }

  return false;
};

const isAuthRoute = (pathname: string): boolean => {
  return AUTH_ROUTES.includes(pathname);
};

export async function proxy(request: NextRequest) {
  const { nextUrl, headers } = request;
  const session = await auth.api.getSession({ headers });

  const isLoggedIn = !!session?.user;
  const pathname = nextUrl.pathname;
  const searchParams = nextUrl.search;
  const fullPath = pathname + searchParams;

  // 1. Utilisateur non connecté tentant d'accéder à une route privée -> Rediriger vers /sign-in
  if (!isLoggedIn && !isPublicRoute(pathname) && !isAuthRoute(pathname)) {
    const redirectUrl = new URL("/sign-in", request.url);

    if (canRedirect(fullPath)) {
      redirectUrl.searchParams.set("callback", fullPath);
    }

    return NextResponse.redirect(redirectUrl);
  }

  // 2. Utilisateur connecté accédant à une route d'authentification (/sign-in ou /forgot-password)
  if (isLoggedIn && isAuthRoute(pathname)) {
    if (pathname === "/sign-in" || pathname === "/forgot-password") {
      // Priorité 1: paramètre de redirection callback (ex: /sign-in?callback=/settings/users)
      const redirectParam = nextUrl.searchParams.get("callback");
      if (redirectParam && canRedirect(redirectParam)) {
        const response = NextResponse.redirect(
          new URL(redirectParam, request.url),
        );
        response.cookies.delete("last-visited");
        return response;
      }

      // Priorité 2: dernière page consultée via le cookie last-visited
      const lastVisited = request.cookies.get("last-visited")?.value;
      if (lastVisited && canRedirect(lastVisited)) {
        const response = NextResponse.redirect(
          new URL(lastVisited, request.url),
        );
        response.cookies.delete("last-visited");
        return response;
      }

      // Priorité 3 (Défaut): redirection vers /dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Autres routes d'auth (ex: verify-email, email-verified, activate-account) : laisser continuer
    return NextResponse.next();
  }

  // 3. Mettre à jour last-visited uniquement pour les routes protégées
  if (isLoggedIn && !isAuthRoute(pathname) && !isPublicRoute(pathname)) {
    const response = NextResponse.next();
    response.cookies.set("last-visited", fullPath, {
      httpOnly: false,
      secure: process.env.IS_PROD === "true",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)",
  ],
};
