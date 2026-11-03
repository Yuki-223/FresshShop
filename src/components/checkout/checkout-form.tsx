"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ShieldCheck, ShoppingBasket } from "lucide-react"
import { useMemo } from "react"
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { AddressFields } from "@/components/checkout/address-fields"
import { CheckoutSection, Field, OptionRow, TextInput, Wordmark } from "@/components/checkout/form-parts"
import { OrderSummary, guaranteedDeliveryDate } from "@/components/checkout/order-summary"
import { ButtonLink } from "@/components/common/button-link"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useHydrated } from "@/hooks/use-hydrated"
import { useI18n } from "@/i18n/client"
import { localeConfig } from "@/i18n/config"
import { Link, useRouter } from "@/i18n/navigation"
import { regions } from "@/lib/checkout/regions"
import { checkoutDefaults, makeCheckoutSchema, type CheckoutValues } from "@/lib/checkout/schema"
import { computeTotals, useCart } from "@/lib/store/cart"
import { cn } from "@/lib/utils"

export const LAST_ORDER_KEY = "freshnesecom-last-order"

export interface StoredOrder {
  id: string
  email: string
  name: string
  total: string
  items: number
  carrier: string
  deliveryDate: string
}

const formatCardNumber = (v: string) =>
  v.replace(/\D/g, "").slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 ")
const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 4)
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}
const newOrderId = () => `FR-${Date.now().toString(36).toUpperCase()}`

