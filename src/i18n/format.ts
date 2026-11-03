import { localeConfig, type Locale } from "@/i18n/config"

const round2 = (n: number) => Math.round(n * 100) / 100

/**
 * Locale-aware formatting. Pure functions, usable on the server and in the browser.
 * All product prices in the app are stored in USD ("base"); `toLocal` converts them
 * into the display currency of the locale, and every money calculation that is shown
 * to the user (cart, checkout) happens in local currency so the numbers add up.
 */
export function createFormatter(locale: Locale) {
  const cfg = localeConfig[locale]
  const money = new Intl.NumberFormat(cfg.intl, { style: "currency", currency: cfg.currency, currencyDisplay: "narrowSymbol" })
  const shortDate = new Intl.DateTimeFormat(cfg.intl, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })

  /** Base (USD) unit price → local unit price, rounded to cents. */
  const toLocal = (base: number) => round2(base * cfg.rate)

  /** Format an amount that is already in local currency. */
  const amount = (local: number, opts: { bare?: boolean } = {}) => {
    if (locale === "en") return opts.bare ? local.toFixed(2) : `${local.toFixed(2)} USD`
    return money.format(local)
  }

  return {
    locale,
    currency: cfg.currency,
    toLocal,
    amount,
    /** Format a base (USD) unit price, optionally multiplied by a quantity. */
    price: (base: number, quantity = 1, opts?: { bare?: boolean }) => amount(round2(toLocal(base) * quantity), opts),
    /** Discount badge text: "- 36 %" (en) or "6.4折" (zh). Empty string when there is no discount. */
    discount: (price: number, oldPrice?: number) => {
      if (!oldPrice || oldPrice <= price) return ""
      const ratio = price / oldPrice
      if (locale === "zh") {
        const fold = Math.round(ratio * 100) / 10
        return `${Number.isInteger(fold) ? fold.toFixed(0) : fold.toFixed(1)}折`
      }
      return `- ${Math.round((1 - ratio) * 100)} %`
    },
    /** Short date: "17. 6. 2020" (en, as in the design) / "2020年6月17日" (zh). */
    date: (iso: string) => {
      if (locale === "en") {
        const d = new Date(iso)
        return `${d.getUTCDate()}. ${d.getUTCMonth() + 1}. ${d.getUTCFullYear()}`
      }
      return shortDate.format(new Date(iso))
    },
    /** Long date: "June 17, 2020" / "2020年6月17日". */
    longDate: (iso: string) => shortDate.format(new Date(iso)),
  }
}

export type Formatter = ReturnType<typeof createFormatter>
