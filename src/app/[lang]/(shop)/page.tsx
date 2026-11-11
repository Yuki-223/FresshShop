import { RecentlyViewed } from "@/components/history/recently-viewed"
import { ExploreCircles } from "@/components/home/explore-circles"
import { VcCarousel } from "@/components/home/vc-carousel/vc-carousel"
import { VcSlideshow } from "@/components/home/vc-slideshow/vc-slideshow"
import { getI18n } from "@/i18n/server"
import { getByCategory, getByProductLine, getMostReviewed, getTopRated, listCategories } from "@/lib/api"
/**
 * Homepage laid out like vitacost.com: hero slideshow, "Explore More" circles, then six
 * full-width product shelves alternating light green and white.
 */
export default async function HomePage() {
  const { t, locale } = await getI18n()
  const [groups, bestSellers, ultraFlora, sports, brain, weight, topRated] = await Promise.all([
    listCategories(locale),
    getMostReviewed(locale, 10),
    getByProductLine("UltraFlora", locale, 10),
    getByCategory("protein-and-sports-nutrition", locale, 10),
    getByCategory("brain-and-cognitive-health", locale, 10),
    getByCategory("weight-management", locale, 10),
    getTopRated(locale, 10),
  ])

  // vitacost.com shelf → ours: Best Sellers, a brand's favourites, Sport, NAD+, GLP-1, Trending
  const shelves = [
    { title: t("home.shelfBestSellers"), products: bestSellers, href: "/category/all?sort=popular" },
    { title: t("home.shelfUltraFlora"), products: ultraFlora, href: "/category/all?brand=UltraFlora" },
    { title: t("home.shelfSports"), products: sports, href: "/category/joint-sports?sub=protein-and-sports-nutrition" },
    { title: t("home.shelfBrain"), products: brain, href: "/category/brain-mood-sleep?sub=brain-and-cognitive-health" },
    { title: t("home.shelfWeight"), products: weight, href: "/category/heart-metabolism?sub=weight-management" },
    { title: t("home.shelfTopRated"), products: topRated, href: "/category/all?sort=rating" },
  ]

  return (
    <>
      {/* Slideshow + "Explore More" circles sit close together, as on vitacost.com */}
      <div className="container-page space-y-3 pt-4">
        {/* Hero slideshow (Vitacost banners; the offers they show — OCT26DAILY, free shipping over $30 — exist in the backend) */}
        <VcSlideshow
          slides={[
            { id: "probiotics", image: "/banners/probiotics.jpg", alt: t("home.slideProbiotics"), href: "/category/gut-detox?sub=digestion-and-probiotics" },
            { id: "supplement-sale", image: "/banners/supplement-sale.jpg", alt: t("home.slideSale"), href: "/category/all?sort=popular" },
            { id: "free-shipping", image: "/banners/free-shipping.jpg", alt: t("home.slideFreeShipping"), href: "/category/all" },
          ]}
        />
        <ExploreCircles
          title={t("home.exploreMore")}
          items={[
            ...(["vitamins-wellness", "joint-sports", "gut-detox", "women-men-kids", "brain-mood-sleep"] as const).map((slug) => ({
              image: `/circles/${slug}.jpg`,
              label: groups.find((g) => g.slug === slug)!.name,
              href: `/category/${slug}`,
            })),
            { image: "/circles/deals.jpg", label: t("home.seeAllDeals"), href: "/category/all?subscribe=1" },
          ]}
        />
      </div>

      {/* Six full-width shelves, green first */}
      <div className="mt-12">
        {shelves.map((s, i) => (
          <VcCarousel key={s.href} title={s.title} products={s.products} shopAllHref={s.href} green={i % 2 === 0} />
        ))}
        {/* the visitor's own "Recently viewed" (hidden until something was viewed); green continues the alternation */}
        <RecentlyViewed green={shelves.length % 2 === 0} />
      </div>
    </>
  )
}
