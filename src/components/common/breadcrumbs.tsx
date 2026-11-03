import { Fragment } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Link } from "@/i18n/navigation"
import { getI18n } from "@/i18n/server"

export interface Crumb {
  label: string
  href?: string
}

export async function Breadcrumbs({ items }: { items: Crumb[] }) {
  const { t } = await getI18n()
  const all: Crumb[] = [{ label: t("common.homepage"), href: "/" }, ...items]
  return (
    <Breadcrumb className="py-4">
      <BreadcrumbList className="gap-1.5 text-xs sm:gap-1.5">
        {all.map((c, i) => (
          <Fragment key={`${i}-${c.label}`}>
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
