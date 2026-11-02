"use client"

import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { usePathname } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { Category } from "@/types"

/** Highlights the active category; must sit inside <Suspense> (reads the request pathname). */
export function MainNav({ categories }: { categories: Category[] }) {
  return <MainNavBase categories={categories} pathname={usePathname()} />
}

/** Pathname-agnostic version — used as the static-shell fallback. */
export function MainNavBase({ categories, pathname }: { categories: Category[]; pathname: string | null }) {
  return (
    <nav aria-label="Categories" className="bg-surface">
      <ul className="container-page flex h-[52px] items-center gap-10">
        {categories.map((c) => {
          const active = pathname === `/category/${c.slug}`
          return (
            <li key={c.slug}>
              <DropdownMenu>
                <DropdownMenuTrigger
                  openOnHover
                  delay={80}
                  className={cn(
                    "flex items-center gap-1 font-heading text-[15px] font-medium text-ink outline-none hover:text-brand data-popup-open:text-brand",
                    active && "text-brand",
                  )}
                >
                  {c.name}
                  <ChevronDown className="size-3.5 text-brand" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-48">
                  <DropdownMenuItem render={<Link href={`/category/${c.slug}`} />} className="font-heading font-semibold">
                    All {c.name.toLowerCase()}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {c.subcategories.map((sub) => (
                    <DropdownMenuItem key={sub} render={<Link href={`/category/${c.slug}?sub=${encodeURIComponent(sub)}`} />}>
                      {sub}
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
