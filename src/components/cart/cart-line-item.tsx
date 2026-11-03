"use client"

import { Heart, X } from "lucide-react"
import { toast } from "sonner"
import { PlaceholderImage } from "@/components/common/placeholder-image"
import { Price } from "@/components/product/price"
import { CompareIcon } from "@/components/product/product-actions"
import { QuantityUnitSelector } from "@/components/product/quantity-unit-selector"
import { Rating } from "@/components/product/rating"
import { useI18n } from "@/i18n/client"
import { Link } from "@/i18n/navigation"
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
  const { t, locale } = useI18n()
  const update = useCart((s) => s.update)
  const remove = useCart((s) => s.remove)
  const toggleWish = useWishlist((s) => s.toggle)
  const toggleCompare = useCompare((s) => s.toggle)
  const inWishlist = useWishlist((s) => s.ids.includes(item.productId))
  const title = item.title[locale]

  return (
    <div className="grid grid-cols-[100px_1fr] gap-x-3 gap-y-0 py-6">
      <div className="flex flex-col gap-3">
        <Link href={`/product/${item.slug}`} onClick={onNavigate} tabIndex={-1} aria-hidden>
          <PlaceholderImage className="h-[66px] w-[100px]" />
        </Link>
        <div className="flex flex-col gap-1.5">
          <MiniAction
            icon={<Heart className={cn("size-3", inWishlist ? "fill-hot text-hot" : "text-hot")} />}
            label={t("cart.wishlist")}
            onClick={() => toast(toggleWish(item.productId) ? t("product.addedToWishlist") : t("product.removedFromWishlist"))}
          />
          <MiniAction
            icon={<CompareIcon className="size-3 text-hot" />}
            label={t("cart.compare")}
            onClick={() => toast(toggleCompare(item.productId) ? t("product.addedToCompare") : t("product.removedFromCompare"))}
          />
          <MiniAction
            icon={<X className="size-3 text-ink" />}
            label={t("cart.remove")}
            onClick={() => {
              remove(item.productId)
              toast(t("cart.removed", { title }))
            }}
          />
        </div>
      </div>
      <div className="flex min-w-0 flex-col">
        <Link href={`/product/${item.slug}`} onClick={onNavigate} className="truncate font-heading text-[15px] font-medium text-ink hover:text-brand">
          {title}
        </Link>
        <dl className="mt-1 grid grid-cols-[75px_1fr] gap-y-1 text-xs">
          <dt className="text-ink-muted">{t("cart.farm")}</dt>
          <dd className="truncate text-ink">{item.farm[locale]}</dd>
          <dt className="text-ink-muted">{t("cart.freshness")}</dt>
          <dd className="text-ink">{t.plural("productPage.daysOld", item.freshnessDays)}</dd>
        </dl>
        <Rating value={item.rating} className="mt-2" size="xs" />
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <Price price={item.price} oldPrice={item.oldPrice} quantity={item.quantity} tone="brand" />
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
