import type { Metadata } from "next"
import { PasswordForm, ProfileForm } from "@/components/account/profile-forms"
import { getI18n } from "@/i18n/server"
import { requireCustomer } from "@/lib/account/session"

export const instant = false

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t("account.navProfile") }
}

export default async function ProfilePage() {
  const customer = await requireCustomer("/account/profile")
  const { t } = await getI18n()
  return (
    <div className="max-w-[560px]">
      <h2 className="text-2xl font-bold text-[#121212]">{t("account.navProfile")}</h2>
      <ProfileForm customer={{ email: customer.email, firstName: customer.first_name ?? "", lastName: customer.last_name ?? "", phone: customer.phone ?? "" }} />
      <PasswordForm />
    </div>
  )
}
