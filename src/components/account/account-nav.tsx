"use client"

import { toast } from "sonner"
import { useI18n } from "@/i18n/client"
import { Link, usePathname, useRouter } from "@/i18n/navigation"
import { signOut } from "@/lib/account/actions"
import { cn } from "@/lib/utils"

const ITEMS = [
  { href: "/account/orders", label: "account.navOrders" },
  { href: "/account/subscriptions", label: "account.navSubscriptions" },
  { href: "/account/history", label: "account.navHistory" },
  { href: "/account/addresses", label: "account.navAddresses" },
  { href: "/account/profile", label: "account.navProfile" },
] as const

export function AccountNav() {
  const { t } = useI18n()
  const pathname = usePathname()
  const router = useRouter()
  return (
    <nav aria-label={t("account.myAccount")}>
      <ul className="border-t border-[#e5e5e5]">
        {ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <li key={item.href} className="border-b border-[#e5e5e5]">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "block border-l-[3px] py-3.5 pl-4 text-[15px] tracking-[0.3px] transition-colors",
                  active ? "border-brand font-bold text-[#121212]" : "border-transparent text-[#121212]/75 hover:text-[#121212]",
                )}
              >
                {t(item.label)}
              </Link>
            </li>
          )
        })}
        <li className="border-b border-[#e5e5e5]">
          <button
            type="button"
            onClick={async () => {
              await signOut()
              toast(t("account.signedOut"))
              router.push("/")
              router.refresh()
            }}
            className="block w-full border-l-[3px] border-transparent py-3.5 pl-4 text-left text-[15px] tracking-[0.3px] text-[#121212]/75 hover:text-[#121212]"
          >
            {t("account.signOut")}
          </button>
        </li>
      </ul>
    </nav>
  )
}
