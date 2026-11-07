import { UserRound } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { getI18n } from "@/i18n/server"
import { getCustomer } from "@/lib/account/actions"

/** Header account icon: "Hi, Name" + link to My Account when signed in, otherwise to the sign-in page. */
export async function AccountLink() {
  const { t } = await getI18n()
  const customer = await getCustomer()
  if (!customer)
    return (
      <Link href="/account/login" aria-label={t("account.signInTitle")} className="vch__icon-btn">
        <UserRound className="size-[22px]" strokeWidth={1.5} />
      </Link>
    )
  return (
    <Link href="/account/orders" aria-label={t("account.myAccount")} className="flex items-center gap-1.5 text-[13px] tracking-[0.3px] text-[#121212] hover:underline">
      <UserRound className="size-[22px]" strokeWidth={1.5} />
      <span className="max-w-[110px] truncate">{t("account.hi", { name: customer.first_name || customer.email.split("@")[0] })}</span>
    </Link>
  )
}

/** Same icon while the sign-in state is loading. */
export async function AccountLinkFallback() {
  const { t } = await getI18n()
  return (
    <Link href="/account/login" aria-label={t("header.account")} className="vch__icon-btn">
      <UserRound className="size-[22px]" strokeWidth={1.5} />
    </Link>
  )
}
