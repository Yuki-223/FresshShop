"use client"

import { useState } from "react"
import { Price } from "@/components/product/price"
import { AddToCartButton, CompareButton, WishlistButton } from "@/components/product/product-actions"
import { QuantitySelector } from "@/components/product/quantity-selector"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useI18n } from "@/i18n/client"
import { defaultVariant, priceFor, toCartLine } from "@/lib/product"
import { cn } from "@/lib/utils"
import type { Product, PurchaseMode, Variant } from "@/types"

function OptionChips({ label, values, value, onChange, isAvailable }: {
  label: string
  values: string[]
  value?: string
  onChange: (v: string) => void
  isAvailable: (v: string) => boolean
}) {
  return (
    <fieldset>
      <legend className="mb-2 font-heading text-xs font-semibold text-ink">
        {label}: <span className="font-normal text-ink-soft">{value}</span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {values.map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={v === value}
            onClick={() => onChange(v)}
            className={cn(
              "h-9 rounded-xl border px-3 text-sm transition-colors",
              v === value ? "border-brand bg-brand-soft font-semibold text-brand-dark" : "border-line bg-surface text-ink hover:border-brand-light",
              !isAvailable(v) && "text-ink-muted line-through",
            )}
          >
            {v}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

/** Size/flavor pickers, one-time vs subscription, quantity and add to cart. */
export function PurchasePanel({ product }: { product: Product }) {
  const { t, fmt } = useI18n()
  const [variant, setVariant] = useState<Variant>(() => defaultVariant(product))
  const [mode, setMode] = useState<"once" | "subscription">("once")
  const [months, setMonths] = useState<number>(() => bestOffer(defaultVariant(product))?.months ?? 1)
  const [quantity, setQuantity] = useState(1)

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
    if (!next.subscriptions.some((o) => o.months === months)) setMonths(bestOffer(next)?.months ?? 1)
    if (!next.subscriptions.length) setMode("once")
  }

  return (
    <div className="space-y-6">
      {sizes.length > 1 && (
        <OptionChips
          label={t("productPage.size")}
          values={sizes}
          value={variant.size}
          onChange={(s) => pick(s, variant.flavor)}
          isAvailable={(s) => product.variants.some((v) => v.size === s && v.available)}
        />
      )}
      {flavors.length > 1 && (
        <OptionChips
          label={t("productPage.flavor")}
          values={flavors}
          value={variant.flavor}
          onChange={(f) => pick(variant.size, f)}
          isAvailable={(f) => product.variants.some((v) => v.flavor === f && v.available)}
        />
      )}

      <fieldset className="space-y-3">
        <legend className="mb-2 font-heading text-xs font-semibold text-ink">{t("productPage.purchaseOption")}</legend>
        <label className={cn("flex cursor-pointer items-center gap-3 rounded-xl border p-4", mode === "once" ? "border-brand-light bg-white" : "border-line bg-surface")}>
          <input type="radio" name="purchase" checked={mode === "once"} onChange={() => setMode("once")} className="size-4 accent-[var(--brand)]" />
          <span className="flex-1 font-heading text-sm font-semibold text-ink">{t("productPage.buyOnce")}</span>
          <span className="font-heading text-sm font-semibold text-ink">{fmt.price(variant.price)}</span>
        </label>
        {offer && (
          <div className={cn("rounded-xl border p-4", mode === "subscription" ? "border-brand-light bg-white" : "border-line bg-surface")}>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="radio"
                name="purchase"
                checked={mode === "subscription"}
                onChange={() => setMode("subscription")}
                className="size-4 accent-[var(--brand)]"
              />
              <span className="flex-1 font-heading text-sm font-semibold text-ink">
                {t("productPage.subscribe")}
                {offer.savePercent > 0 && <span className="ml-2 rounded-lg bg-brand-soft px-2 py-0.5 text-xs text-brand">{t("productPage.savePercent", { percent: offer.savePercent })}</span>}
              </span>
              <span className="font-heading text-sm font-semibold text-brand">{fmt.price(offer.price)}</span>
            </label>
            {mode === "subscription" && (
              <div className="mt-3 flex items-center gap-3 pl-7 text-sm">
                <span className="text-ink-muted">{t("productPage.deliverEvery")}</span>
                <Select value={String(offer.months)} onValueChange={(v) => v && setMonths(Number(v))}>
                  <SelectTrigger className="h-9 rounded-xl bg-surface" aria-label={t("productPage.deliverEvery")}>
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
            <p className="mt-2 pl-7 text-xs text-ink-muted">{t("productPage.subscriptionNote")}</p>
          </div>
        )}
      </fieldset>

      <div className="flex items-center justify-between gap-4 rounded-xl border border-surface-2 p-4">
        <Price price={unitPrice} oldPrice={purchase.type === "subscription" ? variant.price : undefined} quantity={quantity} size="lg" tone="brand" />
        <div className="flex items-center gap-4">
          <QuantitySelector value={quantity} onChange={setQuantity} />
          <AddToCartButton line={toCartLine(product, variant, purchase)} quantity={quantity} disabled={!variant.available} />
        </div>
      </div>
      <p className="text-xs text-ink-muted">
        SKU {variant.sku} · {variant.label}
      </p>
      <div className="flex items-center gap-4">
        <WishlistButton productId={product.id} large variant="ghost" />
        <CompareButton productId={product.id} />
      </div>
    </div>
  )
}

function unique(values: (string | undefined)[]) {
  return [...new Set(values.filter((v): v is string => !!v))]
}

/** Biggest-saving subscription offer (ties → longer interval). */
function bestOffer(v: Variant) {
  return [...v.subscriptions].sort((a, b) => b.savePercent - a.savePercent || b.months - a.months)[0]
}
