export const locales = ["zh", "en"] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = "zh"

/** Cookie that remembers the visitor's explicit language choice (read by proxy.ts). */
export const LOCALE_COOKIE = "NEXT_LOCALE"

export type RegionId = "cn" | "intl"

/**
 * Everything locale-dependent that is not a translated string lives here.
 * Prices are stored in USD (base currency) and converted with `rate` for display.
 */
export const localeConfig = {
  zh: { label: "中文", intl: "zh-CN", currency: "CNY", rate: 7.1, region: "cn" },
  en: { label: "EN", intl: "en-US", currency: "USD", rate: 1, region: "intl" },
} as const satisfies Record<Locale, { label: string; intl: string; currency: string; rate: number; region: RegionId }>

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value)
}

/** Localized text stored in data records. */
export type L10n = Record<Locale, string>

/** Prefix an internal path with the locale. Leaves external, hash and query-only hrefs alone. */
export function localizeHref(href: string, locale: Locale) {
  if (!href.startsWith("/") || href.startsWith("//")) return href
  const first = href.split(/[/?#]/)[1]
  if (isLocale(first)) return href.replace(`/${first}`, `/${locale}`)
  return href === "/" ? `/${locale}` : `/${locale}${href}`
}

/** Remove the locale prefix from a pathname: "/zh/blog" → "/blog". */
export function stripLocale(pathname: string) {
  const first = pathname.split("/")[1]
  if (!isLocale(first)) return pathname
  const rest = pathname.slice(first.length + 1)
  return rest === "" ? "/" : rest
}
