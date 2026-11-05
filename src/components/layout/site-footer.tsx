import { Link } from "@/i18n/navigation"
import { getI18n } from "@/i18n/server"
import type { MessageKey } from "@/i18n/dictionary"
import { EMAIL_ICON, PAYMENT_ICONS } from "./payment-icons"

/**
 * Footer laid out like vitacost.com (measured at 1440px): #eeefee band, Helvetica throughout,
 * three link columns 40px apart (18px bold headings, 14px links on a 28.8px rhythm), an
 * "Email us anytime" entry behind a divider on the right, a centred row of policy links
 * separated by light "I" marks, then payment icons and the supplement disclaimer.
 * Links without real content go to the info-page template (src/lib/data/pages.ts).
 */
const columns: { title: MessageKey; links: { label: MessageKey; href: string }[] }[] = [
  {
    title: "footer.customerService",
    links: [
      { label: "footer.trackOrder", href: "/track-order" },
      { label: "footer.refundPolicy", href: "/refund-policy" },
      { label: "footer.domesticShipping", href: "/shipping" },
      { label: "footer.promoExclusions", href: "/promo-exclusions" },
      { label: "footer.contactUs", href: "/contact" },
    ],
  },
  {
    title: "footer.myAccount",
    links: [
      { label: "footer.accountLogin", href: "/account" },
      { label: "footer.orderHistory", href: "/orders" },
      { label: "footer.serviceUpdates", href: "/service-updates" },
      { label: "footer.privacyChoices", href: "/privacy-choices" },
      { label: "footer.doNotSell", href: "/do-not-sell" },
    ],
  },
  {
    title: "footer.wayToShop",
    links: [
      { label: "footer.shopByBrand", href: "/brands" },
      { label: "footer.shopByCategory", href: "/category/all" },
      { label: "footer.siteMap", href: "/site-map" },
      { label: "footer.aboutUs", href: "/about" },
    ],
  },
]

const policies: { label: MessageKey; href: string }[] = [
  { label: "footer.privacyPolicy", href: "/privacy" },
  { label: "footer.termsOfUse", href: "/terms" },
  { label: "footer.refundPolicy", href: "/refund-policy" },
  { label: "footer.privacyChoices", href: "/privacy-choices" },
]

/** Checkout keeps its reduced footer (design: "Copyright © 2020 Freshnesecom" only). */
export async function Copyright({ owner = "petrbilek.com" }: { owner?: string }) {
  const { t } = await getI18n()
  return <p className="py-12 text-sm text-ink">{t("common.copyright", { owner })}</p>
}

export async function SiteFooter() {
  const { t } = await getI18n()
  return (
    <footer className="mt-12 bg-[#eeefee] pt-[60px] pb-7 font-sans tracking-[0.6px] text-[rgba(18,18,18,0.75)]">
      <div className="container-page">
        <div className="flex items-start">
          <div className="flex gap-10">
            {columns.map((col) => (
              <nav key={col.title} aria-label={t(col.title)}>
                <h2 className="font-sans text-lg leading-[23.4px] font-bold text-[#121212]">{t(col.title)}</h2>
                <ul className="mt-[5px] flex flex-col gap-[10.6px]">
                  {col.links.map((l) => (
                    <li key={l.href} className="text-sm leading-[18.2px]">
                      <Link href={l.href} className="text-sm leading-[18.2px] hover:text-[#121212] hover:underline">
                        {t(l.label)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
          <div className="mt-[-20px] ml-auto w-[319px] border-l border-[rgba(18,18,18,0.15)] pl-[30px]">
            <Link href="/contact" className="inline-flex items-center gap-[11px] text-[13px] leading-[19.5px] font-bold hover:text-[#121212] hover:underline">
              <span className="text-brand" dangerouslySetInnerHTML={{ __html: EMAIL_ICON }} />
              {t("footer.emailUs")}
            </Link>
          </div>
        </div>

        <ul className="mt-7 flex justify-center text-[13px] leading-[23.4px]">
          {policies.map((l, i) => (
            <li key={l.label} className="flex items-center leading-[25.2px]">
              {i > 0 && (
                <span aria-hidden="true" className="mx-3 text-[rgba(18,18,18,0.4)]">
                  I
                </span>
              )}
              <Link href={l.href} className="text-sm leading-[25.2px] text-[#121212] hover:underline">
                {t(l.label)}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-16 border-t border-[rgba(18,18,18,0.08)] pt-[46px]">
        <ul className="flex justify-center gap-[10px]" aria-label={t("footer.paymentMethods")}>
          {PAYMENT_ICONS.map((icon) => (
            <li key={icon.name} title={icon.name} className="flex" dangerouslySetInnerHTML={{ __html: icon.svg }} />
          ))}
        </ul>
        <p className="mx-auto mt-[13px] w-fit border border-[rgba(18,18,18,0.2)] px-4 py-1.5 text-xs leading-[19.2px] text-[rgba(18,18,18,0.65)]">
          {t("footer.disclaimer")}
        </p>
      </div>
    </footer>
  )
}
