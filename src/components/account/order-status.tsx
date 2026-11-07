import type { MessageKey } from "@/i18n/dictionary"

/** Medusa order status → label key (pending / requires_action / draft read as "Processing"). */
export function orderStatusKey(status: string): MessageKey {
  if (status === "completed") return "account.statusCompleted"
  if (status === "canceled" || status === "archived") return "account.statusCanceled"
  return "account.statusPending"
}

/** Same number the checkout success page shows (FR-00017). */
export const orderNumber = (displayId: number) => `FR-${String(displayId).padStart(5, "0")}`
