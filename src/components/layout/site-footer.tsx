import { TagChip } from "@/components/common/pills"
import { Link } from "@/i18n/navigation"
import { getI18n } from "@/i18n/server"
import { listProductTags } from "@/lib/api"
import type { MessageKey } from "@/i18n/dictionary"

const columns: { title: MessageKey; links: { label: MessageKey | string; href: string }[] }[] = [
  {
    title: "footer.getInTouch",
    links: [
      { label: "footer.aboutUs", href: "/about" },
      { label: "footer.careers", href: "/careers" },
      { label: "footer.pressReleases", href: "/press" },
      { label: "footer.blog", href: "/blog" },
    ],
  },
  {
    title: "footer.connections",
    // brand names stay untranslated
    links: ["Facebook", "Twitter", "Instagram", "Youtube", "LinkedIn"].map((l) => ({
      label: l,
      href: `https://www.${l.toLowerCase()}.com`,
    })),
  },
  {
    title: "footer.earnings",
    links: [
      { label: "footer.becomeAffiliate", href: "/affiliate" },
      { label: "footer.advertise", href: "/advertise" },
      { label: "footer.sellOnMarket", href: "/sell" },
    ],
  },
  {
    title: "footer.account",
    links: [
      { label: "footer.yourAccount", href: "/account" },
      { label: "footer.returns", href: "/returns" },
      { label: "footer.protection", href: "/protection" },
      { label: "footer.chatWithUs", href: "#chat" },
      { label: "footer.help", href: "/help" },
    ],
  },
]

export async function Copyright({ owner = "petrbilek.com" }: { owner?: string }) {
  const { t } = await getI18n()
  return <p className="py-12 text-sm text-ink">{t("common.copyright", { owner })}</p>
}

export async function SiteFooter() {
  const { t, locale } = await getI18n()
  const tags = await listProductTags(locale)
  const label = (l: string) => (l.startsWith("footer.") ? t(l as MessageKey) : l)
  return (
    <footer className="container-page mt-24">
      <div className="grid grid-cols-4 gap-8">
        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="mb-4 text-lg font-medium text-ink">{t(col.title)}</h3>
            <ul className="space-y-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-brand hover:text-brand-dark hover:underline">
                    {label(l.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-12">
        <h3 className="mb-4 text-lg font-medium text-ink">{t("footer.productTags")}</h3>
        <div className="flex flex-wrap gap-x-4 gap-y-3">
          {tags.map((tag) => (
            <TagChip key={tag.value} href={`/category/all?q=${encodeURIComponent(tag.label)}`}>
              {tag.label}
            </TagChip>
          ))}
        </div>
      </div>
      <Copyright />
    </footer>
  )
}
