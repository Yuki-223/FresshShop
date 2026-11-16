import type { Metadata } from "next"
import { Suspense } from "react"
import { OrdersList } from "@/components/account/orders-list"
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
  const { t } = await getI18n()
  const orders = await listOrders()
  return (
    <div>
      <h2 className="text-2xl font-bold text-[#121212]">{t("account.navOrders")}</h2>
      {/* the tab list reads ?stage= from the URL, so it streams in after the static shell */}
      <Suspense fallback={<div className="mt-4 h-10 border-b border-[#e5e5e5]" />}>
        <OrdersList orders={orders} />
      </Suspense>
    </div>
  )
}
