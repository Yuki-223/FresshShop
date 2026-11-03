"use client"

import { ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useT } from "@/i18n/client"
import { Link, usePathname } from "@/i18n/navigation"
import { cn } from "@/lib/utils"
import type { Category } from "@/types"

/** Highlights the active category; must sit inside <Suspense> (reads the request pathname). */
export function MainNav({ categories }: { categories: Category[] }) {
  return <MainNavBase categories={categories} pathname={usePathname()} />
}

/** Pathname-agnostic version — used as the static-shell fallback. */
export function MainNavBase({ categories, pathname }: { categories: Category[]; pathname: string | null }) {
  const t = useT()
  return (
    <nav aria-label={t("header.categoriesNav")} className="bg-surface">
      <ul className="container-page flex h-[52px] items-center justify-between gap-6">
        {categories.map((c) => {
          const active = pathname === `/category/${c.slug}`
          return (
            <li key={c.slug}>
              <DropdownMenu>
                <DropdownMenuTrigger
                  openOnHover
                  delay={80}
                  className={cn(
                    "flex items-center gap-1 font-heading text-[15px] font-medium whitespace-nowrap text-ink outline-none hover:text-brand data-popup-open:text-brand",
                    active && "text-brand",
                  )}
                >
                  {c.name}
                  <ChevronDown className="size-3.5 text-brand" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-48">
                  <DropdownMenuItem render={<Link href={`/category/${c.slug}`} />} className="font-heading font-semibold">
                    {t("header.allOf", { name: c.name })}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {c.subcategories.map((sub) => (
                    <DropdownMenuItem key={sub.value} render={<Link href={`/category/${c.slug}?sub=${encodeURIComponent(sub.value)}`} />}>
                      {sub.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
