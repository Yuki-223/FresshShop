import { z } from "zod"
import type { MessageKey, Translator } from "@/i18n/dictionary"
import type { RegionConfig } from "@/lib/checkout/regions"

const address = {
  // intl
  firstName: z.string(),
  lastName: z.string(),
  city: z.string(),
  country: z.string(),
  // cn
  fullName: z.string(),
  province: z.string(),
  prefecture: z.string(),
  district: z.string(),
  // shared
  address: z.string(),
  zip: z.string(),
}
type AddressValues = { [K in keyof typeof address]: string }

/**
 * One schema shape for every market; which fields are required (and the
 * error messages) depend on the region config and the current language.
 */
export function makeCheckoutSchema(region: RegionConfig, t: Translator) {
  return z
    .object({
      ...address,
      email: z.string(),
      phone: z.string(),
      shipToDifferent: z.boolean(),
      shipping: z.object(address).partial().optional(),
      shippingMethod: z.string(),
      paymentMethod: z.string(),
      cardNumber: z.string(),
      cardHolder: z.string(),
      cardExpiry: z.string(),
      cardCvc: z.string(),
      notes: z.string().max(500, t("validation.notesTooLong")),
      marketing: z.boolean(),
      terms: z.boolean(),
    })
    .superRefine((v, ctx) => {
      const issue = (path: (string | number)[], message: string) => ctx.addIssue({ code: "custom", path, message })
      const required = (path: (string | number)[], value: string | undefined, label: MessageKey) => {
        if (!value?.trim()) {
          issue(path, t("validation.required", { field: t(label) }))
          return false
        }
        return true
      }

      const checkAddress = (a: Partial<AddressValues>, prefix: string[]) => {
        const p = (k: string) => [...prefix, k]
        if (region.addressMode === "cn") {
          required(p("fullName"), a.fullName, "checkout.fullName")
          required(p("province"), a.province, "checkout.province")
          required(p("prefecture"), a.prefecture, "checkout.prefecture")
          required(p("district"), a.district, "checkout.district")
        } else {
          required(p("firstName"), a.firstName, "checkout.firstName")
          required(p("lastName"), a.lastName, "checkout.lastName")
          required(p("city"), a.city, "checkout.city")
          required(p("country"), a.country, "checkout.country")
        }
        required(p("address"), a.address, "checkout.address")
        const zip = a.zip?.trim() ?? ""
        if (region.zipRequired) {
          if (required(p("zip"), zip, "checkout.zip") && !region.zipPattern.test(zip)) issue(p("zip"), t("validation.zip"))
        } else if (zip && !region.zipPattern.test(zip)) issue(p("zip"), t("validation.zip"))
      }

      checkAddress(v, [])
      if (v.shipToDifferent) checkAddress(v.shipping ?? {}, ["shipping"])

      if (required(["email"], v.email, "checkout.email") && !z.email().safeParse(v.email.trim()).success) issue(["email"], t("validation.email"))
      if (required(["phone"], v.phone, "checkout.phone") && !region.phonePattern.test(v.phone.replace(/\s/g, "")))
        issue(["phone"], t("validation.phone"))

      if (!region.carriers.some((c) => c.id === v.shippingMethod)) issue(["shippingMethod"], t("validation.carrier"))

      if (region.payments.find((p) => p.id === v.paymentMethod)?.requiresCard) {
        if (!/^\d{13,19}$/.test(v.cardNumber.replace(/\s/g, ""))) issue(["cardNumber"], t("validation.cardNumber"))
        required(["cardHolder"], v.cardHolder, "checkout.cardHolder")
        const m = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(v.cardExpiry)
        if (!m) issue(["cardExpiry"], t("validation.expiryFormat"))
        else if (new Date(2000 + Number(m[2]), Number(m[1])) < new Date()) issue(["cardExpiry"], t("validation.expired"))
        if (!/^\d{3,4}$/.test(v.cardCvc)) issue(["cardCvc"], t("validation.cvc"))
      }

      if (!v.terms) issue(["terms"], t("validation.terms"))
    })
}

export type CheckoutValues = z.infer<ReturnType<typeof makeCheckoutSchema>>

const emptyAddress: AddressValues = {
  firstName: "",
  lastName: "",
  city: "",
  country: "",
  fullName: "",
  province: "",
  prefecture: "",
  district: "",
  address: "",
  zip: "",
}

export function checkoutDefaults(region: RegionConfig): CheckoutValues {
  return {
    ...emptyAddress,
    country: region.countries.length === 1 ? region.countries[0] : "",
    email: "",
    phone: "",
    shipToDifferent: false,
    shipping: { ...emptyAddress },
    shippingMethod: "",
    paymentMethod: region.defaultPayment,
    cardNumber: "",
    cardHolder: "",
    cardExpiry: "",
    cardCvc: "",
    notes: "",
    marketing: false,
    terms: false,
  }
}
