"use client"

import { useEffect, useState } from "react"
import { CountPill } from "@/components/common/pills"
import { ProductReviews } from "@/components/product/product-reviews"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useI18n } from "@/i18n/client"
import { cn } from "@/lib/utils"
import type { ReviewPage } from "@/lib/reviews/types"
import type { ContentBlock, ProductDetail } from "@/types"

function Heading({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-2 text-[15px] font-medium text-ink">{children}</h3>
}

function Blocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="space-y-3 text-sm leading-relaxed text-ink">
      {blocks.map((b, i) =>
        b.type === "heading" ? (
          <h3 key={i} className="pt-2 text-[15px] font-medium text-ink">
            {b.text}
          </h3>
        ) : b.type === "list" ? (
          <ul key={i} className="list-disc space-y-1 pl-5 marker:text-brand">
            {b.items.map((it) => (
              <li key={it}>{it}</li>
            ))}
          </ul>
        ) : (
          <p key={i}>{b.text}</p>
        ),
      )}
    </div>
  )
}

function TabLabel({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <span className="flex items-center gap-2">
      {children}
      {count != null && <CountPill className="h-4 min-w-6 text-[10px]">{count}</CountPill>}
    </span>
  )
}

/** Description, Supplement Facts, Directions & Storage, Warnings, FAQ and Ratings — straight from the collected source. */
export function ProductTabs({ product, reviews }: { product: ProductDetail; reviews: ReviewPage }) {
  const { t } = useI18n()
  const [tab, setTab] = useState("description")
  // "#reviews" links (rating next to the title) open the reviews tab
  useEffect(() => {
    const sync = () => window.location.hash === "#reviews" && setTab("reviews")
    sync()
    window.addEventListener("hashchange", sync)
    return () => window.removeEventListener("hashchange", sync)
  }, [])
  const facts = product.supplementFacts
  const trigger = cn(
    "h-12 flex-none justify-start rounded-none border-0 border-b-2 border-transparent px-0 mr-6 last:mr-0 font-heading text-[15px] font-medium text-ink",
    "data-active:border-brand data-active:text-ink after:hidden",
  )

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(String(v))} className="mt-12 gap-8">
      <TabsList variant="line" className="h-auto w-full flex-wrap justify-start gap-0 border-b border-surface-2 p-0">
        <TabsTrigger value="description" className={trigger}>
          {t("productPage.tabDescription")}
        </TabsTrigger>
        {facts && (
          <TabsTrigger value="facts" className={trigger}>
            {t("productPage.tabFacts")}
          </TabsTrigger>
        )}
        <TabsTrigger value="directions" className={trigger}>
          {t("productPage.tabDirections")}
        </TabsTrigger>
        <TabsTrigger value="warnings" className={trigger}>
          {t("productPage.tabWarnings")}
        </TabsTrigger>
        {product.faq.length > 0 && (
          <TabsTrigger value="faq" className={trigger}>
            <TabLabel count={product.faq.length}>{t("productPage.tabFaq")}</TabLabel>
          </TabsTrigger>
        )}
        <TabsTrigger value="reviews" className={trigger}>
          <TabLabel count={reviews.summary?.count}>{t("productPage.tabReviews")}</TabLabel>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="description">
        {product.content.length ? <Blocks blocks={product.content} /> : <p className="text-sm text-ink">{product.summary}</p>}
      </TabsContent>

      {facts && (
        <TabsContent value="facts" className="text-sm">
          <dl className="mb-4 flex gap-8 text-ink">
            {facts.servingSize && (
              <div>
                <dt className="font-heading text-xs font-semibold text-ink-muted">{t("productPage.servingSize")}</dt>
                <dd>{facts.servingSize}</dd>
              </div>
            )}
            {facts.servings && (
              <div>
                <dt className="font-heading text-xs font-semibold text-ink-muted">{t("productPage.servings")}</dt>
                <dd>{facts.servings}</dd>
              </div>
            )}
          </dl>
          <Table>
            <TableHeader>
              <TableRow className="border-surface-2 hover:bg-transparent">
                {[t("productPage.ingredient"), t("productPage.amountPerServing"), t("productPage.dailyValue")].map((h, j) => (
                  <TableHead key={h} className={cn("h-10 font-heading text-xs font-semibold text-ink", j === 0 ? "pl-0" : "px-2")}>
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {facts.rows.map((row, i) => (
                <TableRow key={`${i}-${row.name}`} className={cn("border-0", i % 2 === 0 && "bg-surface")}>
                  <TableCell className="py-2.5 pl-0 text-sm whitespace-normal text-ink">{row.name}</TableCell>
                  <TableCell className="px-2 py-2.5 text-sm whitespace-nowrap text-ink">{row.amount}</TableCell>
                  <TableCell className="px-2 py-2.5 text-sm text-ink">{row.dv}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      )}

      <TabsContent value="directions" className="space-y-6 text-sm text-ink">
        <section>
          <Heading>{t("productPage.directions")}</Heading>
          <p className="leading-relaxed">{product.directions ?? t("productPage.noContent")}</p>
        </section>
        {product.storage && (
          <section>
            <Heading>{t("productPage.storage")}</Heading>
            <p className="leading-relaxed">{product.storage}</p>
          </section>
        )}
      </TabsContent>

      <TabsContent value="warnings" className="space-y-6 text-sm text-ink">
        {!product.cautions && !product.warnings && <p>{t("productPage.noContent")}</p>}
        {product.cautions && (
          <section>
            <Heading>{t("productPage.cautions")}</Heading>
            <p className="leading-relaxed">{product.cautions}</p>
          </section>
        )}
        {product.warnings && (
          <section>
            <Heading>{t("productPage.warnings")}</Heading>
            <p className="leading-relaxed">{product.warnings}</p>
          </section>
        )}
      </TabsContent>

      {product.faq.length > 0 && (
        <TabsContent value="faq" className="space-y-6">
          {product.faq.map((item) => (
            <div key={item.q} className="border-b border-surface-2 pb-6">
              <p className="font-heading text-[15px] font-medium text-ink">{item.q}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.a}</p>
            </div>
          ))}
        </TabsContent>
      )}

      <TabsContent value="reviews">
        <ProductReviews productId={product.medusaId} sourceUrl={product.sourceUrl} initial={reviews} />
      </TabsContent>
    </Tabs>
  )
}
