import { Suspense } from "react"
import { UserRound } from "lucide-react"
import { CartButton } from "@/components/cart/cart-drawer"
import { LanguageSwitcher, LanguageSwitcherFallback } from "@/components/layout/language-switcher"
import { MainNav, MainNavBase } from "@/components/layout/main-nav"
import { SearchBar } from "@/components/layout/search-bar"
import { Link } from "@/i18n/navigation"
import { getI18n } from "@/i18n/server"
import { listCategories } from "@/lib/api"

async function TopBar() {
  const { t, locale } = await getI18n()
  return (
    <div className="container-page">
      <div className="flex h-11 items-center justify-between border-b border-surface-2 text-xs">
        <div className="flex items-center gap-10">
          <a href="#chat" className="text-brand hover:underline">
            {t("header.chatWithUs")}
          </a>
          <a href={locale === "zh" ? "tel:4008001234" : "tel:+420336775664"} className="text-ink">
            {locale === "zh" ? "400-800-1234" : "+420 336 775 664"}
          </a>
          <a href="mailto:info@freshnesecom.com" className="text-ink">
            info@freshnesecom.com
          </a>
        </div>
        <div className="flex items-center gap-10 text-brand">
          <Link href="/blog" className="hover:underline">
            {t("header.blog")}
          </Link>
          <Link href="/about" className="hover:underline">
            {t("header.aboutUs")}
          </Link>
          <Link href="/careers" className="hover:underline">
            {t("header.careers")}
          </Link>
          <Suspense fallback={<LanguageSwitcherFallback />}>
            <LanguageSwitcher />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export function Logo() {
  return (
    <Link href="/" className="font-heading text-[26px] font-semibold tracking-tight text-ink">
      Freshnesecom
    </Link>
  )
}

export async function SiteHeader() {
  const { t, locale } = await getI18n()
  const categories = await listCategories(locale)
  return (
    <header>
      <TopBar />
      <div className="container-page flex h-[104px] items-center justify-between">
        <Logo />
        <Suspense fallback={<div className="h-11 w-[420px] rounded-xl border border-line bg-surface" />}>
          <SearchBar categories={categories} />
        </Suspense>
        <div className="flex items-center gap-8">
          <Link href="/account" aria-label={t("header.account")} className="grid size-10 place-items-center rounded-lg text-ink hover:bg-surface">
            <UserRound className="size-6" strokeWidth={1.75} />
          </Link>
          <CartButton />
        </div>
      </div>
      <Suspense fallback={<MainNavBase categories={categories} pathname={null} />}>
        <MainNav categories={categories} />
      </Suspense>
    </header>
  )
}
