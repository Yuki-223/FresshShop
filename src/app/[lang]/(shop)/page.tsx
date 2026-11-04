import { CountPill } from "@/components/common/pills"
import { LinkListSidebar } from "@/components/common/link-list-sidebar"
import { SectionHeader } from "@/components/common/section-header"
import { VcSlideshow } from "@/components/home/vc-slideshow/vc-slideshow"
import { ProductGrid } from "@/components/product/product-card"
import { Link } from "@/i18n/navigation"
import { getI18n } from "@/i18n/server"
import { getBundles, getByCategory, getMostReviewed, getTopRated, listHealthCategories, listProductTags } from "@/lib/api"

export default async function HomePage() {
  const { t, locale } = await getI18n()
  const [health, mostReviewed, topRated, bundles, sleep, lines] = await Promise.all([
    listHealthCategories(locale),
    getMostReviewed(locale, 3),
    getTopRated(locale, 3),
    getBundles(locale, 4),
    getByCategory("sleep", locale, 4),
    listProductTags(),
  ])
  const healthLink = (value: string) => {
    const h = health.find((x) => x.value === value)!
    return { label: h.label, href: `/category/${h.group}?sub=${encodeURIComponent(h.value)}` }
  }

  return (
    <div className="container-page space-y-32 pt-4">
      {/* Hero slideshow (Vitacost banners; the offers they show — OCT26DAILY, free shipping over $30 — exist in the backend) */}
      <VcSlideshow
        slides={[
          { id: "probiotics", image: "/banners/probiotics.jpg", alt: t("home.slideProbiotics"), href: "/category/gut-detox?sub=digestion-and-probiotics" },
          { id: "supplement-sale", image: "/banners/supplement-sale.jpg", alt: t("home.slideSale"), href: "/category/all?sort=popular" },
          { id: "free-shipping", image: "/banners/free-shipping.jpg", alt: t("home.slideFreeShipping"), href: "/category/all" },
        ]}
      />

      <section className="grid grid-cols-[1fr_3fr] gap-8">
        <LinkListSidebar
          title={t("home.bestSelling")}
          links={["digestion-and-probiotics", "immune-health", "heart-health", "omega-3s-and-fish-oil", "magnesium"].map(healthLink)}
          more={{ label: t("home.moreProducts"), href: "/category/all?sort=popular" }}
        />
        <ProductGrid products={mostReviewed} />
      </section>

      <section className="grid grid-cols-[1fr_3fr] gap-8">
        <LinkListSidebar
          title={t("home.topRated")}
          links={lines.slice(0, 5).map((l) => ({ label: l.label, href: `/category/all?brand=${encodeURIComponent(l.value)}` }))}
          more={{ label: t("home.moreProducts"), href: "/category/all?sort=rating" }}
        />
        <ProductGrid products={topRated} />
      </section>

      <section>
        <SectionHeader title={t("home.healthGoals")} href="/category/all" linkLabel={t("home.moreCategories")} />
        <div className="grid grid-cols-6 gap-4">
          {health
            .filter((h) => h.value !== "bundle-and-save")
            .map((h) => (
              <Link
                key={h.value}
                href={`/category/${h.group}?sub=${encodeURIComponent(h.value)}`}
                className="group flex h-28 flex-col justify-between rounded-xl border border-line bg-card p-4 transition-colors hover:border-brand-light hover:bg-brand-soft"
              >
                <span className="font-heading text-sm font-semibold text-ink group-hover:text-brand-dark">{h.label}</span>
                <CountPill className="w-fit">{t.plural("home.productCount", h.count)}</CountPill>
              </Link>
            ))}
        </div>
      </section>

      <section className="border-t border-surface-2 pt-16">
        <SectionHeader title={t("home.weeklyDeals")} href="/category/bundles" linkLabel={t("home.allDeals")} />
        <ProductGrid products={bundles} columns={4} />
      </section>

      <section>
        <SectionHeader title={t("home.sleepPicks")} href="/category/brain-mood-sleep?sub=sleep" linkLabel={t("home.allSleep")} />
        <ProductGrid products={sleep} columns={4} />
      </section>
    </div>
  )
}
