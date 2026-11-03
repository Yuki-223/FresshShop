import type { Metadata } from "next"
import { Suspense } from "react"
import { OrderConfirmation } from "@/components/checkout/order-confirmation"
import { getI18n } from "@/i18n/server"

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t("success.pageTitle") }
}

export default function CheckoutSuccessPage() {
  return (
    <div className="container-page py-24">
      <Suspense>
        <OrderConfirmation />
      </Suspense>
    </div>
  )
}
