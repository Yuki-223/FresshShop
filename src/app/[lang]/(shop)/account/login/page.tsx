import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { AuthForm } from "@/components/account/auth-form"
import { localizeHref } from "@/i18n/config"
import { getI18n } from "@/i18n/server"
import { getCustomer } from "@/lib/account/actions"
import { safeNext } from "@/lib/account/session"

// depends on the visitor's sign-in cookie
export const instant = false

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t("account.signInTitle") }
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { locale } = await getI18n()
  const sp = await searchParams
  const next = safeNext(sp.next)
  if (await getCustomer()) redirect(localizeHref(next, locale))
  return (
    <div className="container-page py-16">
      <AuthForm next={next} initialMode={sp.mode === "create" ? "create" : "signin"} />
    </div>
  )
}
