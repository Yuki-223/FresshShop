import { Link } from "@/i18n/navigation"
import { PlaceholderImage } from "@/components/common/placeholder-image"
import { SoftBadge } from "@/components/common/pills"
import { getI18n } from "@/i18n/server"
import { cn } from "@/lib/utils"
import type { BlogPost } from "@/types"

async function Meta({ post, className }: { post: BlogPost; className?: string }) {
  const { fmt } = await getI18n()
  return (
    <p className={cn("flex items-center gap-4 text-xs", className)}>
      <span>{post.author}</span>
      <span>{fmt.date(post.date)}</span>
    </p>
  )
}

/** Large card with dark gradient overlay ("Our chef tips…"). */
export function BlogFeatureCard({ post, className }: { post: BlogPost; className?: string }) {
  return (
    <Link href={`/blog/${post.slug}`} className={cn("group relative block overflow-hidden rounded-xl", className)}>
      <PlaceholderImage className="absolute inset-0 rounded-none bg-surface transition-transform duration-500 group-hover:scale-[1.02]" />
      <SoftBadge className="absolute top-6 left-6">{post.tagLabel}</SoftBadge>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-b from-transparent via-ink/80 to-ink px-8 pt-20 pb-6 text-white">
        <h3 className="text-[22px] leading-snug font-medium">{post.title}</h3>
        <div className="mt-4 flex items-center gap-3">
          <span className="size-8 rounded-full bg-white" aria-hidden />
          <Meta post={post} className="text-white/80" />
        </div>
      </div>
    </Link>
  )
}

/** Vertical card: image on top, tag, title, meta. */
export function BlogCard({ post, className }: { post: BlogPost; className?: string }) {
  return (
    <article className={cn("group flex flex-col", className)}>
      <Link href={`/blog/${post.slug}`} tabIndex={-1} aria-hidden>
        <PlaceholderImage className="aspect-[3/2] transition-opacity group-hover:opacity-80" />
      </Link>
      <SoftBadge className="mt-4 w-fit">{post.tagLabel}</SoftBadge>
      <h3 className="mt-3 text-lg leading-snug font-semibold text-ink">
        <Link href={`/blog/${post.slug}`} className="hover:text-brand">
          {post.title}
        </Link>
      </h3>
      <Meta post={post} className="mt-3 text-ink" />
    </article>
  )
}

/** Compact row with thumbnail on the right. */
export function BlogListItem({ post }: { post: BlogPost }) {
  return (
    <article className="flex items-start justify-between gap-6">
      <div>
        <h3 className="font-heading text-[15px] leading-snug font-medium text-ink">
          <Link href={`/blog/${post.slug}`} className="hover:text-brand">
            {post.title}
          </Link>
        </h3>
        <Meta post={post} className="mt-4 text-ink" />
      </div>
      <Link href={`/blog/${post.slug}`} tabIndex={-1} aria-hidden className="shrink-0">
        <PlaceholderImage className="size-[100px]" />
      </Link>
    </article>
  )
}