export function CheckoutForm() {
  const { t, fmt, locale } = useI18n()
  const region = regions[localeConfig[locale].region]
  const router = useRouter()
  const hydrated = useHydrated()
  const items = useCart((s) => s.items)
  const promoCode = useCart((s) => s.promoCode)
  const clear = useCart((s) => s.clear)

  const schema = useMemo(() => makeCheckoutSchema(region, t), [region, t])
  const form = useForm<CheckoutValues>({
    resolver: zodResolver(schema),
    defaultValues: checkoutDefaults(region),
    mode: "onTouched",
  })
  const { register, control, handleSubmit, formState } = form
  const errors = formState.errors
  const [shippingMethod, paymentMethod, shipToDifferent] = useWatch({
    control,
    name: ["shippingMethod", "paymentMethod", "shipToDifferent"],
  })
  const carrier = region.carriers.find((c) => c.id === shippingMethod)
  const totals = computeTotals(items, promoCode, { toLocal: fmt.toLocal, shipping: carrier?.price ?? 0, taxRate: region.taxRate })
  const needsCard = region.payments.find((p) => p.id === paymentMethod)?.requiresCard ?? false

  // keep the layout stable while navigating to the success page after the cart is cleared
  if (!hydrated || formState.isSubmitSuccessful) return <div className="h-[600px]" />
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center py-32 text-center">
        <ShoppingBasket className="size-14 text-line" strokeWidth={1.25} />
        <h1 className="mt-4 text-2xl font-semibold text-ink">{t("checkout.emptyTitle")}</h1>
        <p className="mt-2 text-sm text-ink-muted">{t("checkout.emptyBody")}</p>
        <ButtonLink href="/category/all" className="mt-6">
          {t("checkout.startShopping")}
        </ButtonLink>
      </div>
    )
  }

  const onSubmit = async (values: CheckoutValues) => {
    await new Promise((r) => setTimeout(r, 800)) // simulate API call
    const order: StoredOrder = {
      id: newOrderId(),
      email: values.email,
      name: region.addressMode === "cn" ? values.fullName : `${values.firstName} ${values.lastName}`,
      total: fmt.amount(totals.total),
      items: totals.count,
      carrier: carrier?.name ?? "",
      deliveryDate: guaranteedDeliveryDate(carrier?.days),
    }
    try {
      sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order))
    } catch {}
    clear()
    router.push(`/checkout/success?order=${order.id}`)
  }

  const onInvalid = () => {
    toast.error(t("checkout.checkHighlighted"))
    requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid=true]")?.focus())
  }

  return (
    <FormProvider {...form}>
      <div className="grid grid-cols-[1fr_420px] gap-8">
        <form noValidate onSubmit={handleSubmit(onSubmit, onInvalid)}>
          <CheckoutSection title={t("checkout.billingInfo")} subtitle={t("checkout.billingInfoSub")} step={1}>
            <AddressFields region={region} />
            <Controller
              control={control}
              name="shipToDifferent"
              render={({ field }) => (
                <OptionRow
                  htmlFor="shipToDifferent"
                  className="mt-6 w-fit"
                  control={<Checkbox id="shipToDifferent" checked={field.value} onCheckedChange={(v) => field.onChange(v)} />}
                >
                  {t("checkout.shipToDifferent")}
                </OptionRow>
              )}
            />
            {shipToDifferent && (
              <div className="mt-6 rounded-xl border border-surface-2 p-6">
                <AddressFields region={region} prefix="shipping." />
              </div>
            )}
          </CheckoutSection>

          <CheckoutSection title={t("checkout.billingMethod")} subtitle={t("checkout.billingMethodSub")} step={2}>
            <Controller
              control={control}
              name="shippingMethod"
              render={({ field }) => (
                <RadioGroup value={field.value || null} onValueChange={(v) => field.onChange(v)} className="gap-4" aria-label={t("checkout.deliveryMethod")}>
                  {region.carriers.map((m) => (
                    <OptionRow
                      key={m.id}
                      active={field.value === m.id}
                      htmlFor={`ship-${m.id}`}
                      control={<RadioGroupItem id={`ship-${m.id}`} value={m.id} className="size-5" aria-invalid={!!errors.shippingMethod || undefined} />}
                      aside={<Wordmark name={m.id} />}
                    >
                      <span className="grid grid-cols-[120px_auto_1fr] items-center gap-4">
                        <span className="font-heading text-xs font-semibold">{m.name}</span>
                        <span className="font-heading text-xs font-semibold text-brand">+{fmt.amount(m.price)}</span>
                        <span className="font-heading text-xs font-semibold">{t("checkout.additionalPrice")}</span>
                      </span>
                    </OptionRow>
                  ))}
                </RadioGroup>
              )}
            />
            {errors.shippingMethod && <p className="mt-2 text-xs text-destructive">{errors.shippingMethod.message}</p>}
          </CheckoutSection>

          <CheckoutSection title={t("checkout.paymentMethod")} subtitle={t("checkout.paymentMethodSub")} step={3}>
            <Controller
              control={control}
              name="paymentMethod"
              render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={(v) => field.onChange(v)} className="gap-4" aria-label={t("checkout.paymentMethod")}>
                  {region.payments.map((p) => {
                    const active = paymentMethod === p.id
                    const row = (
                      <OptionRow
                        htmlFor={`pay-${p.id}`}
                        active={active}
                        className={p.requiresCard ? "border-0 bg-transparent" : undefined}
                        control={<RadioGroupItem id={`pay-${p.id}`} value={p.id} className="size-5" />}
                        aside={<Wordmark name={p.id} />}
                      >
                        <span className="font-heading text-xs font-semibold">{t(`checkout.pay_${p.id}`)}</span>
                      </OptionRow>
                    )
                    if (!p.requiresCard) return <div key={p.id}>{row}</div>
                    return (
                      <div key={p.id} className={cn("rounded-xl border border-line bg-surface", active && "border-brand-light bg-white")}>
                        {row}
                        {active && needsCard && (
                          <div className="grid grid-cols-[1fr_96px_96px] gap-x-6 gap-y-5 px-4 pt-2 pb-5">
                            <Field id="cardNumber" label={t("checkout.cardNumber")} error={errors.cardNumber?.message} className="col-span-3">
                              <Controller
                                control={control}
                                name="cardNumber"
                                render={({ field: f }) => (
                                  <TextInput
                                    id="cardNumber"
                                    placeholder={t("checkout.cardNumber")}
                                    inputMode="numeric"
                                    autoComplete="cc-number"
                                    error={errors.cardNumber?.message}
                                    {...f}
                                    onChange={(e) => f.onChange(formatCardNumber(e.target.value))}
                                  />
                                )}
                              />
                            </Field>
                            <Field id="cardHolder" label={t("checkout.cardHolder")} error={errors.cardHolder?.message}>
                              <TextInput id="cardHolder" placeholder={t("checkout.cardHolder")} autoComplete="cc-name" error={errors.cardHolder?.message} {...register("cardHolder")} />
                            </Field>
                            <Field id="cardExpiry" label={t("checkout.expiry")} error={errors.cardExpiry?.message}>
                              <Controller
                                control={control}
                                name="cardExpiry"
                                render={({ field: f }) => (
                                  <TextInput
                                    id="cardExpiry"
                                    placeholder="MM/YY"
                                    autoComplete="cc-exp"
                                    error={errors.cardExpiry?.message}
                                    {...f}
                                    onChange={(e) => f.onChange(formatExpiry(e.target.value))}
                                  />
                                )}
                              />
                            </Field>
                            <Field id="cardCvc" label={t("checkout.cvc")} error={errors.cardCvc?.message}>
                              <TextInput
                                id="cardCvc"
                                placeholder={t("checkout.cvc")}
                                inputMode="numeric"
                                maxLength={4}
                                autoComplete="cc-csc"
                                error={errors.cardCvc?.message}
                                {...register("cardCvc")}
                              />
                            </Field>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </RadioGroup>
              )}
            />
          </CheckoutSection>

          <CheckoutSection title={t("checkout.additional")} subtitle={t("checkout.additionalSub")} step={4}>
            <Field id="notes" label={t("checkout.notes")} error={errors.notes?.message}>
              <Textarea
                id="notes"
                rows={4}
                placeholder={t("checkout.notesPlaceholder")}
                className="min-h-28 rounded-xl bg-surface px-4 py-3 text-sm placeholder:text-ink-muted"
                {...register("notes")}
              />
            </Field>
          </CheckoutSection>

          <CheckoutSection title={t("checkout.confirmation")} subtitle={t("checkout.confirmationSub")} step={5}>
            <div className="flex flex-col items-start gap-4">
              <Controller
                control={control}
                name="marketing"
                render={({ field }) => (
                  <OptionRow htmlFor="marketing" control={<Checkbox id="marketing" checked={field.value} onCheckedChange={(v) => field.onChange(v)} />}>
                    {t("checkout.marketing")}
                  </OptionRow>
                )}
              />
              <Controller
                control={control}
                name="terms"
                render={({ field }) => (
                  <OptionRow
                    htmlFor="terms"
                    className={cn(errors.terms && "border-destructive")}
                    control={<Checkbox id="terms" checked={field.value} onCheckedChange={(v) => field.onChange(v)} aria-invalid={!!errors.terms || undefined} />}
                  >
                    {t("checkout.termsPrefix")}{" "}
                    <Link href="/terms" className="underline" target="_blank">
                      {t("checkout.terms")}
                    </Link>{" "}
                    {t("checkout.and")}{" "}
                    <Link href="/privacy" className="underline" target="_blank">
                      {t("checkout.privacy")}
                    </Link>
                  </OptionRow>
                )}
              />
              {errors.terms && <p className="-mt-2 text-xs text-destructive">{errors.terms.message}</p>}
            </div>
            <Button type="submit" size="lg" className="mt-8 h-14 px-10" disabled={formState.isSubmitting}>
              {formState.isSubmitting ? t("checkout.placingOrder") : t("checkout.completeOrder", { total: fmt.amount(totals.total) })}
            </Button>
            <div className="mt-12 max-w-[220px]">
              <ShieldCheck className="size-8 text-ink" strokeWidth={1.5} />
              <p className="mt-3 font-heading text-sm font-semibold text-ink">{t("checkout.safeTitle")}</p>
              <p className="mt-1 text-xs text-ink-muted">{t("checkout.safeBody")}</p>
            </div>
          </CheckoutSection>
        </form>

        <div>
          <OrderSummary totals={totals} deliveryDays={carrier?.days} />
        </div>
      </div>
    </FormProvider>
  )
}
