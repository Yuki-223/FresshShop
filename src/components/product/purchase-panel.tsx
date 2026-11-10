"use client"

import { Plus } from "lucide-react"
import { useState } from "react"
import { CompareButton, useAddToCart, WishlistButton } from "@/components/product/product-actions"
import { QuantitySelector } from "@/components/product/quantity-selector"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useI18n } from "@/i18n/client"
import { defaultVariant, priceFor, toCartLine } from "@/lib/product"
import { useCart } from "@/lib/store/cart"
import { cn } from "@/lib/utils"
import type { Product, PurchaseMode, Rating, Variant } from "@/types"

/**
 * Buy box of the product page in vitacost.com's style (measured at 1440px): "Our Price: $59.95"
 * (16px bold label, 18px bold price) next to the stars; then our own option buttons (kept instead of
 * Vitacost's dropdown: one click instead of two), the one-time / subscribe choice, a 42px quantity box
 * and a 42px green "Add to cart" (20px bold, letter-spacing 1px, radius 2), wish list / compare as
 * small links, and "Key info" (14px grey labels, 16px bold values) under a dashed rule.
 */

function OptionButtons({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { value: string; price?: string; available: boolean }[]
  value?: string
  onChange: (v: string) => void
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm text-[#121212]">
        <span className="font-bold">{label}:</span> {value}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const selected = o.value === value
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(o.value)}
              className={cn(
                "h-10 rounded border bg-white px-3.5 text-sm text-[#121212] transition-colors",
                selected ? "border-brand bg-brand/[0.07] shadow-[inset_0_0_0_1px_var(--brand)]" : "border-[#c4c4c4] hover:border-[#121212]/60",
                !o.available && "text-[#121212]/45 line-through",
              )}
            >
              {o.value}
              {o.price && <span className={cn("ml-1.5", selected ? "font-bold" : "text-[#121212]/70")}>· {o.price}</span>}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("relative inline-block text-base leading-none tracking-[2px]", className)} aria-hidden="true">
      <span className="text-[#dddddd]">★★★★★</span>
      <span className="absolute inset-0 overflow-hidden whitespace-nowrap text-brand" style={{ width: `${(value / 5) * 100}%` }}>
        ★★★★★
      </span>
    </span>
  )
}

