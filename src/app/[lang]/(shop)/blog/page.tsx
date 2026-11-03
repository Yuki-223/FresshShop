import type { Metadata } from "next"
import { BlogCard, BlogFeatureCard, BlogListItem } from "@/components/blog/blog-cards"
import { Breadcrumbs } from "@/components/common/breadcrumbs"
import { CountPill } from "@/components/common/pills"
import { Link } from "@/i18n/navigation"
import { getI18n } from "@/i18n/server"
import { blogTagLabel, listBlogPosts, listBlogTags } from "@/lib/api"
import { cn } from "@/lib/utils"

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t("blog.blog") }
}

export default async function BlogPage({ searchParams }: PageProps<"/[lang]/blog">) {
  const { t, locale } = await getI18n()
  const sp = await searchParams
  const tag = typeof sp.tag === "string" ? sp.tag : undefined
  const page = Number(sp.page) || 1
  const [result, tags, latest] = await Promise.all([
    listBlogPosts(locale, { tag, page, pageSize: 7 }),
    listBlogTags(locale),
    listBlogPosts(locale, { pageSize: 3 }),
  ])
  const [feature, ...rest] = result.items
  const href = (p: { tag?: string; page?: number }) => {
    const q = new URLSearchParams()
    if (p.tag) q.set("tag", p.tag)
    if (p.page && p.page > 1) q.set("page", String(p.page))
    const s = q.toString()
    return s ? `/blog?${s}` : "/blog"
  }

  return (
    <div className="container-page">
      <Breadcrumbs items={[{ label: t("blog.blog") }]} />
      <div className="flex items-end justify-between pt-4">
        <h1 className="text-[32px] font-semibold text-ink">{tag ? blogTagLabel(tag, locale) : t("blog.title")}</h1>
        <p className="flex items-center gap-1.5 text-xs text-ink-muted">
          <CountPill>{result.total}</CountPill> {t("blog.articles")}
        </p>
      </div>

      <div className="mt-12 grid grid-cols-[1fr_300px] gap-12">
        <div>
          {feature && <BlogFeatureCard post={feature} className="h-[460px]" />}
          <div className="mt-12 grid grid-cols-3 gap-x-8 gap-y-12">
            {rest.map((p) => (
              <BlogCard key={p.slug} post={p} />
            ))}
          </div>
          {result.pageCount > 1 && (
            <nav aria-label={t("catalog.pagination")} className="mt-16 flex items-center gap-2 text-xs">
              <span className="text-ink-muted">{t("catalog.page")}</span>
              {Array.from({ length: result.pageCount }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={href({ tag, page: p })}
                  aria-current={p === result.page ? "page" : undefined}
                  className={cn("px-1 font-heading font-semibold", p === result.page ? "text-ink" : "text-brand hover:underline")}
                >
                  {p}
                </Link>
              ))}
            </nav>
          )}
        </div>

        <aside className="space-y-12">
          <section>
            <h2 className="mb-4 text-lg font-semibold text-ink">{t("blog.categories")}</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/blog" className={cn("flex justify-between text-sm hover:text-brand", !tag ? "font-semibold text-brand" : "text-ink")}>
                  {t("blog.allArticles")}
                </Link>
              </li>
              {tags.map((tg) => (
                <li key={tg.value}>
                  <Link
                    href={href({ tag: tg.value })}
                    className={cn("flex items-center justify-between text-sm hover:text-brand", tag === tg.value ? "font-semibold text-brand" : "text-ink")}
                  >
                    {tg.label}
                    <CountPill>{tg.count}</CountPill>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="mb-6 text-lg font-semibold text-ink">{t("blog.latestPosts")}</h2>
            <div className="space-y-8">
              {latest.items.map((p) => (
                <BlogListItem key={p.slug} post={p} />
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
