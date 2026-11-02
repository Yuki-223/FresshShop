import Link from "next/link"
import { Suspense } from "react"
import { UserRound } from "lucide-react"
import { CartButton } from "@/components/cart/cart-drawer"
import { MainNav, MainNavBase } from "@/components/layout/main-nav"
import { SearchBar } from "@/components/layout/search-bar"
import { listCategories } from "@/lib/api"

function TopBar() {
  return (
    <div className="container-page">
      <div className="flex h-11 items-center justify-between border-b border-surface-2 text-xs">
        <div className="flex items-center gap-10">
          <a href="#chat" className="text-brand hover:underline">
            Chat with us
          </a>
          <a href="tel:+420336775664" className="text-ink">
            +420 336 775 664
          </a>
          <a href="mailto:info@freshnesecom.com" className="text-ink">
            info@freshnesecom.com
          </a>
        </div>
        <div className="flex items-center gap-10 text-brand">
          <Link href="/blog" className="hover:underline">
            Blog
          </Link>
          <Link href="/about" className="hover:underline">
            About Us
          </Link>
          <Link href="/careers" className="hover:underline">
            Careers
          </Link>
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
  const categories = await listCategories()
  return (
    <header>
      <TopBar />
      <div className="container-page flex h-[104px] items-center justify-between">
        <Logo />
        <Suspense fallback={<div className="h-11 w-[420px] rounded-xl border border-line bg-surface" />}>
          <SearchBar categories={categories} />
        </Suspense>
        <div className="flex items-center gap-8">
          <Link href="/account" aria-label="Account" className="grid size-10 place-items-center rounded-lg text-ink hover:bg-surface">
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
