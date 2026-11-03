#!/usr/bin/env node
/**
 * Check the imported Metagenics catalog through the Store API (what the storefront uses)
 * against the storefront's catalog.json. Read-only except for one throwaway test cart.
 *
 *   node scripts/verify-metagenics.mjs
 */
import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const BACKEND = process.env.MEDUSA_BACKEND_URL ?? "http://localhost:9000"
const catalog = JSON.parse(await readFile(path.join(backendDir, "../src/lib/data/metagenics/catalog.json"), "utf8"))
const key = (await readFile(path.join(backendDir, ".local/publishable-key"), "utf8")).trim()

async function store(route, body) {
  const response = await fetch(`${BACKEND}${route}`, {
    method: body ? "POST" : "GET",
    headers: { "x-publishable-api-key": key, "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  })
  const value = await response.json()
  if (!response.ok) throw new Error(`${route}: HTTP ${response.status}: ${value.message}`)
  return value
}

const { regions } = await store("/store/regions")
const region = regions.find((r) => r.currency_code === "usd")
assert(region, "No USD region")
const { collections } = await store("/store/collections?handle=metagenics")
const collection = collections[0]
assert(collection, "No Metagenics collection")

const products = []
for (let offset = 0; ; offset += 100) {
  const page = await store(
    `/store/products?collection_id=${collection.id}&region_id=${region.id}&limit=100&offset=${offset}` +
      // note: an explicit field list (e.g. "handle,title,…") drops variants.metadata — use the "+"/"*" forms
      `&fields=+metadata,*categories,*variants,*variants.calculated_price,+variants.inventory_quantity`,
  )
  products.push(...page.products)
  if (products.length >= page.count) break
}
const { product_categories } = await store("/store/product-categories?limit=100&handle[]=" + catalog.categories.map((c) => `metagenics-${c.slug}`).join("&handle[]="))

const bySlug = new Map(catalog.products.map((p) => [p.slug, p]))
const issues = []
let variants = 0
let priceMatches = 0
let subscriptionVariants = 0
let ratings = 0
let facts = 0
let faq = 0
let outOfStockZero = 0
let imagesOk = 0

for (const p of products) {
  const source = bySlug.get(p.handle)
  if (!source) {
    issues.push(`unexpected product ${p.handle}`)
    continue
  }
  if (p.metadata?.rating) ratings++
  if (p.metadata?.supplement_facts) facts++
  if (p.metadata?.faq?.length) faq++
  if (p.categories.length !== source.categories.length) issues.push(`${p.handle}: categories ${p.categories.length}/${source.categories.length}`)
  for (const v of p.variants) {
    variants++
    const sv = source.variants.find((x) => x.sku === v.sku)
    if (!sv) {
      issues.push(`${p.handle}: unknown sku ${v.sku}`)
      continue
    }
    if (v.calculated_price?.calculated_amount === sv.price) priceMatches++
    else issues.push(`${v.sku}: price ${v.calculated_price?.calculated_amount} != ${sv.price}`)
    if (v.metadata?.subscriptions?.length) subscriptionVariants++
    if (!sv.available && v.inventory_quantity === 0) outOfStockZero++
  }
}
for (const p of products.slice(0, 229)) {
  const res = await fetch(p.thumbnail, { method: "HEAD" }).catch(() => null)
  if (res?.ok) imagesOk++
}

const expected = {
  products: catalog.products.length,
  variants: catalog.products.reduce((n, p) => n + p.variants.length, 0),
  categories: catalog.categories.length,
  ratings: catalog.products.filter((p) => p.rating).length,
  subscriptionVariants: catalog.products.flatMap((p) => p.variants).filter((v) => v.subscriptions.length).length,
  outOfStock: catalog.products.flatMap((p) => p.variants).filter((v) => !v.available).length,
}
const actual = {
  products: products.length,
  variants,
  categories: product_categories.length,
  ratings,
  subscriptionVariants,
  outOfStock: outOfStockZero,
}

// add to cart works, and an out-of-stock variant is refused
const { cart } = await store("/store/carts", { region_id: region.id })
const inStock = products.find((p) => p.handle === "adreset").variants[0]
await store(`/store/carts/${cart.id}/line-items`, { variant_id: inStock.id, quantity: 2 })
const oos = products.find((p) => p.handle === "insulin-guard").variants[0]
const refused = await store(`/store/carts/${cart.id}/line-items`, { variant_id: oos.id, quantity: 1 }).then(
  () => false,
  () => true,
)

console.log(
  JSON.stringify(
    {
      expected,
      actual,
      pricesMatching: `${priceMatches}/${variants}`,
      withSupplementFacts: facts,
      withFaq: faq,
      imagesReachable: `${imagesOk}/${products.length}`,
      cart: { addAdreset: true, outOfStockRefused: refused },
      issues: issues.slice(0, 20),
    },
    null,
    2,
  ),
)
assert.deepEqual(actual, expected)
assert.equal(issues.length, 0)
assert.equal(refused, true)
console.log("OK")
