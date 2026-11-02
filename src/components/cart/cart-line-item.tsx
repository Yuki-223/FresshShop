"use client"

import Link from "next/link"
import { Heart, X } from "lucide-react"
import { toast } from "sonner"
import { PlaceholderImage } from "@/components/common/placeholder-image"
import { Price } from "@/components/product/price"
import { CompareIcon } from "@/components/product/product-actions"
import { QuantityUnitSelector } from "@/components/product/quantity-unit-selector"
import { Rating } from "@/components/product/rating"
import { useCart } from "@/lib/store/cart"
import { useCompare, useWishlist } from "@/lib/store/wishlist"
import { cn } from "@/lib/utils"
import type { CartItem } from "@/types"

function MiniAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink">
      {icon}
      {label}
    </button>
  )
}

/** One product row inside the cart drawer and the checkout order summary. */
export function CartLineItem({ item, onNavigate }: { item: CartItem; onNavigate?: () => void }) {
  const update = useCart((s) => s.update)
  const remove = useCart((s) => s.remove)
  const toggleWish = useWishlist((s) => s.toggle)
  const toggleCompare = useCompare((s) => s.toggle)
  const inWishlist = useWishlist((s) => s.ids.includes(item.productId))

  return (
    <div className="grid grid-cols-[100px_1fr] gap-x-3 gap-y-0 py-6">
      <div className="flex flex-col gap-3">
        <Link href={`/product/${item.slug}`} onClick={onNavigate} tabIndex={-1} aria-hidden>
          <PlaceholderImage className="h-[66px] w-[100px]" />
        </Link>
        <div className="flex flex-col gap-1.5">
          <MiniAction
            icon={<Heart className={cn("size-3", inWishlist ? "fill-hot text-hot" : "text-hot")} />}
            label="Wishlist"
            onClick={() => toast(toggleWish(item.productId) ? "Added to wish list" : "Removed from wish list")}
          />
          <MiniAction
            icon={<CompareIcon className="size-3 text-hot" />}
            label="Compare"
            onClick={() => toast(toggleCompare(item.productId) ? "Added to compare" : "Removed from compare")}
          />
          <MiniAction
            icon={<X className="size-3 text-ink" />}
            label="Remove"
            onClick={() => {
              remove(item.productId)
              toast(`${item.title} removed from cart`)
            }}
          />
        </div>
      </div>
      <div className="flex min-w-0 flex-col">
        <Link href={`/product/${item.slug}`} onClick={onNavigate} className="truncate font-heading text-[15px] font-medium text-ink hover:text-brand">
          {item.title}
        </Link>
        <dl className="mt-1 grid grid-cols-[75px_1fr] gap-y-1 text-xs">
          <dt className="text-ink-muted">Farm:</dt>
          <dd className="truncate text-ink">{item.farm}</dd>
          <dt className="text-ink-muted">Freshness:</dt>
          <dd className="text-ink">
            {item.freshnessDays} day{item.freshnessDays > 1 ? "s" : ""} old
          </dd>
        </dl>
        <Rating value={item.rating} className="mt-2" size="xs" />
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <Price price={item.price * item.quantity} oldPrice={item.oldPrice ? item.oldPrice * item.quantity : undefined} tone="brand" />
          <QuantityUnitSelector
            size="sm"
            quantity={item.quantity}
            unit={item.unit}
            units={item.units}
            onQuantityChange={(quantity) => update(item.productId, { quantity })}
            onUnitChange={(unit) => update(item.productId, { unit })}
          />
        </div>
      </div>
    </div>
  )
}
