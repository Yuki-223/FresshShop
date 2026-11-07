import type { Metadata } from "next"
import Image from "next/image"
import { orderNumber, orderStatusKey } from "@/components/account/order-status"
import { ButtonLink } from "@/components/common/button-link"
import { Link } from "@/i18n/navigation"
import { getI18n } from "@/i18n/server"
import { listOrders } from "@/lib/account/actions"
import { requireCustomer } from "@/lib/account/session"

export const instant = false

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t("account.navOrders") }
}

export default async function OrdersPage() {
  await requireCustomer("/account/orders")
  const { t, fmt } = await getI18n()
  const orders = await listOrders()
  return (
    <div>
      <h2 className="text-2xl font-bold text-[#121212]">{t("account.navOrders")}</h2>
      {orders.length === 0 ? (
        <div className="mt-6 border border-dashed border-[#d9d9d9] px-6 py-16 text-center">
          <p className="text-[15px] text-[#121212]/75">{t("account.noOrders")}</p>
          <ButtonLink href="/category/all" className="mt-5">
            {t("account.startShopping")}
          </ButtonLink>
        </div>
      ) : (
        <ul className="mt-6 border-t border-[#e5e5e5]">
          {orders.map((o) => (
            <li key={o.id} className="flex items-center gap-6 border-b border-[#e5e5e5] py-5">
              <div className="w-[230px] shrink-0">
                <Link href={`/account/orders/${o.id}`} className="text-[15px] font-bold text-[#121212] hover:underline">
                  {t("account.orderNumber", { number: orderNumber(o.displayId) })}
                </Link>
                <p className="mt-1 text-[13px] text-[#121212]/60">{t("account.placedOn", { date: fmt.date(o.createdAt) })}</p>
                <p className="mt-1 text-[13px] text-[#121212]/60">
                  {t(orderStatusKey(o.status))} · {t.plural("account.items", o.itemCount)}
                </p>
              </div>
              <div className="flex flex-1 gap-2">
                {o.thumbnails.slice(0, 5).map((src, i) => (
                  <div key={`${src}-${i}`} className="relative size-14 border border-[#121212]/[0.06] bg-white">
                    <Image src={src} alt="" fill sizes="56px" unoptimized={/^https?:/.test(src)} className="object-contain p-1" />
                  </div>
                ))}
                {o.thumbnails.length > 5 && <span className="self-center text-sm text-[#121212]/60">+{o.thumbnails.length - 5}</span>}
              </div>
              <p className="w-28 text-right text-base font-bold text-[#121212]">{fmt.price(o.total)}</p>
              <Link href={`/account/orders/${o.id}`} className="w-28 text-right text-sm text-[#276cbc] hover:underline">
                {t("account.viewOrder")} ›
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
