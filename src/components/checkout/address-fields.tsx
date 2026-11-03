"use client"

import { Controller, get, useFormContext, useWatch, type Path } from "react-hook-form"
import { Field, TextInput, fieldInputClass } from "@/components/checkout/form-parts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useT } from "@/i18n/client"
import type { MessageKey } from "@/i18n/dictionary"
import type { CheckoutValues } from "@/lib/checkout/schema"
import type { RegionConfig } from "@/lib/checkout/regions"
import { chinaRegions } from "@/lib/data/china-regions"
import { cn } from "@/lib/utils"

type Name = Path<CheckoutValues>
type Prefix = "" | "shipping."

function useFieldError(name: Name): string | undefined {
  const { formState } = useFormContext<CheckoutValues>()
  return (get(formState.errors, name) as { message?: string } | undefined)?.message
}

function TextField({
  name,
  label,
  placeholder,
  wide,
  ...input
}: { name: Name; label: MessageKey; placeholder?: MessageKey; wide?: boolean } & Omit<React.ComponentProps<typeof TextInput>, "name" | "placeholder">) {
  const t = useT()
  const { register } = useFormContext<CheckoutValues>()
  const error = useFieldError(name)
  return (
    <Field id={name} label={t(label)} error={error} className={wide ? "col-span-2" : undefined}>
      <TextInput id={name} placeholder={t(placeholder ?? label)} error={error} {...register(name)} {...input} />
    </Field>
  )
}

function SelectField({
  name,
  label,
  placeholder,
  options,
  onPick,
}: {
  name: Name
  label: MessageKey
  placeholder: MessageKey
  options: string[]
  onPick?: (value: string) => void
}) {
  const t = useT()
  const { control } = useFormContext<CheckoutValues>()
  const error = useFieldError(name)
  return (
    <Field id={name} label={t(label)} error={error}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select
            value={(field.value as string) || null}
            onValueChange={(v) => {
              field.onChange((v as string) ?? "")
              onPick?.((v as string) ?? "")
            }}
            disabled={options.length === 0}
          >
            <SelectTrigger id={name} aria-invalid={!!error || undefined} className={cn(fieldInputClass, "w-full")}>
              <SelectValue placeholder={t(placeholder)} />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </Field>
  )
}

/** First/last name, address, city, country, ZIP — the original design. */
function IntlAddressFields({ prefix, region, withContact }: { prefix: Prefix; region: RegionConfig; withContact: boolean }) {
  const n = (k: string) => `${prefix}${k}` as Name
  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-5">
      <TextField name={n("firstName")} label="checkout.firstName" autoComplete="given-name" />
      <TextField name={n("lastName")} label="checkout.lastName" autoComplete="family-name" />
      {withContact && (
        <>
          <TextField name="email" label="checkout.email" type="email" autoComplete="email" />
          <TextField name="phone" label="checkout.phone" type="tel" autoComplete="tel" />
        </>
      )}
      <TextField name={n("address")} label="checkout.address" autoComplete="street-address" />
      <TextField name={n("city")} label="checkout.city" placeholder="checkout.cityPlaceholder" autoComplete="address-level2" />
      <SelectField name={n("country")} label="checkout.country" placeholder="checkout.countryPlaceholder" options={region.countries} />
      <TextField name={n("zip")} label="checkout.zip" placeholder="checkout.zipPlaceholder" autoComplete="postal-code" />
    </div>
  )
}

/** 收货人 + 手机号 + 省/市/区三级联动 + 详细地址 + 选填邮编. */
function CnAddressFields({ prefix, withContact }: { prefix: Prefix; withContact: boolean }) {
  const n = (k: string) => `${prefix}${k}` as Name
  const { setValue, control } = useFormContext<CheckoutValues>()
  const [province, prefecture] = useWatch({ control, name: [n("province"), n("prefecture")] }) as [string, string]
  const provinceData = chinaRegions.find((p) => p.name === province)
  const cityData = provinceData?.cities.find((c) => c.name === prefecture)

  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-5">
      <TextField name={n("fullName")} label="checkout.fullName" autoComplete="name" />
      {withContact ? <TextField name="phone" label="checkout.phone" type="tel" inputMode="numeric" maxLength={13} autoComplete="tel" /> : <span />}
      <div className="col-span-2 grid grid-cols-3 gap-x-4">
        <SelectField
          name={n("province")}
          label="checkout.province"
          placeholder="checkout.provincePlaceholder"
          options={chinaRegions.map((p) => p.name)}
          onPick={(value) => {
            // reset the dependent levels; auto-select the city for municipalities (北京市, 上海市)
            const cities = chinaRegions.find((p) => p.name === value)?.cities ?? []
            setValue(n("prefecture"), cities.length === 1 ? cities[0].name : "")
            setValue(n("district"), "")
          }}
        />
        <SelectField
          name={n("prefecture")}
          label="checkout.prefecture"
          placeholder="checkout.prefecturePlaceholder"
          options={provinceData?.cities.map((c) => c.name) ?? []}
          onPick={() => setValue(n("district"), "")}
        />
        <SelectField name={n("district")} label="checkout.district" placeholder="checkout.districtPlaceholder" options={cityData?.districts ?? []} />
      </div>
      <TextField name={n("address")} label="checkout.address" autoComplete="street-address" wide />
      {withContact && <TextField name="email" label="checkout.email" type="email" autoComplete="email" />}
      <TextField name={n("zip")} label="checkout.zip" placeholder="checkout.zipPlaceholder" inputMode="numeric" maxLength={6} autoComplete="postal-code" />
    </div>
  )
}

/** Renders the address block for the current market. `prefix="shipping."` reuses it for "ship to a different address". */
export function AddressFields({ region, prefix = "", withContact = prefix === "" }: { region: RegionConfig; prefix?: Prefix; withContact?: boolean }) {
  return region.addressMode === "cn" ? (
    <CnAddressFields prefix={prefix} withContact={withContact} />
  ) : (
    <IntlAddressFields prefix={prefix} region={region} withContact={withContact} />
  )
}
