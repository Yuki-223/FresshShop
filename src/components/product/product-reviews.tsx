"use client"

import { ExternalLink, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useI18n } from "@/i18n/client"
import { loadReviews, submitReview } from "@/lib/reviews/actions"
import type { ProductReview, ReviewPage } from "@/lib/reviews/types"
import { cn } from "@/lib/utils"

/**
 * "Customer Reviews" of vitacost.com product pages: on the left the average (30px bold) with a star,
 * the number of ratings and a bar per star level; on the right the reviews (stars, author, date,
 * title, text) separated by rules. Our additions: a "Write a review" button under the bars that opens
 * the form in place, and "Show more reviews" instead of page numbers (most products have few).
 *
 * The collected rating has no per-star counts, so the bars count the written reviews only and say so.
 * Sample reviews (source "demo", made up for the demo) carry a small "Sample review" tag.
 */

function Stars({ value, size = 18 }: { value: number; size?: number }) {
  return (
    <span className="relative inline-block leading-none tracking-[2px]" style={{ fontSize: size }} aria-hidden="true">
      <span className="text-[#dddddd]">★★★★★</span>
      <span className="absolute inset-0 overflow-hidden whitespace-nowrap text-brand" style={{ width: `${(value / 5) * 100}%` }}>
        ★★★★★
      </span>
    </span>
  )
}

function ReviewItem({ review }: { review: ProductReview }) {
  const { t, fmt } = useI18n()
  return (
    <article className="border-b border-[#121212]/15 py-6 first:pt-0">
      <span role="img" aria-label={t("product.ratedOutOf", { value: review.rating })}>
        <Stars value={review.rating} size={20} />
      </span>
      <div className="mt-3 flex items-center gap-3">
        <span className="grid size-8 place-items-center rounded-full bg-[#f3f4f1] text-sm font-bold text-[#121212]" aria-hidden="true">
          {review.author_name.trim().charAt(0).toUpperCase()}
        </span>
        <div className="leading-tight">
          <p className="text-sm font-bold text-[#121212]">
            {review.author_name}
            {review.location && <span className="ml-2 font-normal text-[#121212]/60">{review.location}</span>}
          </p>
          <p className="text-xs text-[#121212]/60">
            <time dateTime={review.published_at}>{fmt.date(review.published_at)}</time>
            {review.source === "demo" && (
              <span className="ml-2 rounded-sm bg-[#f0f0f0] px-1.5 py-px text-[10px] tracking-[0.5px] text-[#121212]/55">{t("productPage.sampleReview")}</span>
            )}
          </p>
        </div>
      </div>
      {review.title && <p className="mt-3 text-base font-bold text-[#121212]">{review.title}</p>}
      <p className="mt-1 text-sm leading-5 tracking-[0.3px] whitespace-pre-line text-[#121212]/85">{review.content}</p>
    </article>
  )
}

