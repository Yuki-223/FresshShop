"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ShieldCheck, ShoppingBasket } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Controller, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { ButtonLink } from "@/components/common/button-link"
import { CheckoutSection, Field, OptionRow, TextInput, Wordmark, fieldInputClass } from "@/components/checkout/form-parts"
import { OrderSummary, guaranteedDeliveryDate } from "@/components/checkout/order-summary"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useHydrated } from "@/hooks/use-hydrated"
import { COUNTRIES, checkoutDefaults, checkoutSchema, type CheckoutInput, type CheckoutValues } from "@/lib/checkout-schema"
import { formatPrice } from "@/lib/format"
import { SHIPPING_METHODS, computeTotals, useCart } from "@/lib/store/cart"
import { cn } from "@/lib/utils"

export const LAST_ORDER_KEY = "freshnesecom-last-order"

const formatCardNumber = (v: string) =>
  v.replace(/\D/g, "").slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 ")
const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 4)
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}
const newOrderId = () => `FR-${Date.now().toString(36).toUpperCase()}`

function CountrySelect({ id, value, onChange, invalid }: { id: string; value?: string; onChange: (v: string) => void; invalid?: boolean }) {
  return (
    <Select value={value || null} onValueChange={(v) => onChange((v as string) ?? "")}>
      <SelectTrigger id={id} aria-invalid={invalid || undefined} className={cn(fieldInputClass, "w-full")}>
        <SelectValue placeholder="Choose a state or Country" />
      </SelectTrigger>
      <SelectContent>
        {COUNTRIES.map((c) => (
          <SelectItem key={c} value={c}>
            {c}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function CheckoutForm() {
  const router = useRouter()
  const hydrated = useHydrated()
  const items = useCart((s) => s.items)
  const promoCode = useCart((s) => s.promoCode)
  const clear = useCart((s) => s.clear)

  const form = useForm<CheckoutInput, unknown, CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: checkoutDefaults,
    mode: "onTouched",
  })
  const { register, control, handleSubmit, formState } = form
  const errors = formState.errors
  const [shippingMethod, paymentMethod, shipToDifferent] = useWatch({
    control,
    name: ["shippingMethod", "paymentMethod", "shipToDifferent"],
  })
  const shippingPrice = SHIPPING_METHODS.find((m) => m.id === shippingMethod)?.price ?? 0
  const totals = computeTotals(items, promoCode, shippingPrice)

  // keep the layout stable while navigating to the success page after the cart is cleared
  if (!hydrated || formState.isSubmitSuccessful) return <div className="h-[600px]" />
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center py-32 text-center">
        <ShoppingBasket className="size-14 text-line" strokeWidth={1.25} />
        <h1 className="mt-4 text-2xl font-semibold text-ink">Your cart is empty</h1>
        <p className="mt-2 text-sm text-ink-muted">Add some fresh products before checking out.</p>
        <ButtonLink href="/category/all" className="mt-6">
          Start shopping
        </ButtonLink>
      </div>
    )
  }

  const onSubmit = async (values: CheckoutValues) => {
    await new Promise((r) => setTimeout(r, 800)) // simulate API call
    const order = {
      id: newOrderId(),
      email: values.email,
      name: `${values.firstName} ${values.lastName}`,
      total: totals.total,
      items: totals.count,
      shippingMethod: values.shippingMethod,
      deliveryDate: guaranteedDeliveryDate(),
    }
    try {
      sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order))
    } catch {}
    clear()
    router.push(`/checkout/success?order=${order.id}`)
  }

  const onInvalid = () => {
    toast.error("Please check the highlighted fields.")
    requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid=true]")?.focus())
  }

  const text = (name: keyof CheckoutInput & string, label: string, placeholder: string, extra?: React.ComponentProps<typeof TextInput>) => {
    const error = (errors as Record<string, { message?: string }>)[name]?.message
    return (
      <Field id={name} label={label} error={error}>
        <TextInput id={name} placeholder={placeholder} error={error} {...register(name as never)} {...extra} />
      </Field>
    )
  }

  return (
    <div className="grid grid-cols-[1fr_420px] gap-8">
      <form noValidate onSubmit={handleSubmit(onSubmit, onInvalid)}>
        <CheckoutSection title="Billing info" subtitle="Please enter your billing info" step={1}>
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            {text("firstName", "First name", "First name", { autoComplete: "given-name" })}
            {text("lastName", "Last name", "Last name", { autoComplete: "family-name" })}
            {text("email", "Email address", "Email address", { type: "email", autoComplete: "email" })}
            {text("phone", "Phone number", "Phone number", { type: "tel", autoComplete: "tel" })}
            {text("address", "Address", "Address", { autoComplete: "street-address" })}
            {text("city", "Town / City", "Town or city", { autoComplete: "address-level2" })}
            <Field id="country" label="State / Country" error={errors.country?.message}>
              <Controller
                control={control}
                name="country"
                render={({ field }) => <CountrySelect id="country" value={field.value} onChange={field.onChange} invalid={!!errors.country} />}
              />
            </Field>
            {text("zip", "ZIP/Postal code", "Postal code or ZIP", { autoComplete: "postal-code" })}
          </div>
          <Controller
            control={control}
            name="shipToDifferent"
            render={({ field }) => (
              <OptionRow
                htmlFor="shipToDifferent"
                className="mt-6 w-fit"
                control={<Checkbox id="shipToDifferent" checked={field.value} onCheckedChange={(v) => field.onChange(v)} />}
              >
                Ship to a different address?
              </OptionRow>
            )}
          />
          {shipToDifferent && (
            <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-5 rounded-xl border border-surface-2 p-6">
              {(["address", "city", "zip"] as const).map((k) => {
                const id = `shipping.${k}`
                const error = errors.shipping?.[k]?.message
                const label = { address: "Address", city: "Town / City", zip: "ZIP/Postal code" }[k]
                return (
                  <Field key={k} id={id} label={label} error={error}>
                    <TextInput id={id} placeholder={label} error={error} {...register(`shipping.${k}`)} />
                  </Field>
                )
              })}
              <Field id="shipping.country" label="State / Country" error={errors.shipping?.country?.message}>
                <Controller
                  control={control}
                  name="shipping.country"
                  render={({ field }) => (
                    <CountrySelect id="shipping.country" value={field.value} onChange={field.onChange} invalid={!!errors.shipping?.country} />
                  )}
                />
              </Field>
            </div>
          )}
        </CheckoutSection>

        <CheckoutSection title="Billing method" subtitle="Please enter your payment method" step={2}>
          <Controller
            control={control}
            name="shippingMethod"
            render={({ field }) => (
              <RadioGroup value={field.value ?? null} onValueChange={(v) => field.onChange(v)} className="gap-4" aria-label="Delivery method">
                {SHIPPING_METHODS.map((m) => (
                  <OptionRow
                    key={m.id}
                    active={field.value === m.id}
                    htmlFor={`ship-${m.id}`}
                    control={<RadioGroupItem id={`ship-${m.id}`} value={m.id} className="size-5" aria-invalid={!!errors.shippingMethod || undefined} />}
                    aside={<Wordmark name={m.id} />}
                  >
                    <span className="grid grid-cols-[120px_auto_1fr] items-center gap-4">
                      <span className="font-heading text-xs font-semibold">{m.name}</span>
                      <span className="font-heading text-xs font-semibold text-brand">+{m.price} USD</span>
                      <span className="font-heading text-xs font-semibold">Additional price</span>
                    </span>
                  </OptionRow>
                ))}
              </RadioGroup>
            )}
          />
          {errors.shippingMethod && <p className="mt-2 text-xs text-destructive">{errors.shippingMethod.message}</p>}
        </CheckoutSection>

        <CheckoutSection title="Payment method" subtitle="Please enter your payment method" step={3}>
          <Controller
            control={control}
            name="paymentMethod"
            render={({ field }) => (
              <RadioGroup value={field.value} onValueChange={(v) => field.onChange(v)} className="gap-4" aria-label="Payment method">
                <div className={cn("rounded-xl border border-line bg-surface", paymentMethod === "card" && "border-brand-light bg-white")}>
                  <OptionRow htmlFor="pay-card" className="border-0 bg-transparent" control={<RadioGroupItem id="pay-card" value="card" className="size-5" />} aside={<Wordmark name="visa" />}>
                    <span className="font-heading text-xs font-semibold">Credit card</span>
                  </OptionRow>
                  {paymentMethod === "card" && (
                    <div className="grid grid-cols-[1fr_96px_96px] gap-x-6 gap-y-5 px-4 pt-2 pb-5">
                      <Field id="cardNumber" label="Card number" error={errors.cardNumber?.message} className="col-span-3">
                        <Controller
                          control={control}
                          name="cardNumber"
                          render={({ field }) => (
                            <TextInput
                              id="cardNumber"
                              placeholder="Card number"
                              inputMode="numeric"
                              autoComplete="cc-number"
                              error={errors.cardNumber?.message}
                              {...field}
                              onChange={(e) => field.onChange(formatCardNumber(e.target.value))}
                            />
                          )}
                        />
                      </Field>
                      <Field id="cardHolder" label="Card holder" error={errors.cardHolder?.message}>
                        <TextInput id="cardHolder" placeholder="Card holder" autoComplete="cc-name" error={errors.cardHolder?.message} {...register("cardHolder")} />
                      </Field>
                      <Field id="cardExpiry" label="Expiration date" error={errors.cardExpiry?.message}>
                        <Controller
                          control={control}
                          name="cardExpiry"
                          render={({ field }) => (
                            <TextInput
                              id="cardExpiry"
                              placeholder="MM/YY"
                              autoComplete="cc-exp"
                              error={errors.cardExpiry?.message}
                              {...field}
                              onChange={(e) => field.onChange(formatExpiry(e.target.value))}
                            />
                          )}
                        />
                      </Field>
                      <Field id="cardCvc" label="CVC" error={errors.cardCvc?.message}>
                        <TextInput id="cardCvc" placeholder="CVC" inputMode="numeric" maxLength={4} autoComplete="cc-csc" error={errors.cardCvc?.message} {...register("cardCvc")} />
                      </Field>
                    </div>
                  )}
                </div>
                <OptionRow htmlFor="pay-paypal" active={paymentMethod === "paypal"} control={<RadioGroupItem id="pay-paypal" value="paypal" className="size-5" />} aside={<Wordmark name="paypal" />}>
                  <span className="font-heading text-xs font-semibold">PayPal</span>
                </OptionRow>
                <OptionRow htmlFor="pay-bitcoin" active={paymentMethod === "bitcoin"} control={<RadioGroupItem id="pay-bitcoin" value="bitcoin" className="size-5" />} aside={<Wordmark name="bitcoin" />}>
                  <span className="font-heading text-xs font-semibold">Bitcoin</span>
                </OptionRow>
              </RadioGroup>
            )}
          />
        </CheckoutSection>

        <CheckoutSection title="Additional informations" subtitle="Need something else? We will make it for you!" step={4}>
          <Field id="notes" label="Order notes" error={errors.notes?.message}>
            <Textarea
              id="notes"
              rows={4}
              placeholder="Need a specific delivery day? Sending a gitf? Let's say ..."
              className="min-h-28 rounded-xl bg-surface px-4 py-3 text-sm placeholder:text-ink-muted"
              {...register("notes")}
            />
          </Field>
        </CheckoutSection>

        <CheckoutSection title="Confirmation" subtitle="We are getting to the end. Just few clicks and your order si ready!" step={5}>
          <div className="flex flex-col items-start gap-4">
            <Controller
              control={control}
              name="marketing"
              render={({ field }) => (
                <OptionRow htmlFor="marketing" control={<Checkbox id="marketing" checked={field.value} onCheckedChange={(v) => field.onChange(v)} />}>
                  I agree with sending an Marketing and newsletter emails. No spam, promissed!
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
                  I agree with our{" "}
                  <Link href="/terms" className="underline" target="_blank">
                    terms and conditions
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="underline" target="_blank">
                    privacy policy
                  </Link>
                  .
                </OptionRow>
              )}
            />
            {errors.terms && <p className="-mt-2 text-xs text-destructive">{errors.terms.message}</p>}
          </div>
          <Button type="submit" size="lg" className="mt-8 h-14 px-10" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? "Placing order…" : `Complete order · ${formatPrice(totals.total)}`}
          </Button>
          <div className="mt-12 max-w-[200px]">
            <ShieldCheck className="size-8 text-ink" strokeWidth={1.5} />
            <p className="mt-3 font-heading text-sm font-semibold text-ink">All your data are safe</p>
            <p className="mt-1 text-xs text-ink-muted">We are using the most advanced security to provide you the best experience ever.</p>
          </div>
        </CheckoutSection>
      </form>

      <div>
        <OrderSummary totals={totals} />
      </div>
    </div>
  )
}
