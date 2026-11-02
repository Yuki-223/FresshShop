import type { Metadata } from "next"
import { Suspense } from "react"
import { OrderConfirmation } from "@/components/checkout/order-confirmation"

export const metadata: Metadata = { title: "Order confirmed" }

export default function CheckoutSuccessPage() {
  return (
    <div className="container-page py-24">
      <Suspense>
        <OrderConfirmation />
      </Suspense>
    </div>
  )
}
