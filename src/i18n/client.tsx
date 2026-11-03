"use client"

import { createContext, useContext, useMemo, type ReactNode } from "react"
import { localizeHref, type Locale } from "@/i18n/config"
import { createTranslator, type Dictionary } from "@/i18n/dictionary"
import { createFormatter } from "@/i18n/format"

function build(locale: Locale, dictionary: Dictionary) {
  return {
    locale,
    t: createTranslator(dictionary),
    fmt: createFormatter(locale),
    href: (path: string) => localizeHref(path, locale),
  }
}

type I18n = ReturnType<typeof build>
const I18nContext = createContext<I18n | null>(null)

/** Receives only the current locale's dictionary from the root layout. */
export function I18nProvider({ locale, dictionary, children }: { locale: Locale; dictionary: Dictionary; children: ReactNode }) {
  const value = useMemo(() => build(locale, dictionary), [locale, dictionary])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>")
  return ctx
}

export const useT = () => useI18n().t
export const useFormat = () => useI18n().fmt
export const useLocale = () => useI18n().locale
