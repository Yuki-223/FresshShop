import { connection } from "next/server"
import type { CatalogProduct } from "@/lib/data/metagenics"
import { medusa, storeRegion } from "@/lib/medusa/server"
import type { ContentBlock, ProductQA, Rating, SubscriptionOffer, SupplementFacts } from "@/types"

type MedusaVariant = {
  id: string
  sku: string | null
  title: string
  variant_rank?: number
  inventory_quantity?: number
  calculated_price?: { calculated_amount: number }
  metadata?: { size?: string | null; flavor?: string | null; subscriptions?: SubscriptionOffer[] } | null
}
type MedusaProduct = {
  id: string
  handle: string
  title: string
  subtitle: string | null
  description: string | null
  thumbnail: string | null
  variants: MedusaVariant[]
  metadata: Record<string, unknown> | null
}

const TTL_MS = 15_000
let cache: { at: number; products: Promise<CatalogProduct[]> } | undefined

/**
 * All Metagenics products from the Medusa Store API, in the CatalogProduct shape the rest
 * of the storefront already uses. Prices and stock are live; everything else comes from the
 * metadata written by backend/scripts/import-metagenics.mjs. Cached for 15 s per server process,
 * so a price change in the admin shows up within seconds without hammering the backend.
 */
export async function remoteProducts(): Promise<CatalogProduct[]> {
  await connection() // request-time data: never prerendered at build time
  if (!cache || Date.now() - cache.at > TTL_MS) {
    const products = load()
    cache = { at: Date.now(), products }
    products.catch(() => (cache = undefined))
  }
  return cache.products
}

async function load(): Promise<CatalogProduct[]> {
  const region = await storeRegion()
  const {
    collections: [collection],
  } = await medusa<{ collections: { id: string }[] }>("/store/collections?handle[]=metagenics")
  if (!collection) throw new Error("No Metagenics collection in Medusa — run `pnpm import:metagenics` in backend/")

  const all: MedusaProduct[] = []
  for (let offset = 0; ; offset += 100) {
    const page = await medusa<{ products: MedusaProduct[]; count: number }>(
      `/store/products?collection_id=${collection.id}&region_id=${region.id}&limit=100&offset=${offset}` +
        "&fields=+metadata,*variants,*variants.calculated_price,+variants.inventory_quantity",
    )
    all.push(...page.products)
    if (all.length >= page.count || !page.products.length) break
  }
  return all.map(toCatalogProduct)
}

function toCatalogProduct(p: MedusaProduct): CatalogProduct {
  const m = (p.metadata ?? {}) as Record<string, unknown>
  return {
    slug: p.handle,
    medusaId: p.id,
    name: p.title,
    subtitle: p.subtitle ?? undefined,
    summary: p.description ?? undefined,
    sourceUrl: String(m.source_url ?? ""),
    image: p.thumbnail ?? undefined,
    categories: (m.health_categories as string[]) ?? [],
    isBundle: Boolean(m.is_bundle),
    productLine: (m.product_line as string | null) ?? undefined,
    form: (m.form as string) ?? "Other",
    rating: (m.rating as Rating | null) ?? undefined,
    variants: [...p.variants]
      .sort((a, b) => (a.variant_rank ?? 0) - (b.variant_rank ?? 0))
      .map((v) => ({
        id: v.id,
        sku: v.sku ?? "",
        label: v.title,
        size: v.metadata?.size ?? undefined,
        flavor: v.metadata?.flavor ?? undefined,
        price: v.calculated_price?.calculated_amount ?? 0,
        subscriptions: v.metadata?.subscriptions ?? [],
        available: (v.inventory_quantity ?? 0) > 0,
      })),
    description: (m.content as ContentBlock[]) ?? [],
    supplementFacts: (m.supplement_facts as SupplementFacts | null) ?? null,
    directions: (m.directions as string | null) ?? undefined,
    storage: (m.storage as string | null) ?? undefined,
    cautions: (m.cautions as string | null) ?? undefined,
    warnings: (m.warnings as string | null) ?? undefined,
    faq: (m.faq as ProductQA[]) ?? [],
    related: (m.related as string[]) ?? [],
  }
}
