import Link from "next/link"
import { TagChip } from "@/components/common/pills"
import { productTags } from "@/lib/data/categories"

const columns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Get in touch",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Press Releases", href: "/press" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Connections",
    links: ["Facebook", "Twitter", "Instagram", "Youtube", "LinkedIn"].map((l) => ({
      label: l,
      href: `https://www.${l.toLowerCase()}.com`,
    })),
  },
  {
    title: "Earnings",
    links: [
      { label: "Become an Affiliate", href: "/affiliate" },
      { label: "Advertise your product", href: "/advertise" },
      { label: "Sell on Market", href: "/sell" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Your account", href: "/account" },
      { label: "Returns Centre", href: "/returns" },
      { label: "100 % purchase protection", href: "/protection" },
      { label: "Chat with us", href: "#chat" },
      { label: "Help", href: "/help" },
    ],
  },
]

export function Copyright({ owner = "petrbilek.com" }: { owner?: string }) {
  return <p className="py-12 text-sm text-ink">Copyright © 2020 {owner}</p>
}

export function SiteFooter() {
  return (
    <footer className="container-page mt-24">
      <div className="grid grid-cols-4 gap-8">
        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="mb-4 text-lg font-medium text-ink">{col.title}</h3>
            <ul className="space-y-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-brand hover:text-brand-dark hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-12">
        <h3 className="mb-4 text-lg font-medium text-ink">Product tags</h3>
        <div className="flex flex-wrap gap-x-4 gap-y-3">
          {productTags.map((t) => (
            <TagChip key={t} href={`/category/all?q=${encodeURIComponent(t)}`}>
              {t}
            </TagChip>
          ))}
        </div>
      </div>
      <Copyright />
    </footer>
  )
}
