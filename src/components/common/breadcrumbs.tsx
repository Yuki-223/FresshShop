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

/** `tone="link"`: vitacost.com style (13px blue links separated by "›"), used on the product page. */
export async function Breadcrumbs({ items, tone = "default" }: { items: Crumb[]; tone?: "default" | "link" }) {
  const { t } = await getI18n()
  const link = tone === "link"
  const all: Crumb[] = [{ label: t("common.homepage"), href: "/" }, ...items]
  return (
    <Breadcrumb className="py-4">
      <BreadcrumbList className={link ? "gap-1.5 text-[13px] tracking-[0.6px] sm:gap-1.5" : "gap-1.5 text-xs sm:gap-1.5"}>
        {all.map((c, i) => (
          <Fragment key={`${i}-${c.label}`}>
            {i > 0 && <BreadcrumbSeparator className="text-ink-muted">{link ? "›" : "/"}</BreadcrumbSeparator>}
            <BreadcrumbItem>
              {c.href && i < all.length - 1 ? (
                <BreadcrumbLink render={<Link href={c.href} />} className={link ? "text-[#276cbc] hover:underline" : "text-ink-muted hover:text-brand"}>
                  {c.label}
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className={link ? "text-[#121212]/65" : "text-ink"}>{c.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
