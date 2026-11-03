"use client"

import { Star } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { CountPill } from "@/components/common/pills"
import { Rating } from "@/components/product/rating"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useI18n } from "@/i18n/client"
import { cn } from "@/lib/utils"
import type { NutritionRow, Product, ProductQA, Review } from "@/types"

function Heading({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-2 text-[15px] font-medium text-ink">{children}</h3>
}

function TabLabel({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <span className="flex items-center gap-2">
      {children}
      {count != null && <CountPill className="h-4 min-w-6 text-[10px]">{count}</CountPill>}
    </span>
  )
}

export function ProductTabs({
  product,
  reviews,
  nutrition,
  questions,
}: {
  product: Product
  reviews: Review[]
  nutrition: NutritionRow[]
  questions: ProductQA[]
}) {
  const { t, fmt } = useI18n()
  const [localReviews, setLocalReviews] = useState(reviews)
  const [draft, setDraft] = useState("")
  const [draftRating, setDraftRating] = useState(5)

  const trigger = cn(
    "h-12 justify-start rounded-none border-0 border-b-2 border-transparent px-0 font-heading text-lg font-medium text-ink",
    "data-active:border-brand data-active:text-ink after:hidden",
  )

  return (
    <Tabs defaultValue="description" className="mt-12 gap-10">
      <TabsList variant="line" className="h-auto w-full justify-start gap-0 border-b border-surface-2 p-0">
        <TabsTrigger value="description" className={cn(trigger, "flex-none pr-16")}>
          {t("productPage.tabDescription")}
        </TabsTrigger>
        <TabsTrigger value="reviews" className={cn(trigger, "flex-none px-6 pr-16")}>
          <TabLabel count={product.reviewsCount + (localReviews.length - reviews.length)}>{t("productPage.tabReviews")}</TabLabel>
        </TabsTrigger>
        <TabsTrigger value="questions" className={cn(trigger, "flex-none px-6")}>
          <TabLabel count={questions.length}>{t("productPage.tabQuestions")}</TabLabel>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="space-y-8 text-sm text-ink">
        <section>
          <Heading>{t("productPage.origins")}</Heading>
          <p className="leading-relaxed">{t("productPage.originsText")}</p>
        </section>
        <section>
          <Heading>{t("productPage.howToCook")}</Heading>
          <p className="leading-relaxed">{t("productPage.howToCookText", { title: product.title })}</p>
        </section>
        <section>
          <Heading>{t("productPage.fullOfVitamins")}</Heading>
          <Table>
            <TableHeader>
              <TableRow className="border-surface-2 hover:bg-transparent">
                {[t("productPage.vitamins"), t("productPage.vitaminQuantity"), t("productPage.dailyValue")].map((h) => (
                  <TableHead key={h} className="h-10 px-0 font-heading text-xs font-semibold text-ink">
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {nutrition.map((row, i) => (
                <TableRow key={row.name} className={cn("border-0", i % 2 === 0 && "bg-surface")}>
                  {[row.name, row.quantity, row.dv].map((cell, j) => (
                    <TableCell key={j} className={cn("h-10 text-sm text-ink", j === 0 ? "pl-0" : "px-0")}>
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      </TabsContent>

      <TabsContent value="reviews" className="space-y-6">
        {localReviews.length === 0 && <p className="text-sm text-ink-muted">{t("productPage.noReviews")}</p>}
        {localReviews.map((r) => (
          <article key={r.id} className="border-b border-surface-2 pb-6">
            <div className="flex items-center justify-between">
              <p className="font-heading text-sm font-semibold text-ink">{r.author}</p>
              <span className="text-xs text-ink-muted">{fmt.date(r.date)}</span>
            </div>
            <Rating value={r.rating} tone="gold" size="xs" className="mt-1" />
            <p className="mt-2 text-sm text-ink-soft">{r.body}</p>
          </article>
        ))}
        <form
          className="space-y-3 rounded-xl bg-surface p-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (draft.trim().length < 2) return toast.error(t("productPage.reviewTooShort"))
            setLocalReviews((rs) => [
              {
                id: `local-${rs.length}-${draft.length}`,
                productId: product.id,
                author: t("productPage.you"),
                rating: draftRating,
                date: new Date().toISOString(),
                body: draft.trim(),
              },
              ...rs,
            ])
            setDraft("")
            toast.success(t("productPage.reviewThanks"))
          }}
        >
          <p className="font-heading text-sm font-semibold text-ink">{t("productPage.writeReview")}</p>
          <div className="flex gap-1" role="radiogroup" aria-label={t("productPage.yourRating")}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={draftRating === n}
                aria-label={t.plural("productPage.starCount", n)}
                onClick={() => setDraftRating(n)}
              >
                <Star className={cn("size-5", n <= draftRating ? "fill-star text-star" : "text-line")} strokeWidth={1.5} />
              </button>
            ))}
          </div>
          <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={t("productPage.reviewPlaceholder")} className="bg-white" />
          <Button size="sm" type="submit">
            {t("productPage.submitReview")}
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="questions" className="space-y-6">
        {questions.map((item) => (
          <div key={item.q} className="border-b border-surface-2 pb-6">
            <p className="font-heading text-[15px] font-medium text-ink">{item.q}</p>
            <p className="mt-2 text-sm text-ink-soft">{item.a}</p>
          </div>
        ))}
      </TabsContent>
    </Tabs>
  )
}
