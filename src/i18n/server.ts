import { lang } from "next/root-params"
import { defaultLocale, isLocale, localizeHref, type Locale } from "@/i18n/config"
import { createTranslator } from "@/i18n/dictionary"
import { dictionaries } from "@/i18n/dictionaries"
import { createFormatter } from "@/i18n/format"

/** Current locale for Server Components — read from the `[lang]` root segment, no prop drilling. */
export async function getLocale(): Promise<Locale> {
  const value = await lang()
  return isLocale(value) ? value : defaultLocale
}

/** Translator, formatter and href helper for Server Components. */
export async function getI18n() {
  const locale = await getLocale()
  return {
    locale,
    t: createTranslator(dictionaries[locale]),
    fmt: createFormatter(locale),
    href: (path: string) => localizeHref(path, locale),
  }
}
