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
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Product, Review } from "@/types"

const vitamins: [string, string, string][] = [
  ["Vitamin A equiv.", "735 μg", "104 %"],
  ["Thiamine (B1)", "0.066 mg", "6 %"],
  ["Niacin (B3)", "0.983 mg", "7 %"],
  ["Folate (B9)", "19 μg", "5 %"],
  ["Vitamin C", "5.9 mg", "7 %"],
  ["Vitamin E", "0.66 mg", "4 %"],
  ["Vitamin K", "13.2 μg", "13 %"],
]

const questions = [
  { q: "How long does it stay fresh?", a: "Stored in the fridge, about 2–3 weeks. We ship everything within 24 hours of harvest." },
  { q: "Is it certified organic?", a: "Yes, all our partner farms hold an EU organic certification." },
  { q: "Can I choose a delivery day?", a: "Sure — add a note at checkout and we will do our best to match it." },
  { q: "Do you deliver outside the EU?", a: "Not yet, but we are working on it." },
]

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

export function ProductTabs({ product, reviews }: { product: Product; reviews: Review[] }) {
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
          Description
        </TabsTrigger>
        <TabsTrigger value="reviews" className={cn(trigger, "flex-none px-6 pr-16")}>
          <TabLabel count={product.reviewsCount + (localReviews.length - reviews.length)}>Reviews</TabLabel>
        </TabsTrigger>
        <TabsTrigger value="questions" className={cn(trigger, "flex-none px-6")}>
          <TabLabel count={questions.length}>Questions</TabLabel>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="space-y-8 text-sm text-ink">
        <section>
          <Heading>Origins</Heading>
          <p className="leading-relaxed">
            We work hard to ensure that the fruit and vegetables we sell are fresh and high in quality. If we don&apos;t grow them
            ourselves, we source them from carefully chosen suppliers, preferring to buy locally whenever possible.
          </p>
        </section>
        <section>
          <Heading>How to cook</Heading>
          <p className="leading-relaxed">
            From roasts, salads and soups to casseroles and cakes, {product.title} will lend sweetness, texture and colour to an
            enormous number of recipes.
          </p>
        </section>
        <section>
          <Heading>Full of Vitamins!</Heading>
          <Table>
            <TableHeader>
              <TableRow className="border-surface-2 hover:bg-transparent">
                {["Vitamins", "Quantity", "% DV"].map((h) => (
                  <TableHead key={h} className="h-10 px-0 font-heading text-xs font-semibold text-ink">
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {vitamins.map((row, i) => (
                <TableRow key={row[0]} className={cn("border-0", i % 2 === 0 && "bg-surface")}>
                  {row.map((cell, j) => (
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
        {localReviews.length === 0 && <p className="text-sm text-ink-muted">No reviews yet. Be the first one!</p>}
        {localReviews.map((r) => (
          <article key={r.id} className="border-b border-surface-2 pb-6">
            <div className="flex items-center justify-between">
              <p className="font-heading text-sm font-semibold text-ink">{r.author}</p>
              <span className="text-xs text-ink-muted">{formatDate(r.date)}</span>
            </div>
            <Rating value={r.rating} tone="gold" size="xs" className="mt-1" />
            <p className="mt-2 text-sm text-ink-soft">{r.body}</p>
          </article>
        ))}
        <form
          className="space-y-3 rounded-xl bg-surface p-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (draft.trim().length < 5) return toast.error("Please write at least a few words.")
            setLocalReviews((rs) => [
              { id: `local-${Date.now()}`, productId: product.id, author: "You", rating: draftRating, date: new Date().toISOString(), body: draft.trim() },
              ...rs,
            ])
            setDraft("")
            toast.success("Thanks for your review!")
          }}
        >
          <p className="font-heading text-sm font-semibold text-ink">Write a review</p>
          <div className="flex gap-1" role="radiogroup" aria-label="Your rating">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" role="radio" aria-checked={draftRating === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => setDraftRating(n)}>
                <Star className={cn("size-5", n <= draftRating ? "fill-star text-star" : "text-line")} strokeWidth={1.5} />
              </button>
            ))}
          </div>
          <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="What did you like?" className="bg-white" />
          <Button size="sm" type="submit">
            Submit review
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
