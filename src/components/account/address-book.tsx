"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useI18n } from "@/i18n/client"
import { useRouter } from "@/i18n/navigation"
import { deleteAddress, saveAddress, setDefaultAddress } from "@/lib/account/actions"
import type { AddressInput, CustomerAddress } from "@/lib/account/types"
import { AccountInput, OutlineButton, PrimaryButton } from "./fields"

const empty = (name: { first: string; last: string }, country: "us" | "cn"): AddressInput => ({
  first_name: name.first,
  last_name: name.last,
  address_1: "",
  city: "",
  province: "",
  postal_code: "",
  country_code: country,
  phone: "",
})

function AddressForm({
  initial,
  showDefault,
  onDone,
  id,
}: {
  initial: AddressInput
  showDefault: boolean
  onDone: () => void
  id?: string
}) {
  const { t } = useI18n()
  const router = useRouter()
  const [v, setV] = useState(initial)
  const [makeDefault, setMakeDefault] = useState(showDefault)
  const [busy, setBusy] = useState(false)
  const set = (k: keyof AddressInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setV((x) => ({ ...x, [k]: e.target.value }))
  const p = id ?? "new"
  return (
    <form
      className="space-y-4 border border-[#e5e5e5] p-5"
      onSubmit={async (e) => {
        e.preventDefault()
        if (!v.first_name.trim() || !v.address_1.trim() || !v.city.trim()) return toast.error(t("account.fieldsRequired"))
        setBusy(true)
        try {
          const r = await saveAddress(v, id, makeDefault || undefined)
          if (!r.ok) return toast.error(r.error)
          toast.success(t("account.saved"))
          onDone()
          router.refresh()
        } finally {
          setBusy(false)
        }
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <AccountInput id={`${p}-first`} label={t("account.firstName")} value={v.first_name} onChange={set("first_name")} autoComplete="given-name" />
        <AccountInput id={`${p}-last`} label={t("account.lastName")} value={v.last_name} onChange={set("last_name")} autoComplete="family-name" />
      </div>
      <AccountInput id={`${p}-address`} label={t("account.address")} value={v.address_1} onChange={set("address_1")} autoComplete="street-address" />
      <div className="grid grid-cols-3 gap-3">
        <AccountInput id={`${p}-city`} label={t("account.city")} value={v.city} onChange={set("city")} autoComplete="address-level2" />
        <AccountInput id={`${p}-province`} label={t("account.province")} value={v.province ?? ""} onChange={set("province")} autoComplete="address-level1" />
        <AccountInput id={`${p}-zip`} label={t("account.zip")} value={v.postal_code ?? ""} onChange={set("postal_code")} autoComplete="postal-code" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${p}-country`} className="mb-1.5 block text-[13px] font-bold tracking-[0.3px] text-[#121212]">
            {t("account.country")}
          </label>
          <select
            id={`${p}-country`}
            value={v.country_code}
            onChange={set("country_code")}
            className="h-11 w-full rounded border border-[#c4c4c4] bg-white px-3 text-[15px] text-[#121212] outline-none focus:border-[#121212]"
          >
            <option value="us">{t("account.countryUS")}</option>
            <option value="cn">{t("account.countryCN")}</option>
          </select>
        </div>
        <AccountInput id={`${p}-phone`} type="tel" label={t("account.phone")} value={v.phone ?? ""} onChange={set("phone")} autoComplete="tel" />
      </div>
      <label className="flex items-center gap-2 text-sm text-[#121212]">
        <input type="checkbox" checked={makeDefault} onChange={(e) => setMakeDefault(e.target.checked)} className="size-4 accent-[var(--brand)]" />
        {t("account.useAsDefault")}
      </label>
      <div className="flex gap-3">
        <PrimaryButton type="submit" disabled={busy}>
          {busy ? t("account.working") : t("account.save")}
        </PrimaryButton>
        <OutlineButton type="button" onClick={onDone}>
          {t("account.cancel")}
        </OutlineButton>
      </div>
    </form>
  )
}

export function AddressBook({ addresses, defaultName }: { addresses: CustomerAddress[]; defaultName: { first: string; last: string } }) {
  const { t, locale } = useI18n()
  const router = useRouter()
  const [editing, setEditing] = useState<string | null>(null) // address id, "new" or null
  const sorted = [...addresses].sort((a, b) => Number(b.is_default_shipping) - Number(a.is_default_shipping))

  return (
    <div className="mt-6 space-y-4">
      {sorted.length === 0 && editing !== "new" && <p className="text-[15px] text-[#121212]/75">{t("account.noAddresses")}</p>}
      <div className="grid grid-cols-2 gap-4">
        {sorted.map((a) =>
          editing === a.id ? (
            <div key={a.id} className="col-span-2">
              <AddressForm
                id={a.id}
                showDefault={a.is_default_shipping}
                onDone={() => setEditing(null)}
                initial={{
                  first_name: a.first_name ?? "",
                  last_name: a.last_name ?? "",
                  address_1: a.address_1 ?? "",
                  city: a.city ?? "",
                  province: a.province ?? "",
                  postal_code: a.postal_code ?? "",
                  country_code: a.country_code === "cn" ? "cn" : "us",
                  phone: a.phone ?? "",
                }}
              />
            </div>
          ) : (
            <div key={a.id} className="flex flex-col border border-[#e5e5e5] p-5 text-sm text-[#121212]">
              <p className="flex items-center gap-2 font-bold">
                {[a.first_name, a.last_name].filter(Boolean).join(" ")}
                {a.is_default_shipping && <span className="rounded-sm bg-brand px-1.5 py-0.5 text-[11px] font-bold tracking-[0.5px] text-white">{t("account.defaultBadge")}</span>}
              </p>
              <p className="mt-2 flex-1 leading-relaxed text-[#121212]/75">
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
              </p>
              <div className="mt-4 flex gap-4 text-[13px]">
                <button type="button" className="text-[#276cbc] hover:underline" onClick={() => setEditing(a.id)}>
                  {t("account.editAddress")}
                </button>
                <button
                  type="button"
                  className="text-[#276cbc] hover:underline"
                  onClick={async () => {
                    if (!window.confirm(t("account.deleteConfirm"))) return
                    const r = await deleteAddress(a.id)
                    if (!r.ok) return toast.error(r.error)
                    toast(t("account.addressDeleted"))
                    router.refresh()
                  }}
                >
                  {t("account.deleteAddress")}
                </button>
                {!a.is_default_shipping && (
                  <button
                    type="button"
                    className="text-[#276cbc] hover:underline"
                    onClick={async () => {
                      const r = await setDefaultAddress(a.id)
                      if (!r.ok) return toast.error(r.error)
                      router.refresh()
                    }}
                  >
                    {t("account.setDefault")}
                  </button>
                )}
              </div>
            </div>
          ),
        )}
      </div>
      {editing === "new" ? (
        <AddressForm initial={empty(defaultName, locale === "zh" ? "cn" : "us")} showDefault={addresses.length === 0} onDone={() => setEditing(null)} />
      ) : (
        <OutlineButton type="button" onClick={() => setEditing("new")}>
          + {t("account.addAddress")}
        </OutlineButton>
      )}
    </div>
  )
}
