import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { BlogCard } from "@/components/blog/blog-cards"
import { Breadcrumbs } from "@/components/common/breadcrumbs"
import { PlaceholderImage } from "@/components/common/placeholder-image"
import { SoftBadge, TagChip } from "@/components/common/pills"
import { SectionHeader } from "@/components/common/section-header"
import { ProductGrid } from "@/components/product/product-card"
import { getI18n } from "@/i18n/server"
import { blogTagLabel, getBlogPost, getFeatured, listBlogPosts } from "@/lib/api"
import type { BlogBlock } from "@/types"

export async function generateMetadata({ params }: PageProps<"/[lang]/blog/[slug]">): Promise<Metadata> {
  const { locale } = await getI18n()
  const post = await getBlogPost((await params).slug, locale)
  return { title: post?.title, description: post?.excerpt }
}

function Block({ block }: { block: BlogBlock }) {
  switch (block.type) {
    case "paragraph":
      return <p className="text-[15px] leading-[1.8] text-ink">{block.text}</p>
    case "heading":
      return <h2 className="pt-4 text-[22px] font-semibold text-ink">{block.text}</h2>
    case "quote":
      return (
        <blockquote className="border-l-4 border-brand-light bg-brand-soft py-6 pr-6 pl-8 font-heading text-lg leading-relaxed font-medium text-ink">
          “{block.text}”
        </blockquote>
      )
    case "image":
      return (
        <figure>
          <PlaceholderImage className="aspect-[16/9]" label={block.caption} />
          {block.caption && <figcaption className="mt-2 text-center text-xs text-ink-muted">{block.caption}</figcaption>}
        </figure>
      )
    case "list":
      return (
        <ul className="list-disc space-y-2 pl-6 text-[15px] leading-relaxed text-ink marker:text-brand">
          {block.items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      )
  }
}

export default async function BlogPostPage({ params }: PageProps<"/[lang]/blog/[slug]">) {
  const { t, fmt, locale } = await getI18n()
  const post = await getBlogPost((await params).slug, locale)
  if (!post) notFound()
  const [all, products] = await Promise.all([listBlogPosts(locale, { pageSize: 50 }), getFeatured(locale, 4)])
  const related = all.items.filter((p) => p.slug !== post.slug).slice(0, 3)

  return (
    <div className="container-page">
      <Breadcrumbs items={[{ label: t("blog.blog"), href: "/blog" }, { label: post.title }]} />

      <header className="mx-auto max-w-[800px] pt-8 text-center">
        <SoftBadge>{post.tagLabel}</SoftBadge>
        <h1 className="mt-4 text-[40px] leading-tight font-semibold text-ink">{post.title}</h1>
        <div className="mt-6 flex items-center justify-center gap-3 text-sm text-ink-muted">
          <span className="size-8 rounded-full bg-surface-2" aria-hidden />
          <span className="text-ink">{post.author}</span>
          <span>·</span>
          <time dateTime={post.date}>{fmt.longDate(post.date)}</time>
          <span>·</span>
          <span>{t("blog.minRead", { count: post.readMinutes })}</span>
        </div>
      </header>

      <PlaceholderImage className="mt-12 aspect-[21/9]" label={post.title} />

      <article className="mx-auto mt-16 max-w-[720px] space-y-6">
        <p className="font-heading text-lg leading-relaxed font-medium text-ink">{post.excerpt}</p>
        {post.content.map((b, i) => (
          <Block key={i} block={b} />
        ))}
        <div className="flex flex-wrap gap-3 border-t border-surface-2 pt-8">
          {[post.tag, "Fresh food", "Recipes"].map((tg) => (
            <TagChip key={tg} href={`/blog?tag=${encodeURIComponent(tg)}`}>
              {blogTagLabel(tg, locale)}
            </TagChip>
          ))}
        </div>
      </article>

      <section className="mt-24">
        <SectionHeader title={t("blog.productsFromArticle")} href="/category/all?discounted=1" linkLabel={t("blog.moreProducts")} />
        <ProductGrid products={products} columns={4} />
      </section>

      <section className="mt-24">
        <SectionHeader title={t("blog.readMoreArticles")} href="/blog" linkLabel={t("blog.goToBlog")} />
        <div className="grid grid-cols-3 gap-8">
          {related.map((p) => (
            <BlogCard key={p.slug} post={p} />
          ))}
        </div>
      </section>
    </div>
  )
}
