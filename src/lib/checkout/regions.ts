import type { RegionId } from "@/i18n/config"

export type PaymentId = "card" | "paypal" | "bitcoin" | "alipay" | "wechat" | "unionpay"
export type CarrierId = "fedex" | "dhl" | "sf" | "jd"

/**
 * Everything about checkout that differs between markets.
 * The form, summary and validation read this config — no `if (locale === "zh")` in components.
 * Carrier prices are in the region's display currency.
 */
export interface RegionConfig {
  id: RegionId
  /** which address block the form renders */
  addressMode: "intl" | "cn"
  carriers: { id: CarrierId; name: string; price: number; days: number }[]
  payments: { id: PaymentId; requiresCard: boolean }[]
  defaultPayment: PaymentId
  taxRate: number
  phonePattern: RegExp
  zipPattern: RegExp
  zipRequired: boolean
  countries: string[]
}

export const regions: Record<RegionId, RegionConfig> = {
  intl: {
    id: "intl",
    addressMode: "intl",
    carriers: [
      { id: "fedex", name: "FedEx", price: 32, days: 2 },
      { id: "dhl", name: "DHL", price: 15, days: 3 },
    ],
    payments: [
      { id: "card", requiresCard: true },
      { id: "paypal", requiresCard: false },
      { id: "bitcoin", requiresCard: false },
    ],
    defaultPayment: "card",
    taxRate: 0.17,
    phonePattern: /^\+?[0-9 ()-]{7,20}$/,
    zipPattern: /^[A-Za-z0-9 -]{3,10}$/,
    zipRequired: true,
    countries: ["Czech republic", "Slovakia", "Germany", "Austria", "Poland", "United Kingdom", "United States"],
  },
  cn: {
    id: "cn",
    addressMode: "cn",
    carriers: [
      { id: "sf", name: "顺丰速运", price: 12, days: 1 },
      { id: "jd", name: "京东物流", price: 8, days: 2 },
    ],
    payments: [
      { id: "alipay", requiresCard: false },
      { id: "wechat", requiresCard: false },
      { id: "unionpay", requiresCard: true },
    ],
    defaultPayment: "alipay",
    taxRate: 0.13,
    phonePattern: /^1[3-9]\d{9}$/,
    zipPattern: /^\d{6}$/,
    zipRequired: false,
    countries: ["中国大陆"],
  },
}
