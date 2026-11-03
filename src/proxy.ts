import { NextResponse, type NextRequest } from "next/server"
import { LOCALE_COOKIE, defaultLocale, isLocale, locales, type Locale } from "@/i18n/config"

/** Pick a locale: explicit choice (cookie) → browser Accept-Language → default. */
function pickLocale(request: NextRequest): Locale {
  const fromCookie = request.cookies.get(LOCALE_COOKIE)?.value
  if (isLocale(fromCookie)) return fromCookie

  const header = request.headers.get("accept-language") ?? ""
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=")
      return { lang: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 }
    })
    .sort((a, b) => b.q - a.q)
  return ranked.map((r) => r.lang).find((l): l is Locale => (locales as readonly string[]).includes(l)) ?? defaultLocale
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
