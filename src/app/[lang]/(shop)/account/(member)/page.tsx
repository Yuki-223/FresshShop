import { redirect } from "next/navigation"
import { getI18n } from "@/i18n/server"

/** /account opens the order list. */
export default async function AccountPage() {
  const { href } = await getI18n()
  redirect(href("/account/orders"))
}
