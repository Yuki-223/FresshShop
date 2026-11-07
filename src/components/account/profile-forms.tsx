"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useI18n } from "@/i18n/client"
import { useRouter } from "@/i18n/navigation"
import { changePassword, updateProfile } from "@/lib/account/actions"
import { AccountInput, PrimaryButton } from "./fields"

export function ProfileForm({ customer }: { customer: { email: string; firstName: string; lastName: string; phone: string } }) {
  const { t } = useI18n()
  const router = useRouter()
  const [v, setV] = useState(customer)
  const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement>) => setV((x) => ({ ...x, [k]: e.target.value }))
  return (
    <form
      className="mt-6 space-y-4"
      onSubmit={async (e) => {
        e.preventDefault()
        if (!v.firstName.trim() || !v.lastName.trim()) return toast.error(t("account.fieldsRequired"))
        setBusy(true)
        try {
          const r = await updateProfile(v)
          if (!r.ok) return toast.error(r.error)
          toast.success(t("account.saved"))
          router.refresh()
        } finally {
          setBusy(false)
        }
      }}
    >
      <h3 className="text-lg font-semibold text-[#121212]">{t("account.personalInfo")}</h3>
      <div className="grid grid-cols-2 gap-3">
        <AccountInput id="firstName" label={t("account.firstName")} value={v.firstName} onChange={set("firstName")} autoComplete="given-name" />
        <AccountInput id="lastName" label={t("account.lastName")} value={v.lastName} onChange={set("lastName")} autoComplete="family-name" />
      </div>
      <AccountInput id="email" label={t("account.email")} value={v.email} disabled hint={t("account.emailReadonly")} />
      <AccountInput id="phone" type="tel" label={t("account.phone")} value={v.phone} onChange={set("phone")} autoComplete="tel" />
      <PrimaryButton type="submit" disabled={busy}>
        {busy ? t("account.working") : t("account.saveChanges")}
      </PrimaryButton>
    </form>
  )
}

export function PasswordForm() {
  const { t } = useI18n()
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [busy, setBusy] = useState(false)
  return (
    <form
      className="mt-10 space-y-4 border-t border-[#e5e5e5] pt-8"
      onSubmit={async (e) => {
        e.preventDefault()
        if (!current || !next) return toast.error(t("account.fieldsRequired"))
        if (next.length < 8) return toast.error(t("account.passwordTooShort"))
        setBusy(true)
        try {
          const r = await changePassword(current, next)
          if (!r.ok) return toast.error(r.error === "wrongPassword" ? t("account.wrongPassword") : r.error)
          setCurrent("")
          setNext("")
          toast.success(t("account.passwordChanged"))
        } finally {
          setBusy(false)
        }
      }}
    >
      <h3 className="text-lg font-semibold text-[#121212]">{t("account.changePassword")}</h3>
      <AccountInput id="currentPassword" type="password" label={t("account.currentPassword")} value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" />
      <AccountInput id="newPassword" type="password" label={t("account.newPassword")} hint={t("account.passwordHint")} value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" />
      <PrimaryButton type="submit" disabled={busy}>
        {busy ? t("account.working") : t("account.changePassword")}
      </PrimaryButton>
    </form>
  )
}
