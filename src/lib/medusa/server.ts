/**
 * Server-side access to the Medusa Store API (backend/ in this repo).
 * Never import this from client components — use the server actions in lib/cart/actions.ts.
 *
 * Configuration:
 *   MEDUSA_BACKEND_URL      default http://localhost:9000
 *   MEDUSA_PUBLISHABLE_KEY  default: read from backend/.local/publishable-key (written by `pnpm setup:local`)
 */
import { readFile } from "node:fs/promises"
import path from "node:path"

export const MEDUSA_URL = process.env.MEDUSA_BACKEND_URL ?? "http://localhost:9000"

let keyPromise: Promise<string> | undefined
function publishableKey() {
  keyPromise ??= (async () => {
    if (process.env.MEDUSA_PUBLISHABLE_KEY) return process.env.MEDUSA_PUBLISHABLE_KEY
    try {
      return (await readFile(path.join(process.cwd(), "backend/.local/publishable-key"), "utf8")).trim()
    } catch {
      throw new Error("No Medusa publishable key: set MEDUSA_PUBLISHABLE_KEY or run `pnpm setup:local` in backend/")
    }
  })()
  return keyPromise
}

export class MedusaError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

export async function medusa<T>(route: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const response = await fetch(`${MEDUSA_URL}${route}`, {
    method: init.method ?? (init.body === undefined ? "GET" : "POST"),
    headers: { "x-publishable-api-key": await publishableKey(), "content-type": "application/json" },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  })
  const value = (await response.json().catch(() => ({}))) as T & { message?: string }
  if (!response.ok) throw new MedusaError(response.status, value.message ?? `${route}: HTTP ${response.status}`)
  return value
}

type Region = { id: string; currency_code: string; countries: { iso_2: string }[] }
let regionPromise: Promise<Region> | undefined
/** The USD region created by backend/scripts/import-metagenics.mjs (US + China). */
export function storeRegion() {
  regionPromise ??= medusa<{ regions: Region[] }>("/store/regions").then(({ regions }) => {
    const region = regions.find((r) => r.currency_code === "usd")
    if (!region) throw new Error("No USD region in Medusa — run `pnpm import:metagenics` in backend/")
    return region
  })
  regionPromise.catch(() => (regionPromise = undefined))
  return regionPromise
}
