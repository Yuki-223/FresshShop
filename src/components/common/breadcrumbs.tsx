import Link from "next/link"
import { Fragment } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export interface Crumb {
  label: string
  href?: string
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all: Crumb[] = [{ label: "Homepage", href: "/" }, ...items]
  return (
    <Breadcrumb className="py-4">
      <BreadcrumbList className="gap-1.5 text-xs sm:gap-1.5">
        {all.map((c, i) => (
          <Fragment key={c.label}>
            {i > 0 && <BreadcrumbSeparator className="text-ink-muted">/</BreadcrumbSeparator>}
            <BreadcrumbItem>
              {c.href && i < all.length - 1 ? (
                <BreadcrumbLink render={<Link href={c.href} />} className="text-ink-muted hover:text-brand">
                  {c.label}
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="text-ink">{c.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
