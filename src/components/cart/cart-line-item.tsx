"use client"

import { Heart, Repeat, X } from "lucide-react"
import { toast } from "sonner"
import { ProductImageClient } from "@/components/product/product-image-client"
import { Price } from "@/components/product/price"
import { CompareIcon } from "@/components/product/product-actions"
import { QuantitySelector } from "@/components/product/quantity-selector"
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

/** One cart line (variant + purchase mode) in the cart drawer and the checkout order summary. */
export function CartLineItem({ item, onNavigate }: { item: CartItem; onNavigate?: () => void }) {
  const { t, locale } = useI18n()
  const setQuantity = useCart((s) => s.setQuantity)
  const remove = useCart((s) => s.remove)
  const toggleWish = useWishlist((s) => s.toggle)
  const toggleCompare = useCompare((s) => s.toggle)
  const inWishlist = useWishlist((s) => s.ids.includes(item.productId))
  const title = item.title[locale]
  const subscription = item.purchase.type === "subscription" ? item.purchase.months : undefined

  return (
    <div className="grid grid-cols-[100px_1fr] gap-x-3 gap-y-0 py-6">
      <div className="flex flex-col gap-3">
        <Link href={`/product/${item.slug}`} onClick={onNavigate} tabIndex={-1} aria-hidden>
          <ProductImageClient src={item.image} alt={title} className="h-[80px] w-[100px]" />
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
            onClick={async () => {
              await remove(item.lineId)
              toast(t("cart.removed", { title }))
            }}
          />
        </div>
      </div>
      <div className="flex min-w-0 flex-col">
        <Link href={`/product/${item.slug}`} onClick={onNavigate} className="line-clamp-2 font-heading text-[15px] font-medium text-ink hover:text-brand">
          {title}
        </Link>
        <dl className="mt-1 grid grid-cols-[65px_1fr] gap-y-1 text-xs">
          <dt className="text-ink-muted">{t("cart.size")}</dt>
          <dd className="truncate text-ink">{item.variantLabel}</dd>
          <dt className="text-ink-muted">{t("cart.purchase")}</dt>
          <dd className={cn("flex items-center gap-1", subscription ? "font-semibold text-brand" : "text-ink")}>
            {subscription && <Repeat className="size-3" />}
            {subscription ? t.plural("cart.subscription", subscription) : t("cart.oneTime")}
          </dd>
        </dl>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <Price price={item.price} oldPrice={item.listPrice} quantity={item.quantity} tone="brand" />
          <QuantitySelector size="sm" value={item.quantity} onChange={(q) => void setQuantity(item.lineId, q)} />
        </div>
      </div>
    </div>
  )
}
