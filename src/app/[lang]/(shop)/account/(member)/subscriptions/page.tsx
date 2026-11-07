import type { Metadata } from "next"
import Image from "next/image"
import { orderNumber } from "@/components/account/order-status"
import { Link } from "@/i18n/navigation"
import { getI18n } from "@/i18n/server"
import { listSubscriptions } from "@/lib/account/actions"
import { requireCustomer } from "@/lib/account/session"

export const instant = false

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t("account.navSubscriptions") }
}

/** Subscription lines of the customer's orders — read-only (demo: nothing recurs). */
export default async function SubscriptionsPage() {
  await requireCustomer("/account/subscriptions")
  const { t, fmt } = await getI18n()
  const subs = await listSubscriptions()
  return (
    <div>
      <h2 className="text-2xl font-bold text-[#121212]">{t("account.navSubscriptions")}</h2>
      <p className="mt-2 rounded-[2px] border border-[#e5e5e5] bg-[#f7f7f5] px-4 py-3 text-sm text-[#121212]/75">{t("account.subsNote")}</p>
      {subs.length === 0 ? (
        <div className="mt-6 border border-dashed border-[#d9d9d9] px-6 py-16 text-center text-[15px] text-[#121212]/75">{t("account.noSubs")}</div>
      ) : (
        <ul className="mt-6 border-t border-[#e5e5e5]">
          {subs.map((s) => (
            <li key={s.key} className="flex items-center gap-5 border-b border-[#e5e5e5] py-5">
              <div className="relative size-20 shrink-0 border border-[#121212]/[0.06] bg-white">
                {s.thumbnail && <Image src={s.thumbnail} alt="" fill sizes="80px" unoptimized={/^https?:/.test(s.thumbnail)} className="object-contain p-1.5" />}
              </div>
              <div className="flex-1">
                {s.handle ? (
                  <Link href={`/product/${s.handle}`} className="text-[15px] font-bold text-[#121212] hover:underline">
                    {s.title}
                  </Link>
                ) : (
                  <span className="text-[15px] font-bold text-[#121212]">{s.title}</span>
                )}
                <p className="mt-1 text-[13px] text-[#121212]/65">
                  {s.variant} · ×{s.quantity}
                </p>
                <p className="mt-1 text-[13px] text-[#121212]/65">
                  {t("account.since", { date: fmt.date(s.startedAt), order: "" })}
                  <Link href={`/account/orders/${s.orderId}`} className="text-[#276cbc] hover:underline">
                    {orderNumber(s.orderDisplayId)}
                  </Link>
                </p>
              </div>
              <dl className="w-40 text-sm">
                <dt className="text-[13px] text-[#121212]/65">{t("account.deliveredEvery")}</dt>
                <dd className="font-bold text-[#121212]">{t.plural("productPage.everyMonths", s.months)}</dd>
              </dl>
              <dl className="w-36 text-right text-sm">
                <dt className="text-[13px] text-[#121212]/65">{t("account.subscriptionPrice")}</dt>
                <dd className="font-bold text-brand">{fmt.price(s.price)}</dd>
              </dl>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
