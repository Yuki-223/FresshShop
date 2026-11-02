"use client"

import { Heart, Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useHydrated } from "@/hooks/use-hydrated"
import { useCart } from "@/lib/store/cart"
import { useCompare, useWishlist } from "@/lib/store/wishlist"
import { cn } from "@/lib/utils"
import type { ProductSnapshot, Unit } from "@/types"

export function useAddToCart() {
  const add = useCart((s) => s.add)
  const setOpen = useCart((s) => s.setOpen)
  return (product: ProductSnapshot, quantity = 1, unit?: Unit) => {
    add(product, quantity, unit)
    toast.success(`${product.title} added to cart`, {
      action: { label: "View cart", onClick: () => setOpen(true) },
    })
  }
}

/** Compact "Buy now" button used on every product card. */
export function BuyNowButton({ product, className }: { product: ProductSnapshot; className?: string }) {
  const addToCart = useAddToCart()
  return (
    <Button size="sm" className={className} onClick={() => addToCart(product)}>
      Buy now
    </Button>
  )
}

export function AddToCartButton({
  product,
  quantity,
  unit,
  disabled,
}: {
  product: ProductSnapshot
  quantity: number
  unit: Unit
  disabled?: boolean
}) {
  const addToCart = useAddToCart()
  return (
    <Button disabled={disabled} onClick={() => addToCart(product, quantity, unit)}>
      <Plus className="size-4" strokeWidth={3} />
      {disabled ? "Out of stock" : "Add to cart"}
    </Button>
  )
}

export function WishlistButton({
  productId,
  label = "Add to wish list",
  className,
  variant = "soft",
}: {
  productId: string
  label?: string
  className?: string
  variant?: "soft" | "ghost"
}) {
  const hydrated = useHydrated()
  const active = useWishlist((s) => s.ids.includes(productId)) && hydrated
  const toggle = useWishlist((s) => s.toggle)
  return (
    <Button
      variant={variant}
      size="sm"
      aria-pressed={active}
      className={className}
      onClick={() => toast(toggle(productId) ? "Added to wish list" : "Removed from wish list")}
    >
      <Heart className={cn("size-4", active ? "fill-hot text-hot" : variant === "ghost" ? "text-hot" : "")} />
      {active ? "In wish list" : label}
    </Button>
  )
}

export function CompareButton({ productId, className }: { productId: string; className?: string }) {
  const hydrated = useHydrated()
  const active = useCompare((s) => s.ids.includes(productId)) && hydrated
  const toggle = useCompare((s) => s.toggle)
  return (
    <Button
      variant="ghost"
      size="sm"
      aria-pressed={active}
      className={className}
      onClick={() => toast(toggle(productId) ? "Added to compare" : "Removed from compare")}
    >
      <CompareIcon className="size-4 text-hot" />
      {active ? "Comparing" : "Compare"}
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
