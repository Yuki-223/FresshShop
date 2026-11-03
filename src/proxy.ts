import { NextResponse, type NextRequest } from "next/server"
import { LOCALE_COOKIE, defaultLocale, isLocale, type Locale } from "@/i18n/config"

/** Pick a locale: explicit choice (cookie) → default (English for this catalog). */
function pickLocale(request: NextRequest): Locale {
  const fromCookie = request.cookies.get(LOCALE_COOKIE)?.value
  return isLocale(fromCookie) ? fromCookie : defaultLocale
}

/** Every page lives under /zh or /en. Requests without a locale prefix are redirected. */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  if (isLocale(pathname.split("/")[1])) return

  const locale = pickLocale(request)
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`
  url.search = search
  return NextResponse.redirect(url)
}

export const config = {
  // skip Next internals and files with an extension (favicon.ico, images, …)
  matcher: ["/((?!_next|.*\\..*).*)"],
}
