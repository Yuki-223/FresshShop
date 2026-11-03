import { BlogCard, BlogFeatureCard, BlogListItem } from "@/components/blog/blog-cards"
import { LinkListSidebar } from "@/components/common/link-list-sidebar"
import { SectionHeader } from "@/components/common/section-header"
import { PromoBanner } from "@/components/home/promo-banner"
import { TestimonialCarousel } from "@/components/home/testimonial-carousel"
import { ProductGrid } from "@/components/product/product-card"
import { getI18n } from "@/i18n/server"
import {
  getBestFromFarmers,
  getBestSelling,
  getFeatured,
  listBlogPosts,
  listCategories,
  listProductTags,
  listTestimonials,
} from "@/lib/api"

const catLink = (slug: string, sub?: string) => `/category/${slug}${sub ? `?sub=${encodeURIComponent(sub)}` : ""}`

export default async function HomePage() {
  const { t, locale } = await getI18n()
  const [categories, bestSelling, farmers, featured, testimonials, blog, tags] = await Promise.all([
    listCategories(locale),
    getBestSelling(locale, 3),
    getBestFromFarmers(locale, 3),
    getFeatured(locale, 4),
    listTestimonials(locale),
    listBlogPosts(locale, { pageSize: 5 }),
    listProductTags(locale),
  ])
  const [featurePost, middlePost, ...sidePosts] = blog.items
  const bySlug = (slug: string) => categories.find((c) => c.slug === slug)!
  const pick = (slugs: string[]) => slugs.map(bySlug).map((c) => ({ label: c.name, href: catLink(c.slug) }))
  const tagLink = (key: string) => {
    const label = tags.find((tg) => tg.value === key)?.label ?? key
    return { label, href: `/category/all?q=${encodeURIComponent(label)}` }
  }
  const meat = bySlug("meat-and-fish")
  const subLink = (value: string) => ({
    label: meat.subcategories.find((s) => s.value === value)?.label ?? value,
    href: catLink("meat-and-fish", value),
  })

  return (
    <div className="container-page space-y-32 pt-16">
      {/* Hero: category menu + promo banners */}
      <section className="grid grid-cols-[1fr_3fr] gap-8">
        <LinkListSidebar
          title={t("home.categoryMenu")}
          links={categories.slice(0, 5).map((c) => ({ label: c.name, href: catLink(c.slug) }))}
          more={{ label: t("home.moreCategories"), href: "/category/all" }}
        />
        <div className="grid grid-cols-2 gap-8">
          <PromoBanner eyebrow={t("home.banner1Eyebrow")} title={t("home.banner1Title")} cta={t("home.banner1Cta")} href="/blog" />
          <PromoBanner
            eyebrow={t("home.banner2Eyebrow")}
            title={t("home.banner2Title")}
            cta={t("home.banner2Cta")}
            href="/category/fruit-and-vegetables?discounted=1"
          />
        </div>
      </section>

      <section className="grid grid-cols-[1fr_3fr] gap-8">
        <LinkListSidebar
          title={t("home.bestSelling")}
          links={pick(["kitchen", "meat-and-fish", "special-nutrition", "pharmacy", "baby"])}
          more={{ label: t("home.moreProducts"), href: "/category/all?sort=popular" }}
        />
        <ProductGrid products={bestSelling} />
      </section>

      <section className="grid grid-cols-[1fr_3fr] gap-8">
        <LinkListSidebar
          title={t("home.bestFromFarmers")}
          links={[tagLink("Carrots"), tagLink("Tomatoes"), tagLink("Fresh food"), subLink("Chicken"), subLink("Pork")]}
          more={{ label: t("home.moreProducts"), href: "/category/fruit-and-vegetables" }}
        />
        <ProductGrid products={farmers} />
      </section>

      <section>
        <SectionHeader title={t("home.customersSay")} href="/about" linkLabel={t("home.readMore")} />
        <TestimonialCarousel items={testimonials} />
      </section>

      <section className="border-t border-surface-2 pt-16">
        <SectionHeader title={t("home.weeklyDeals")} href="/category/all?discounted=1" linkLabel={t("home.allDeals")} />
        <ProductGrid products={featured} columns={4} />
      </section>

      <section>
        <SectionHeader title={t("home.blogPosts")} href="/blog" linkLabel={t("home.goToBlog")} />
        <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-8">
          {featurePost && <BlogFeatureCard post={featurePost} className="min-h-[400px]" />}
          {middlePost && <BlogCard post={middlePost} />}
          <div className="flex flex-col gap-8">
            {sidePosts.map((p) => (
              <BlogListItem key={p.slug} post={p} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
