import type { Metadata } from "next"
import { ButtonLink } from "@/components/common/button-link"
import { HistoryList } from "@/components/history/history-list"
import { getI18n } from "@/i18n/server"
import { requireCustomer } from "@/lib/account/session"
import { listHistory } from "@/lib/history/actions"

export const instant = false

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t("account.navHistory") }
}

export default async function HistoryPage() {
  await requireCustomer("/account/history")
  const { t, locale } = await getI18n()
  const entries = await listHistory(locale)
  return (
    <div>
      <h2 className="text-2xl font-bold text-[#121212]">{t("account.navHistory")}</h2>
      {entries.length === 0 ? (
        <div className="mt-6 border border-dashed border-[#d9d9d9] px-6 py-16 text-center">
          <p className="text-[15px] text-[#121212]/75">{t("history.empty")}</p>
          <ButtonLink href="/category/all" className="mt-5">
            {t("account.startShopping")}
          </ButtonLink>
        </div>
      ) : (
        <div className="mt-2">
          <HistoryList entries={entries} />
        </div>
      )}
    </div>
  )
}