export function ProductReviews({ productId, sourceUrl, initial }: { productId?: string; sourceUrl: string; initial: ReviewPage }) {
  const { t } = useI18n()
  const router = useRouter()
  const [page, setPage] = useState(initial)
  const [loadingMore, setLoadingMore] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [name, setName] = useState("")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const summary = page.summary
  const written = page.breakdown.reduce((n, b) => n + b.count, 0)

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
      setFormOpen(false)
      toast.success(t("productPage.reviewThanks"))
      router.refresh() // updates the rating in the buy box
    } finally {
      setSubmitting(false)
    }
  }

  const field = "h-10 rounded border-[#c4c4c4] bg-white"

  return (
    <section id="reviews" className="mt-14 grid scroll-mt-40 grid-cols-[300px_1fr] gap-x-[50px] px-[50px]" aria-labelledby="reviews-heading">
      <aside>
        <h2 id="reviews-heading" className="font-sans text-xl font-normal tracking-[0.6px] text-black">
          {t("productPage.customerReviewsTitle")}
        </h2>
        {summary ? (
          <>
            <p className="mt-2 flex items-center gap-2 text-black">
              <span className="text-[26px] leading-none text-brand" aria-hidden="true">
                ★
              </span>
              <span className="text-3xl leading-none font-bold tracking-[0.6px]">{summary.value.toFixed(1)}</span>
              <span className="text-sm tracking-[0.6px]">{t.plural("product.reviews", summary.count)}</span>
            </p>
            {written > 0 && (
              <div className="mt-4">
                <ul className="space-y-1.5">
                  {page.breakdown.map((b) => (
                    <li key={b.stars} className="flex items-center gap-3 text-sm text-[#121212]/75">
                      <span role="img" aria-label={t.plural("productPage.starCount", b.stars)}>
                        <Stars value={b.stars} size={14} />
                      </span>
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-[#ececec]">
                        <span className="block h-full rounded-full bg-brand" style={{ width: `${(b.count / written) * 100}%` }} />
                      </span>
                      <span className="w-6 text-right tabular-nums">{b.count}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-[#121212]/60">{t.plural("productPage.basedOnWritten", written)}</p>
              </div>
            )}
          </>
        ) : (
          <p className="mt-2 text-sm text-[#121212]/60">{t("product.noRating")}</p>
        )}

        {productId && !formOpen && (
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="mt-5 h-10 w-full rounded-[2px] border border-[#121212] bg-white text-sm font-bold tracking-[1px] text-[#121212] transition-colors hover:bg-[#121212] hover:text-white"
          >
            {t("productPage.writeReview")}
          </button>
        )}
        <p className="mt-4 text-xs leading-relaxed text-[#121212]/60">{t("productPage.reviewsNote")}</p>
        {sourceUrl && (
          <a href={sourceUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-brand hover:underline">
            {t("productPage.viewSource")} <ExternalLink className="size-3" />
          </a>
        )}
      </aside>

      <div>
        {productId && formOpen && (
          <form onSubmit={submit} className="mb-8 space-y-4 border border-[#e5e5e5] p-6">
            <p className="text-base font-bold text-[#121212]">{t("productPage.writeReview")}</p>
            <div>
              <p className="mb-1 text-xs font-bold text-[#121212]">{t("productPage.yourRating")}</p>
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
                    <Star className={cn("size-6", n <= (hover || rating) ? "fill-brand text-brand" : "text-[#c4c4c4]")} strokeWidth={1.5} />
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="review-name" className="mb-1 text-xs font-bold text-[#121212]">
                  {t("productPage.yourName")}
                </Label>
                <Input id="review-name" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} className={field} />
              </div>
              <div>
                <Label htmlFor="review-title" className="mb-1 text-xs font-bold text-[#121212]">
                  {t("productPage.reviewTitle")}
                </Label>
                <Input
                  id="review-title"
                  value={title}
                  maxLength={120}
                  placeholder={t("productPage.reviewTitlePlaceholder")}
                  onChange={(e) => setTitle(e.target.value)}
                  className={field}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="review-content" className="mb-1 text-xs font-bold text-[#121212]">
                {t("productPage.reviewContent")}
              </Label>
              <Textarea
                id="review-content"
                value={content}
                maxLength={4000}
                placeholder={t("productPage.reviewPlaceholder")}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-24 rounded border-[#c4c4c4] bg-white"
              />
            </div>
            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="h-10 rounded-[2px] bg-brand px-6 text-sm font-bold tracking-[1px] text-white hover:bg-brand-dark disabled:bg-[#c8c8c8]"
              >
                {submitting ? t("productPage.submittingReview") : t("productPage.submitReview")}
              </button>
              <button type="button" onClick={() => setFormOpen(false)} className="text-sm text-[#121212]/75 hover:underline">
                {t("productPage.cancelReview")}
              </button>
            </div>
          </form>
        )}

        {page.reviews.length === 0 ? (
          <p className="text-sm text-[#121212]/60">{t("productPage.noWrittenReviews")}</p>
        ) : (
          <div>
            {page.reviews.map((r) => (
              <ReviewItem key={r.id} review={r} />
            ))}
          </div>
        )}
        {page.reviews.length < page.count && (
          <div className="mt-6 text-center">
            <button
              type="button"
              disabled={loadingMore}
              onClick={loadMore}
              className="h-10 rounded-[2px] border border-[#121212] px-6 text-sm font-bold tracking-[1px] text-[#121212] transition-colors hover:bg-[#121212] hover:text-white disabled:opacity-50"
            >
              {loadingMore ? `${t("common.loading")}…` : t("productPage.loadMoreReviews")}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
