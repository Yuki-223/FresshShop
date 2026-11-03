import type { Metadata } from "next"
import { Breadcrumbs } from "@/components/common/breadcrumbs"
import { CheckoutForm } from "@/components/checkout/checkout-form"
import { getI18n } from "@/i18n/server"

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t("checkout.pageTitle") }
}

export default async function CheckoutPage() {
  const { t } = await getI18n()
  return (
    <div className="bg-[linear-gradient(to_bottom,var(--surface)_0,var(--surface)_56px,transparent_56px)]">
      <div className="container-page">
        <Breadcrumbs items={[{ label: t("checkout.breadcrumb") }]} />
        <div className="pt-4">
          <CheckoutForm />
        </div>
      </div>
    </div>
  )
}
