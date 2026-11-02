import { z } from "zod"

export const COUNTRIES = ["Czech republic", "Slovakia", "Germany", "Austria", "Poland", "United Kingdom", "United States"]

const required = (label: string) => z.string().trim().min(1, `${label} is required`)

const addressSchema = z.object({
  address: required("Address"),
  city: required("Town / City"),
  country: required("State / Country"),
  zip: required("ZIP / Postal code").regex(/^[A-Za-z0-9 -]{3,10}$/, "Enter a valid postal code"),
})

export const checkoutSchema = z
  .object({
    firstName: required("First name"),
    lastName: required("Last name"),
    email: z.email("Enter a valid email address"),
    phone: required("Phone number").regex(/^\+?[0-9 ()-]{7,20}$/, "Enter a valid phone number"),
    ...addressSchema.shape,
    shipToDifferent: z.boolean(),
    // validated in superRefine only when "ship to a different address" is checked
    shipping: z
      .object({ address: z.string(), city: z.string(), country: z.string(), zip: z.string() })
      .partial()
      .optional(),
    shippingMethod: z.enum(["fedex", "dhl"], { error: "Choose a delivery method" }),
    paymentMethod: z.enum(["card", "paypal", "bitcoin"]),
    cardNumber: z.string().optional(),
    cardHolder: z.string().optional(),
    cardExpiry: z.string().optional(),
    cardCvc: z.string().optional(),
    notes: z.string().max(500, "Keep it under 500 characters").optional(),
    marketing: z.boolean(),
    terms: z.boolean().refine((v) => v, "You must agree with the terms and conditions"),
  })
  .superRefine((v, ctx) => {
    if (v.shipToDifferent) {
      const r = addressSchema.safeParse(v.shipping ?? {})
      if (!r.success) {
        for (const issue of r.error.issues) ctx.addIssue({ ...issue, path: ["shipping", ...issue.path] } as never)
      }
    }
    if (v.paymentMethod === "card") {
      const digits = (v.cardNumber ?? "").replace(/\s/g, "")
      if (!/^\d{13,19}$/.test(digits)) ctx.addIssue({ code: "custom", path: ["cardNumber"], message: "Enter a valid card number" })
      if (!v.cardHolder?.trim()) ctx.addIssue({ code: "custom", path: ["cardHolder"], message: "Card holder is required" })
      const m = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(v.cardExpiry ?? "")
      if (!m) ctx.addIssue({ code: "custom", path: ["cardExpiry"], message: "Use MM/YY" })
      else {
        const exp = new Date(2000 + Number(m[2]), Number(m[1]))
        if (exp < new Date()) ctx.addIssue({ code: "custom", path: ["cardExpiry"], message: "Card has expired" })
      }
      if (!/^\d{3,4}$/.test(v.cardCvc ?? "")) ctx.addIssue({ code: "custom", path: ["cardCvc"], message: "3–4 digits" })
    }
  })

export type CheckoutInput = z.input<typeof checkoutSchema>
export type CheckoutValues = z.output<typeof checkoutSchema>

export const checkoutDefaults: CheckoutInput = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "",
  zip: "",
  shipToDifferent: false,
  shipping: { address: "", city: "", country: "", zip: "" },
  shippingMethod: undefined as unknown as "fedex",
  paymentMethod: "card",
  cardNumber: "",
  cardHolder: "",
  cardExpiry: "",
  cardCvc: "",
  notes: "",
  marketing: false,
  terms: false,
}
