import type { Metadata } from "next"
import { Breadcrumbs } from "@/components/common/breadcrumbs"
import { CheckoutForm } from "@/components/checkout/checkout-form"

export const metadata: Metadata = { title: "Checkout" }

export default function CheckoutPage() {
  return (
    <div className="bg-[linear-gradient(to_bottom,var(--surface)_0,var(--surface)_56px,transparent_56px)]">
      <div className="container-page">
        <Breadcrumbs items={[{ label: "Checkout page" }]} />
        <div className="pt-4">
          <CheckoutForm />
        </div>
      </div>
    </div>
  )
}
