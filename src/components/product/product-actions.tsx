"use client"

import { Heart, Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useHydrated } from "@/hooks/use-hydrated"
import { useI18n } from "@/i18n/client"
import { useCart } from "@/lib/store/cart"
import { useCompare, useWishlist } from "@/lib/store/wishlist"
import { cn } from "@/lib/utils"
import type { CartLineInput } from "@/types"

export function useAddToCart() {
  const { t, locale } = useI18n()
  const add = useCart((s) => s.add)
  const setOpen = useCart((s) => s.setOpen)
  return async (line: CartLineInput, quantity = 1) => {
    try {
      await add(line, quantity)
      toast.success(t("product.addedToCart", { title: line.title[locale] }), {
        action: { label: t("product.viewCart"), onClick: () => setOpen(true) },
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error))
    }
  }
}

/** Compact "Buy now" button used on every product card. */
export function BuyNowButton({ line, disabled, className }: { line: CartLineInput; disabled?: boolean; className?: string }) {
  const { t } = useI18n()
  const addToCart = useAddToCart()
  const pending = useCart((s) => s.pending)
  return (
    <Button size="sm" className={className} disabled={disabled || pending} onClick={() => addToCart(line)}>
      {disabled ? t("product.outOfStock") : t("product.buyNow")}
    </Button>
  )
}

export function AddToCartButton({ line, quantity, disabled }: { line: CartLineInput; quantity: number; disabled?: boolean }) {
  const { t } = useI18n()
  const addToCart = useAddToCart()
  const pending = useCart((s) => s.pending)
  return (
    <Button disabled={disabled || pending} onClick={() => addToCart(line, quantity)}>
      <Plus className="size-4" strokeWidth={3} />
      {disabled ? t("product.outOfStock") : t("product.addToCart")}
    </Button>
  )
}

export function WishlistButton({
  productId,
  large,
  className,
  variant = "soft",
}: {
  productId: string
  /** use the longer "Add to my wish list" label */
  large?: boolean
  className?: string
  variant?: "soft" | "ghost"
}) {
  const { t } = useI18n()
  const hydrated = useHydrated()
  const active = useWishlist((s) => s.ids.includes(productId)) && hydrated
  const toggle = useWishlist((s) => s.toggle)
  return (
    <Button
      variant={variant}
      size="sm"
      aria-pressed={active}
      className={className}
      onClick={() => toast(toggle(productId) ? t("product.addedToWishlist") : t("product.removedFromWishlist"))}
    >
      <Heart className={cn("size-4", active ? "fill-hot text-hot" : variant === "ghost" ? "text-hot" : "")} />
      {active ? t("product.inWishlist") : large ? t("product.addToMyWishlist") : t("product.addToWishlist")}
    </Button>
  )
}

export function CompareButton({ productId, className }: { productId: string; className?: string }) {
  const { t } = useI18n()
  const hydrated = useHydrated()
  const active = useCompare((s) => s.ids.includes(productId)) && hydrated
  const toggle = useCompare((s) => s.toggle)
  return (
    <Button
      variant="ghost"
      size="sm"
      aria-pressed={active}
      className={className}
      onClick={() => toast(toggle(productId) ? t("product.addedToCompare") : t("product.removedFromCompare"))}
    >
      <CompareIcon className="size-4 text-hot" />
      {active ? t("product.comparing") : t("product.compare")}
    </Button>
  )
}

export function CompareIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden>
      <rect x="2" y="2" width="4" height="4" rx="1" />
      <rect x="2" y="10" width="4" height="4" rx="1" />
      <path d="M9 4h5M9 12h5M9 8h3" strokeLinecap="round" />
    </svg>
  )
}
