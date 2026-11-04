import { Suspense } from "react"
import { UserRound } from "lucide-react"
import { CartButton } from "@/components/cart/cart-drawer"
import { LanguageSwitcher, LanguageSwitcherFallback } from "@/components/layout/language-switcher"
import { VcHeader } from "@/components/layout/vc-header/vc-header"
import { VcSearch, VcSearchFallback } from "@/components/layout/vc-header/vc-search"
import { Link } from "@/i18n/navigation"
import { getI18n } from "@/i18n/server"
import { buildNav } from "@/lib/nav"

export function Logo() {
  return (
    <Link href="/" className="font-display text-[28px] font-bold tracking-tight text-ink">
      Freshnesecom
    </Link>
  )
}

/** Vitacost-style header: announcement bar, logo + long search + icons, mega-menu navigation. */
export async function SiteHeader() {
  const { t, locale } = await getI18n()
  return (
    <VcHeader
      navItems={buildNav(locale, t)}
      announcement={{ text: t("nav.announcement"), href: "/category/all?subscribe=1", actionLabel: t("nav.help"), actionHref: "/help" }}
      navLabel={t("nav.mainNav")}
      shopAllLabel={t("nav.shopAll")}
      logo={<Logo />}
      search={
        <Suspense fallback={<VcSearchFallback />}>
          <VcSearch />
        </Suspense>
      }
      actions={
        <>
          <Suspense fallback={<LanguageSwitcherFallback />}>
            <LanguageSwitcher className="mr-3 text-xs" />
          </Suspense>
          <Link href="/account" aria-label={t("header.account")} className="vch__icon-btn">
            <UserRound className="size-[22px]" strokeWidth={1.5} />
          </Link>
          <CartButton />
        </>
      }
    />
  )
}
