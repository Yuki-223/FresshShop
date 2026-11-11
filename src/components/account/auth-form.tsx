"use client"

import { useState } from "react"
import { useI18n } from "@/i18n/client"
import { Link, useRouter } from "@/i18n/navigation"
import { signIn, signUp } from "@/lib/account/actions"
import { mergeGuestHistory } from "@/lib/history/actions"
import { useGuestHistory } from "@/lib/store/history"
import { cn } from "@/lib/utils"
import { AccountInput } from "./fields"

/**
 * Sign in / create account, centred like vitacost.com's sign-in page (theirs signs in with an
 * emailed code; this demo can't send email, so it uses email + password).
 */
export function AuthForm({ next, initialMode }: { next: string; initialMode: "signin" | "create" }) {
  const { t } = useI18n()
  const router = useRouter()
  const [mode, setMode] = useState(initialMode)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [values, setValues] = useState({ firstName: "", lastName: "", email: "", password: "" })
  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) => setValues((v) => ({ ...v, [k]: e.target.value }))
  const create = mode === "create"

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const { firstName, lastName, email, password } = values
    if (!email.trim() || !password || (create && (!firstName.trim() || !lastName.trim()))) return setError(t("account.fieldsRequired"))
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError(t("account.invalidEmail"))
    if (create && password.length < 8) return setError(t("account.passwordTooShort"))
    setBusy(true)
    try {
      const result = create ? await signUp({ firstName, lastName, email, password }) : await signIn(email, password)
      if (!result.ok) {
        setError(result.error === "invalid" ? t("account.invalidLogin") : result.error === "exists" ? t("account.emailExists") : result.error)
        return
      }
      // this browser's guest "recently viewed" goes into the account; kept here if that fails
      const guest = useGuestHistory.getState()
      if (guest.items.length > 0) {
        try {
          if (await mergeGuestHistory(guest.items)) guest.clear()
        } catch {}
      }
      router.replace(next)
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  const tab = (active: boolean) =>
    cn("flex-1 border-b-2 pb-3 text-[15px] tracking-[0.6px] transition-colors", active ? "border-brand font-bold text-[#121212]" : "border-transparent text-[#121212]/60 hover:text-[#121212]")

  return (
    <div className="mx-auto w-full max-w-[400px]">
      <div className="flex" role="tablist">
        <button type="button" role="tab" aria-selected={!create} className={tab(!create)} onClick={() => (setMode("signin"), setError(null))}>
          {t("account.tabSignIn")}
        </button>
        <button type="button" role="tab" aria-selected={create} className={tab(create)} onClick={() => (setMode("create"), setError(null))}>
          {t("account.tabCreate")}
        </button>
      </div>

      <h1 className="mt-8 text-[28px] leading-tight font-bold text-[#121212]">{create ? t("account.createTitle") : t("account.signInTitle")}</h1>
      <p className="mt-1 text-sm tracking-[0.3px] text-[#121212]/65">{create ? t("account.createSub") : t("account.signInSub")}</p>

      <form onSubmit={submit} noValidate className="mt-6 space-y-4">
        {create && (
          <div className="grid grid-cols-2 gap-3">
            <AccountInput id="firstName" label={t("account.firstName")} value={values.firstName} onChange={set("firstName")} autoComplete="given-name" />
            <AccountInput id="lastName" label={t("account.lastName")} value={values.lastName} onChange={set("lastName")} autoComplete="family-name" />
          </div>
        )}
        <AccountInput id="email" type="email" label={t("account.email")} value={values.email} onChange={set("email")} autoComplete="email" />
        <AccountInput
          id="password"
          type="password"
          label={t("account.password")}
          hint={create ? t("account.passwordHint") : undefined}
          value={values.password}
          onChange={set("password")}
          autoComplete={create ? "new-password" : "current-password"}
        />
        {error && (
          <p role="alert" className="rounded-[2px] border border-[#d93025]/30 bg-[#d93025]/5 px-3 py-2 text-sm text-[#b3261e]">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="h-11 w-full rounded-[2px] bg-brand text-base font-bold tracking-[1px] text-white transition-colors hover:bg-brand-dark disabled:bg-[#c8c8c8]"
        >
          {busy ? t("account.working") : create ? t("account.submitCreate") : t("account.submitSignIn")}
        </button>
      </form>

      <div className="mt-6 space-y-2 text-center text-xs tracking-[0.3px] text-[#121212]/60">
        {!create && <p>{t("account.noReset")}</p>}
        <p>
          {t("account.guestCheckout")}{" "}
          <Link href="/category/all" className="text-[#276cbc] hover:underline">
            {t("account.startShopping")}
          </Link>
        </p>
      </div>
    </div>
  )
}