export function PurchasePanel({
  product,
  rating,
  keyInfo,
  servingSize,
  servings,
  onVariantChange,
}: {
  product: Product
  rating: Rating | null
  /** "Key info" rows (serving size, form, product line); "Total servings" is added for the selected size */
  keyInfo: { label: string; value: string }[]
  /** from the supplement facts (they describe the first size): "1 Tablet", "120" */
  servingSize?: string
  servings?: string
  /** tells the gallery which size / flavour is selected */
  onVariantChange?: (variant: Variant) => void
}) {
  const { t, fmt } = useI18n()
  const addToCart = useAddToCart()
  const busy = useCart((s) => s.pending)
  const [variant, setVariant] = useState<Variant>(() => defaultVariant(product))
  const [mode, setMode] = useState<"once" | "subscription">("once")
  const [months, setMonths] = useState<number>(() => bestOffer(defaultVariant(product))?.months ?? 1)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)

  const sizes = unique(product.variants.map((v) => v.size))
  const flavors = unique(product.variants.map((v) => v.flavor))
  const offers = variant.subscriptions
  const offer = offers.find((o) => o.months === months) ?? bestOffer(variant)
  const purchase: PurchaseMode = mode === "subscription" && offer ? { type: "subscription", months: offer.months } : { type: "once" }
  const unitPrice = priceFor(variant, purchase)

  const pick = (size?: string, flavor?: string) => {
    const next =
      product.variants.find((v) => v.size === size && v.flavor === flavor) ??
      product.variants.find((v) => (size ? v.size === size : v.flavor === flavor)) ??
      variant
    setVariant(next)
    onVariantChange?.(next)
    if (!next.subscriptions.some((o) => o.months === months)) setMonths(bestOffer(next)?.months ?? 1)
    if (!next.subscriptions.length) setMode("once")
  }

  /** lowest one-time price among the variants of a size (with the current flavor when there is one) */
  const sizePrice = (size: string) => {
    const match = product.variants.filter((v) => v.size === size)
    const v = match.find((x) => x.flavor === variant.flavor) ?? match[0]
    return v ? fmt.price(v.price) : undefined
  }
  const sizesDifferInPrice = new Set(sizes.map(sizePrice)).size > 1

  // the facts only know the servings of the first size: for "240 Tablets" with "1 Tablet" per serving
  // it is 240 ÷ 1; when the numbers can't be read, the facts' value is used only for single-size products
  const total = totalServings(variant.size, servingSize) ?? (sizes.length <= 1 ? servings : undefined)
  const keyRows = total ? [...keyInfo.slice(0, 1), { label: t("productPage.totalServings"), value: total }, ...keyInfo.slice(1)] : keyInfo

  const option = (selected: boolean) =>
    cn("rounded border bg-white p-4 transition-colors", selected ? "border-brand bg-brand/[0.04] shadow-[inset_0_0_0_1px_var(--brand)]" : "border-[#c4c4c4]")

  return (
    <div>
      {/* Our Price: $34.95 | ★★★★★ 145 */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[#121212]">
        <p className="flex items-baseline gap-1.5">
          <span className="text-base font-bold text-[#121212]/75">{t("productPage.ourPrice")}</span>
          <span className="text-lg font-bold tracking-[1.3px]">{fmt.price(unitPrice)}</span>
          {unitPrice < variant.price && <span className="text-sm text-[#121212]/50 line-through">{fmt.price(variant.price)}</span>}
        </p>
        {rating && (
          <>
            <span className="h-5 w-px bg-[#121212]/20" aria-hidden="true" />
            <a href="#reviews" className="flex items-center gap-1.5 text-[13px] text-[#121212]/75 hover:underline" aria-label={t("product.ratedOutOf", { value: rating.value.toFixed(1) })}>
              <Stars value={rating.value} />
              {rating.count}
            </a>
          </>
        )}
      </div>

      <div className="mt-6 space-y-5">
        {sizes.length > 1 && (
          <OptionButtons
            label={t("productPage.size")}
            value={variant.size}
            onChange={(s) => pick(s, variant.flavor)}
            options={sizes.map((s) => ({
              value: s,
              price: sizesDifferInPrice ? sizePrice(s) : undefined,
              available: product.variants.some((v) => v.size === s && v.available),
            }))}
          />
        )}
        {flavors.length > 1 && (
          <OptionButtons
            label={t("productPage.flavor")}
            value={variant.flavor}
            onChange={(f) => pick(variant.size, f)}
            options={flavors.map((f) => ({ value: f, available: product.variants.some((v) => v.flavor === f && v.available) }))}
          />
        )}

        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-bold text-[#121212]">{t("productPage.purchaseOption")}</legend>
          <label className={cn("flex cursor-pointer items-center gap-3", option(mode === "once"))}>
            <input type="radio" name="purchase" checked={mode === "once"} onChange={() => setMode("once")} className="size-4 accent-[var(--brand)]" />
            <span className="flex-1 text-sm font-bold text-[#121212]">{t("productPage.buyOnce")}</span>
            <span className="text-sm font-bold text-[#121212]">{fmt.price(variant.price)}</span>
          </label>
          {offer && (
            <div className={option(mode === "subscription")}>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="radio"
                  name="purchase"
                  checked={mode === "subscription"}
                  onChange={() => setMode("subscription")}
                  className="size-4 accent-[var(--brand)]"
                />
                <span className="flex-1 text-sm font-bold text-[#121212]">
                  {t("productPage.subscribe")}
                  {offer.savePercent > 0 && (
                    <span className="ml-2 rounded-sm bg-brand px-1.5 py-0.5 text-[11px] font-bold tracking-[0.5px] text-white">
                      {t("productPage.savePercent", { percent: offer.savePercent })}
                    </span>
                  )}
                </span>
                <span className="text-sm font-bold text-brand">{fmt.price(offer.price)}</span>
              </label>
              {mode === "subscription" && (
                <div className="mt-3 flex items-center gap-3 pl-7 text-sm">
                  <span className="text-[#121212]/65">{t("productPage.deliverEvery")}</span>
                  <Select value={String(offer.months)} onValueChange={(v) => v && setMonths(Number(v))}>
                    <SelectTrigger className="h-9 rounded border-[#c4c4c4] bg-white" aria-label={t("productPage.deliverEvery")}>
                      <SelectValue>{(v: string) => t.plural("productPage.everyMonths", Number(v))}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {offers.map((o) => (
                        <SelectItem key={o.months} value={String(o.months)}>
                          {t.plural("productPage.everyMonths", o.months)} · {fmt.price(o.price)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <p className="mt-2 pl-7 text-xs text-[#121212]/60">{t("productPage.subscriptionNote")}</p>
            </div>
          )}
        </fieldset>

        <div>
          <p className="mb-1.5 text-[13px] text-[#121212]/75">{t("product.quantity")}</p>
          <div className="flex items-center gap-3">
            <QuantitySelector value={quantity} onChange={setQuantity} className="h-[42px] w-[142px] justify-between rounded-[2px] border-[#121212]/40 bg-white" />
            <button
              type="button"
              disabled={!variant.available || busy || adding}
              onClick={async () => {
                setAdding(true)
                try {
                  await addToCart(toCartLine(product, variant, purchase), quantity)
                } finally {
                  setAdding(false)
                }
              }}
              className="flex h-[42px] w-[340px] items-center justify-center gap-2 rounded-[2px] bg-brand px-[30px] text-xl font-bold tracking-[1px] text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-[#c8c8c8]"
            >
              {variant.available && <Plus className="size-5" strokeWidth={3} />}
              {!variant.available ? t("product.outOfStock") : adding ? `${t("common.loading")}…` : t("product.addToCart")}
            </button>
          </div>
          <div className="mt-2 flex items-center gap-5">
            <WishlistButton productId={product.id} large variant="ghost" className="h-7 px-0 text-[13px] font-normal text-[#121212]/75 hover:bg-transparent hover:underline" />
            <CompareButton productId={product.id} className="h-7 px-0 text-[13px] font-normal text-[#121212]/75 hover:bg-transparent hover:underline" />
          </div>
        </div>
      </div>

      {keyRows.length > 0 && (
        <div className="mt-6 border-t border-dashed border-[#121212]/30 pt-6">
          <p className="text-lg leading-8 font-bold tracking-[0.6px] text-black">{t("productPage.keyInfo")}</p>
          <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-4">
            {keyRows.map((row) => (
              <div key={row.label}>
                <dt className="text-sm leading-[25px] tracking-[0.6px] text-[#53575a]">{row.label}</dt>
                <dd className="text-base leading-[29px] font-bold tracking-[0.6px] text-black">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  )
}

/** "240 Tablets" ÷ "1 Tablet" → "240"; "30 Servings" stays "30"; undefined when it can't be worked out */
function totalServings(size?: string, servingSize?: string) {
  const count = size?.match(/^(\d+)\s+(\D+)/)
  if (!count) return undefined
  if (/serving/i.test(count[2])) return count[1]
  const per = servingSize?.match(/^(\d+)\s/)
  if (!per) return undefined
  const n = Number(count[1]) / Number(per[1])
  return Number.isInteger(n) ? String(n) : undefined
}

function unique(values: (string | undefined)[]) {
  return [...new Set(values.filter((v): v is string => !!v))]
}

/** Biggest-saving subscription offer (ties → longer interval). */
function bestOffer(v: Variant) {
  return [...v.subscriptions].sort((a, b) => b.savePercent - a.savePercent || b.months - a.months)[0]
}
