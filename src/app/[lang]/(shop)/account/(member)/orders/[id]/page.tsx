import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { orderNumber, orderStatusKey } from "@/components/account/order-status"
import { Link } from "@/i18n/navigation"
import { getI18n } from "@/i18n/server"
import { getOrder } from "@/lib/account/actions"
import { requireCustomer } from "@/lib/account/session"

export const instant = false

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t("account.navOrders") + " · " + (await params).id }
}

export default async function OrderPage({ params }: Props) {
  const { id } = await params
  await requireCustomer(`/account/orders/${id}`)
  const { t, fmt } = await getI18n()
  const order = await getOrder(id)
  if (!order) notFound()
  const a = order.shippingAddress
  const rows: [string, string][] = [
    [t("account.subtotal"), fmt.price(order.itemSubtotal)],
    ...(order.discount > 0 ? [[`${t("account.discount")}${order.promoCodes.length ? ` (${order.promoCodes.join(", ")})` : ""}`, `−${fmt.price(order.discount)}`] as [string, string]] : []),
    [t("account.shipping"), order.shipping > 0 ? fmt.price(order.shipping) : t("account.free")],
    ...(order.tax > 0 ? [[t("account.tax"), fmt.price(order.tax)] as [string, string]] : []),
  ]

  return (
    <div>
      <Link href="/account/orders" className="text-sm text-[#276cbc] hover:underline">
        ‹ {t("account.backToOrders")}
      </Link>
      <div className="mt-3 flex items-baseline justify-between">
        <h2 className="text-2xl font-bold text-[#121212]">{t("account.orderNumber", { number: orderNumber(order.displayId) })}</h2>
        <p className="text-sm text-[#121212]/65">
          {t("account.placedOn", { date: fmt.date(order.createdAt) })} · {t(orderStatusKey(order.status))}
        </p>
      </div>

      <table className="mt-6 w-full border-collapse text-sm text-[#121212]">
        <thead>
          <tr className="border-y border-[#e5e5e5] text-left text-[13px] text-[#121212]/65">
            <th className="py-3 font-normal">{t("account.item")}</th>
            <th className="w-20 py-3 text-center font-normal">{t("account.qty")}</th>
            <th className="w-28 py-3 text-right font-normal">{t("account.price")}</th>
            <th className="w-28 py-3 text-right font-normal">{t("account.lineTotal")}</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((i) => (
            <tr key={i.id} className="border-b border-[#e5e5e5]">
              <td className="py-4">
                <div className="flex items-center gap-4">
                  <div className="relative size-16 shrink-0 border border-[#121212]/[0.06] bg-white">
                    {i.thumbnail && <Image src={i.thumbnail} alt="" fill sizes="64px" unoptimized={/^https?:/.test(i.thumbnail)} className="object-contain p-1" />}
                  </div>
                  <div>
                    {i.handle ? (
                      <Link href={`/product/${i.handle}`} className="font-bold hover:underline">
                        {i.title}
                      </Link>
                    ) : (
                      <span className="font-bold">{i.title}</span>
                    )}
                    <p className="mt-0.5 text-[13px] text-[#121212]/65">
                      {i.variant} · {i.subscriptionMonths ? t.plural("productPage.everyMonths", i.subscriptionMonths) : t("account.oneTime")}
                    </p>
                  </div>
                </div>
              </td>
              <td className="py-4 text-center">{i.quantity}</td>
              <td className="py-4 text-right">{fmt.price(i.unitPrice)}</td>
              <td className="py-4 text-right font-bold">{fmt.price(i.unitPrice, i.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-8 grid grid-cols-[1fr_320px] gap-12">
        <dl className="grid grid-cols-2 gap-8 text-sm text-[#121212]">
          <div>
            <dt className="font-bold">{t("account.shipTo")}</dt>
            <dd className="mt-2 leading-relaxed text-[#121212]/75">
              {a ? (
                <>
                  {[a.first_name, a.last_name].filter(Boolean).join(" ")}
                  <br />
                  {a.address_1}
                  <br />
                  {[a.city, a.province, a.postal_code].filter(Boolean).join(", ")}
                  <br />
                  {a.country_code === "cn" ? t("account.countryCN") : t("account.countryUS")}
                  {a.phone && (
                    <>
                      <br />
                      {a.phone}
                    </>
                  )}
                </>
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div>
            <dt className="font-bold">{t("account.delivery")}</dt>
            <dd className="mt-2 text-[#121212]/75">{order.carrier ?? "—"}</dd>
            <dt className="mt-5 font-bold">{t("account.email")}</dt>
            <dd className="mt-2 text-[#121212]/75">{order.email}</dd>
          </div>
        </dl>
        <dl className="space-y-2.5 border border-[#e5e5e5] p-5 text-sm text-[#121212]">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <dt className="text-[#121212]/75">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
          <div className="flex justify-between border-t border-[#e5e5e5] pt-3 text-base font-bold">
            <dt>{t("account.total")}</dt>
            <dd>{fmt.price(order.total)}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
