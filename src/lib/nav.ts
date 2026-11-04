import type { NavItem } from "@/components/layout/vc-header/types"
import type { Locale } from "@/i18n/config"
import type { Translator } from "@/i18n/dictionary"
import { catalog } from "@/lib/data/metagenics"
import { categoryZh, formZh, navGroups } from "@/lib/data/metagenics/groups"

/**
 * The header menu (Vitacost-style). Built from the local catalog — the store's taxonomy —
 * so the header can be prerendered; every link is a catalog URL that exists.
 */
export function buildNav(locale: Locale, t: Translator): NavItem[] {
  const products = catalog.products
  const categoryName = (slug: string) => (locale === "zh" ? categoryZh[slug] : undefined) ?? catalog.categories.find((c) => c.slug === slug)?.name ?? slug
  const count = (pred: (p: (typeof products)[number]) => boolean) => products.filter(pred).length
  const all = "/category/all"

  const lines = [...new Set(products.map((p) => p.productLine).filter((l): l is string => !!l))].sort((a, b) => a.localeCompare(b))
  const form = (f: string) => ({ label: locale === "zh" ? (formZh[f] ?? f) : f, href: `${all}?form=${encodeURIComponent(f)}`, count: count((p) => p.form === f) })
  const formGroups: [string, string[]][] = [
    [t("nav.formsSwallow"), ["Tablets", "Capsules", "Softgels"]],
    [t("nav.formsMix"), ["Powders", "Chewables", "Bars"]],
    [t("nav.formsPacks"), ["Packets", "Programs", "Bundles"]],
  ]

  return [
    {
      label: t("nav.categories"),
      href: all,
      menu: {
        type: "sidebar",
        panels: navGroups.map((g) => ({
          label: g.name[locale],
          href: `/category/${g.slug}`,
          heading: g.name[locale],
          shopAll: `/category/${g.slug}`,
          links: g.categories.map((c) => ({
            label: categoryName(c),
            href: `/category/${g.slug}?sub=${encodeURIComponent(c)}`,
            count: count((p) => p.categories.includes(c)),
          })),
        })),
      },
    },
    {
      label: t("nav.productLines"),
      href: all,
      menu: {
        type: "condensed",
        width: 240,
        links: lines.map((l) => ({ label: l, href: `${all}?brand=${encodeURIComponent(l)}`, count: count((p) => p.productLine === l) })),
      },
    },
    {
      label: t("nav.shopByForm"),
      href: all,
      menu: {
        type: "columns",
        groups: formGroups.map(([title, forms]) => ({ title, links: forms.filter((f) => products.some((p) => p.form === f)).map(form) })),
      },
    },
    {
      label: t("nav.deals"),
      href: `${all}?subscribe=1`,
      accent: true,
      menu: {
        type: "condensed",
        links: [
          { label: t("nav.dealSubscribe"), href: `${all}?subscribe=1`, count: count((p) => p.variants.some((v) => v.subscriptions.some((s) => s.savePercent > 0))) },
          { label: t("nav.dealBundles"), href: `${all}?bundle=1`, count: count((p) => p.isBundle) },
          { label: t("nav.dealAll"), href: all, count: products.length },
        ],
      },
    },
    { label: t("nav.topRated"), href: `${all}?sort=rating` },
    { label: t("nav.bestSellers"), href: `${all}?sort=popular` },
  ]
}
