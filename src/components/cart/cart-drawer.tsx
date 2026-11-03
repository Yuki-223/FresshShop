"use client"

import { ShoppingBasket } from "lucide-react"
import { CartLineItem } from "@/components/cart/cart-line-item"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useI18n } from "@/i18n/client"
import { useRouter } from "@/i18n/navigation"
import { cartTotals, useCart } from "@/lib/store/cart"

/** Header cart icon with counter badge; opens the shopping cart drawer. */
export function CartButton() {
  const { t } = useI18n()
  const hydrated = useCart((s) => s.ready)
  const count = useCart((s) => s.cart?.count ?? 0)
  const setOpen = useCart((s) => s.setOpen)
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="relative grid size-10 place-items-center rounded-lg text-ink hover:bg-surface"
      aria-label={hydrated ? t.plural("header.openCartCount", count) : t("header.openCart")}
    >
      <ShoppingBasket className="size-6" strokeWidth={1.75} />
      {hydrated && count > 0 && (
        <span className="absolute bottom-1 left-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-hot px-1 font-heading text-[10px] font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  )
}

export function CartDrawer() {
  const { t, fmt } = useI18n()
  const router = useRouter()
  const { items, isOpen, setOpen, cart, ready: hydrated } = useCart()
  const totals = cartTotals(cart)
  const close = () => setOpen(false)

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="w-[400px] gap-0 p-0 data-[side=right]:sm:max-w-[400px]">
        <SheetHeader className="px-6 pt-8 pb-2">
          <SheetTitle className="font-heading text-2xl font-semibold text-ink">{t("cart.title")}</SheetTitle>
          <SheetDescription className="sr-only">{t("cart.description")}</SheetDescription>
        </SheetHeader>

        {hydrated && items.length > 0 ? (
          <ScrollArea className="min-h-0 flex-1 px-6">
            <div className="divide-y divide-surface-2">
              {items.map((item) => (
                <CartLineItem key={item.productId} item={item} onNavigate={close} />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingBasket className="size-12 text-line" strokeWidth={1.25} />
            <p className="font-heading font-semibold text-ink">{t("cart.empty")}</p>
            <p className="text-sm text-ink-muted">{t("cart.emptyBody")}</p>
          </div>
        )}

        <div className="px-6 pb-6">
          <p className="font-heading text-xs font-semibold text-ink">{t("cart.subtotal")}</p>
          <p className="font-heading text-2xl font-semibold text-ink">{fmt.amount(fmt.toLocal(totals.subtotal))}</p>
        </div>
        <SheetFooter className="flex-row items-center justify-between border-t border-surface-2 px-6 py-5">
          <Button variant="link" onClick={close}>
            {t("cart.continueShopping")}
          </Button>
          <Button
            disabled={!hydrated || items.length === 0}
            onClick={() => {
              close()
              router.push("/checkout")
            }}
          >
            {t("cart.goToCheckout")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
