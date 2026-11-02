import { BlogCard, BlogFeatureCard, BlogListItem } from "@/components/blog/blog-cards"
import { LinkListSidebar } from "@/components/common/link-list-sidebar"
import { SectionHeader } from "@/components/common/section-header"
import { PromoBanner } from "@/components/home/promo-banner"
import { TestimonialCarousel } from "@/components/home/testimonial-carousel"
import { ProductGrid } from "@/components/product/product-card"
import {
  getBestFromFarmers,
  getBestSelling,
  getFeatured,
  listBlogPosts,
  listCategories,
  listTestimonials,
} from "@/lib/api"

const catLink = (slug: string, sub?: string) => `/category/${slug}${sub ? `?sub=${encodeURIComponent(sub)}` : ""}`

export default async function HomePage() {
  const [categories, bestSelling, farmers, featured, testimonials, blog] = await Promise.all([
    listCategories(),
    getBestSelling(3),
    getBestFromFarmers(3),
    getFeatured(4),
    listTestimonials(),
    listBlogPosts({ pageSize: 5 }),
  ])
  const [featurePost, middlePost, ...sidePosts] = blog.items
  const pick = (slugs: string[]) =>
    slugs.map((s) => categories.find((c) => c.slug === s)!).map((c) => ({ label: c.name, href: catLink(c.slug) }))

  return (
    <div className="container-page space-y-32 pt-16">
      {/* Hero: category menu + promo banners */}
      <section className="grid grid-cols-[1fr_3fr] gap-8">
        <LinkListSidebar
          title="Category menu"
          links={categories.slice(0, 5).map((c) => ({ label: c.name, href: catLink(c.slug) }))}
          more={{ label: "More categories", href: "/category/all" }}
        />
        <div className="grid grid-cols-2 gap-8">
          <PromoBanner eyebrow="Banner subfocus" title="Fresh carrots from Tomissy Farm" cta="Read recepies" href="/blog" />
          <PromoBanner eyebrow="Weekly deal" title="Up to 36 % off on fruit" cta="Shop deals" href="/category/fruit-and-vegetables?discounted=1" />
        </div>
      </section>

      <section className="grid grid-cols-[1fr_3fr] gap-8">
        <LinkListSidebar
          title="Best selling products"
          links={pick(["kitchen", "meat-and-fish", "special-nutrition", "pharmacy", "baby"])}
          more={{ label: "More products", href: "/category/all?sort=popular" }}
        />
        <ProductGrid products={bestSelling} />
      </section>

      <section className="grid grid-cols-[1fr_3fr] gap-8">
        <LinkListSidebar
          title="Best from Farmers"
          links={[
            { label: "Carrots", href: "/category/all?q=Carrots" },
            { label: "Tomatoes", href: "/category/all?q=Tomatoes" },
            { label: "Potatoes", href: "/category/all?q=Potatoes" },
            { label: "Chicken", href: catLink("meat-and-fish", "Chicken") },
            { label: "Pork", href: catLink("meat-and-fish", "Pork") },
          ]}
          more={{ label: "More products", href: "/category/fruit-and-vegetables" }}
        />
        <ProductGrid products={farmers} />
      </section>

      <section>
        <SectionHeader title="Our customers says" href="/about" linkLabel="Read more" />
        <TestimonialCarousel items={testimonials} />
      </section>

      <section className="border-t border-surface-2 pt-16">
        <SectionHeader title="Weekly deals" href="/category/all?discounted=1" linkLabel="All deals" />
        <ProductGrid products={featured} columns={4} />
      </section>

      <section>
        <SectionHeader title="Read our Blog posts" href="/blog" linkLabel="Go to Blog" />
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
