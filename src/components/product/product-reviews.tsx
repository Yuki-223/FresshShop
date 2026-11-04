"use client"

import { ExternalLink, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Rating } from "@/components/product/rating"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useI18n } from "@/i18n/client"
import { loadReviews, submitReview } from "@/lib/reviews/actions"
import type { ProductReview, ReviewPage } from "@/lib/reviews/types"
import { cn } from "@/lib/utils"

function ReviewItem({ review }: { review: ProductReview }) {
  const { fmt } = useI18n()
  return (
    <article className="border-b border-surface-2 pb-6">
      <div className="flex items-center justify-between gap-4">
        <p className="font-heading text-sm font-semibold text-ink">
          {review.author_name}
          {review.location && <span className="ml-2 font-sans text-xs font-normal text-ink-muted">{review.location}</span>}
        </p>
        <time dateTime={review.published_at} className="shrink-0 text-xs text-ink-muted">
          {fmt.date(review.published_at)}
        </time>
      </div>
      <Rating value={review.rating} tone="gold" size="xs" className="mt-1" />
      {review.title && <p className="mt-2 font-heading text-sm font-medium text-ink">{review.title}</p>}
      <p className="mt-1 text-sm leading-relaxed whitespace-pre-line text-ink-soft">{review.content}</p>
    </article>
  )
}

/** Rating summary, written reviews (paged) and the "write a review" form — all backed by the review module. */
export function ProductReviews({ productId, sourceUrl, initial }: { productId?: string; sourceUrl: string; initial: ReviewPage }) {
  const { t } = useI18n()
  const router = useRouter()
  const [page, setPage] = useState(initial)
  const [loadingMore, setLoadingMore] = useState(false)
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [name, setName] = useState("")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const summary = page.summary

  const loadMore = async () => {
    if (!productId) return
    setLoadingMore(true)
    try {
      const next = await loadReviews(productId, page.reviews.length)
      setPage((p) => ({ ...next, reviews: [...p.reviews, ...next.reviews.filter((r) => !p.reviews.some((x) => x.id === r.id))] }))
    } finally {
      setLoadingMore(false)
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!productId) return
    if (!rating) return toast.error(t("productPage.reviewNeedsRating"))
    if (!name.trim()) return toast.error(t("productPage.reviewNeedsName"))
    if (content.trim().length < 2) return toast.error(t("productPage.reviewTooShort"))
    setSubmitting(true)
    try {
      const result = await submitReview({ productId, rating, authorName: name, title, content })
      if (!result.ok) return toast.error(result.error)
      setPage(result.page)
      setRating(0)
      setTitle("")
      setContent("")
      toast.success(t("productPage.reviewThanks"))
      router.refresh() // updates the rating next to the product title
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-[200px_1fr] gap-10">
        <aside>
          {summary ? (
            <>
              <p className="font-heading text-5xl font-semibold text-ink">{summary.value.toFixed(1)}</p>
              <Rating value={summary.value} tone="gold" size="md" className="mt-2" />
              <p className="mt-2 text-xs text-ink-muted">{t.plural("product.reviews", summary.count)}</p>
            </>
          ) : (
            <p className="text-sm text-ink-muted">{t("product.noRating")}</p>
          )}
          <p className="mt-4 text-xs leading-relaxed text-ink-muted">{t("productPage.reviewsNote")}</p>
          {sourceUrl && (
            <a href={sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-brand hover:underline">
              {t("productPage.viewSource")} <ExternalLink className="size-3" />
            </a>
          )}
        </aside>

        <section aria-label={t.plural("productPage.reviewsHeading", page.count)}>
          <h3 className="mb-4 text-[15px] font-medium text-ink">{t.plural("productPage.reviewsHeading", page.count)}</h3>
          {page.reviews.length === 0 ? (
            <p className="text-sm text-ink-muted">{t("productPage.noWrittenReviews")}</p>
          ) : (
            <div className="space-y-6">
              {page.reviews.map((r) => (
                <ReviewItem key={r.id} review={r} />
              ))}
            </div>
          )}
          {page.reviews.length < page.count && (
            <Button variant="soft" size="sm" className="mt-6" disabled={loadingMore} onClick={loadMore}>
              {loadingMore ? `${t("common.loading")}…` : t("productPage.loadMoreReviews")}
            </Button>
          )}
        </section>
      </div>

      {productId && (
        <form onSubmit={submit} className="space-y-4 rounded-xl bg-surface p-6">
          <p className="font-heading text-base font-semibold text-ink">{t("productPage.writeReview")}</p>
          <div>
            <p className="mb-1 font-heading text-xs font-semibold text-ink">{t("productPage.yourRating")}</p>
            <div className="flex gap-1" role="radiogroup" aria-label={t("productPage.yourRating")} onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={rating === n}
                  aria-label={t.plural("productPage.starCount", n)}
                  onMouseEnter={() => setHover(n)}
                  onClick={() => setRating(n)}
                >
                  <Star className={cn("size-6", n <= (hover || rating) ? "fill-star text-star" : "text-line")} strokeWidth={1.5} />
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="review-name" className="mb-1 font-heading text-xs font-semibold text-ink">
                {t("productPage.yourName")}
              </Label>
              <Input id="review-name" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} className="h-10 rounded-xl bg-white" />
            </div>
            <div>
              <Label htmlFor="review-title" className="mb-1 font-heading text-xs font-semibold text-ink">
                {t("productPage.reviewTitle")}
              </Label>
              <Input
                id="review-title"
                value={title}
                maxLength={120}
                placeholder={t("productPage.reviewTitlePlaceholder")}
                onChange={(e) => setTitle(e.target.value)}
                className="h-10 rounded-xl bg-white"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="review-content" className="mb-1 font-heading text-xs font-semibold text-ink">
              {t("productPage.reviewContent")}
            </Label>
            <Textarea
              id="review-content"
              value={content}
              maxLength={4000}
              placeholder={t("productPage.reviewPlaceholder")}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-24 rounded-xl bg-white"
            />
          </div>
          <Button type="submit" size="sm" disabled={submitting}>
            {submitting ? t("productPage.submittingReview") : t("productPage.submitReview")}
          </Button>
        </form>
      )}
    </div>
  )
}
