import type { Metadata } from "next"
import { AddressBook } from "@/components/account/address-book"
import { getI18n } from "@/i18n/server"
import { requireCustomer } from "@/lib/account/session"

export const instant = false

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t("account.navAddresses") }
}

export default async function AddressesPage() {
  const customer = await requireCustomer("/account/addresses")
  const { t } = await getI18n()
  return (
    <div>
      <h2 className="text-2xl font-bold text-[#121212]">{t("account.navAddresses")}</h2>
      <AddressBook addresses={customer.addresses} defaultName={{ first: customer.first_name ?? "", last: customer.last_name ?? "" }} />
    </div>
  )
}
