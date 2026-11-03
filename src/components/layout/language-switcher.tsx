"use client"

import NextLink from "next/link"
import { Globe } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { LOCALE_COOKIE, localeConfig, localizeHref, locales } from "@/i18n/config"
import { useI18n } from "@/i18n/client"
import { usePathname } from "@/i18n/navigation"
import { cn } from "@/lib/utils"

/** "中文 | EN" toggle. Keeps the current page and filters; remembers the choice in a cookie. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, t } = useI18n()
  const pathname = usePathname()
  const params = new URLSearchParams(useSearchParams().toString())
  // price bounds are in the display currency, so they don't carry over to the other language
  params.delete("min")
  params.delete("max")
  const qs = params.toString()

  return (
    <div className={cn("flex items-center gap-1.5", className)} aria-label={t("header.switchLanguage")} role="group">
      <Globe className="size-3.5 text-brand" />
      {locales.map((l, i) => (
        <span key={l} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-line">|</span>}
          {l === locale ? (
            <span aria-current="true" className="font-semibold text-ink">
              {localeConfig[l].label}
            </span>
          ) : (
            <NextLink
              href={`${localizeHref(pathname, l)}${qs ? `?${qs}` : ""}`}
              hrefLang={localeConfig[l].intl}
              onClick={() => {
                document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`
              }}
              className="text-brand hover:underline"
            >
              {localeConfig[l].label}
            </NextLink>
          )}
        </span>
      ))}
    </div>
  )
}

/** Static fallback rendered in the prerendered shell (no search params yet). */
export function LanguageSwitcherFallback() {
  const { locale } = useI18n()
  return <span className="text-xs font-semibold text-ink">{localeConfig[locale].label}</span>
}
