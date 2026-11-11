import type { Product } from "@/types"

/** Same limit as the backend (backend/src/modules/browsing-history/service.ts). */
export const HISTORY_LIMIT = 100
/** Products in the "Recently viewed" shelf. */
export const SHELF_SIZE = 10

/** `productId` = Medusa product id (what the backend stores). */
export type ViewedItem = { productId: string; viewedAt: string }

export type HistoryEntry = { product: Product; viewedAt: string }
