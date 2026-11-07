import { AccountNav } from "@/components/account/account-nav"
import { getI18n } from "@/i18n/server"
import { getCustomer } from "@/lib/account/actions"

// depends on the visitor's sign-in cookie
export const instant = false

/** "My Account": left menu + the selected section. Each page checks the sign-in itself (requireCustomer). */
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const { t } = await getI18n()
  const customer = await getCustomer()
  return (
    <div className="container-page pt-10 pb-20">
      <div className="border-b border-[#e5e5e5] pb-5">
        <h1 className="text-[28px] leading-tight font-bold text-[#121212]">{t("account.myAccount")}</h1>
        {customer && (
          <p className="mt-1 text-sm tracking-[0.3px] text-[#121212]/65">
            {t("account.hi", { name: customer.first_name || customer.email })} · {customer.email}
          </p>
        )}
      </div>
      <div className="mt-8 grid grid-cols-[220px_1fr] gap-12">
        <AccountNav />
        <section className="min-w-0">{children}</section>
      </div>
    </div>
  )
}
