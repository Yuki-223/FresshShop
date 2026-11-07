#!/usr/bin/env node
/**
 * Sample reviews for the demo, so every product page has a filled review section.
 *
 *   node scripts/import-demo-reviews.mjs            # 3–8 sample reviews per product
 *   node scripts/import-demo-reviews.mjs --remove   # delete every sample review again
 *
 * These are made up. They are stored with source "demo", shown in the storefront with a
 * "Sample review" tag, and NOT counted in the product rating (that stays the collected one).
 * They describe everyday things only (taste, swallowing, packaging, shipping, routine) and make
 * no health or treatment claims. The output is deterministic (seeded by the product handle), and
 * products that already have sample reviews are skipped, so re-runs create no duplicates.
 * Requires the backend to be running and the products to be imported (pnpm import:metagenics).
 */
import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const BACKEND = process.env.MEDUSA_BACKEND_URL ?? "http://localhost:9000"
const readJson = async (file) => JSON.parse(await readFile(file, "utf8"))
const config = await readJson(path.join(backendDir, ".local/config.json"))
const { products } = await readJson(path.join(backendDir, "../src/lib/data/metagenics/catalog.json"))

async function request(route, { body, method, token } = {}) {
  const response = await fetch(`${BACKEND}${route}`, {
    method: method ?? (body ? "POST" : "GET"),
    headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  const value = await response.json()
  if (!response.ok) throw new Error(`${route}: HTTP ${response.status}: ${value.message}`)
  return value
}
const { token } = await request("/auth/user/emailpass", { body: { email: config.adminEmail, password: config.adminPassword } })
const admin = (route, opts = {}) => request(route, { ...opts, token })

if (process.argv.includes("--remove")) {
  const { deleted } = await admin("/admin/reviews?source=demo", { method: "DELETE" })
  console.log(JSON.stringify({ removed: deleted }))
  process.exit(0)
}

// ---------- deterministic random ----------
function seeded(text) {
  let h = 2166136261
  for (const c of text) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}
const pick = (rand, list) => list[Math.floor(rand() * list.length)]

// ---------- building blocks (no health or treatment claims) ----------
const FIRST = ["Emily", "Jason", "Maria", "David", "Sarah", "Kevin", "Laura", "Brian", "Megan", "Chris", "Nicole", "Daniel", "Rachel", "Mark", "Ashley", "Tom", "Jessica", "Paul", "Amanda", "Steve", "Karen", "Mike", "Linda", "Greg", "Olivia", "Ryan", "Hannah", "Eric", "Sophie", "Adam", "Grace", "Nathan"]
const PLACES = ["Austin, TX", "Denver, CO", "Portland, OR", "Chicago, IL", "Raleigh, NC", "Phoenix, AZ", "Boston, MA", "San Diego, CA", "Columbus, OH", "Nashville, TN", "Seattle, WA", "Tampa, FL", "Madison, WI", "Boise, ID", null, null, null]

const BY_FORM = {
  swallow: [
    "Easy to swallow, no aftertaste.",
    "The size is manageable and they go down easily with water.",
    "No fishy or chemical smell, which I appreciate.",
    "I take it with breakfast every morning.",
  ],
  powder: [
    "Mixes well in a shaker bottle, only a few small clumps.",
    "The taste is pleasant and not too sweet.",
    "Dissolves fine in water; even better in almond milk.",
    "The scoop is included, which makes measuring easy.",
  ],
  chew: [
    "The flavor is nice and not overly sweet.",
    "Texture is soft and easy to chew.",
    "My whole family likes the taste.",
  ],
  packets: [
    "The daily packets are very convenient for travel.",
    "Having everything in one packet makes it easy to stay consistent.",
    "Great for my work bag, no more counting pills.",
  ],
  bundle: [
    "Nice to get everything together in one order.",
    "The bundle saves a little compared to buying each one separately.",
    "Everything arrived together and well packed.",
  ],
}
const formGroup = (form) =>
  ({ Powders: "powder", Chewables: "chew", Bars: "chew", Packets: "packets", Bundles: "bundle", Programs: "bundle" })[form] ?? "swallow"

const GENERAL = [
  "Shipping was quick and the bottle was sealed properly.",
  "I've been using it for a few months as part of my daily routine.",
  "My practitioner recommended this brand and I'm glad I tried it.",
  "Good quality product and the label is clear about what's inside.",
  "I like that the ingredients are listed clearly.",
  "Arrived well packaged, no damage.",
  "The subscription option makes reordering painless.",
  "Consistent quality every time I reorder.",
  "Fair price for the quality.",
]
const POSITIVE_TITLES = ["Great quality", "Will buy again", "Part of my routine", "Very happy", "Reliable product", "Easy to take", "Love it", "Exactly as described", "Recommended", "Good value"]
const POSITIVE_CLOSERS = ["Will definitely reorder.", "Would recommend.", "Already on my second bottle.", "Happy with this purchase.", "Five stars from me."]
const MIXED_TITLES = ["Good, but pricey", "Decent", "Okay overall", "Fine product"]
const MIXED_LINES = [
  "A bit expensive compared to other brands.",
  "Wish the bottle were a little bigger for the price.",
  "Packaging could be better, but the product itself is fine.",
  "Took a little getting used to the taste.",
]

/** star rating near the product's collected average: mostly 4–5, some 3 for lower-rated products */
function stars(rand, average) {
  const r = rand()
  if (average >= 4.6) return r < 0.75 ? 5 : 4
  if (average >= 4.2) return r < 0.55 ? 5 : r < 0.92 ? 4 : 3
  return r < 0.35 ? 5 : r < 0.75 ? 4 : 3
}

function makeReviews(product, productId) {
  const rand = seeded(product.slug)
  const n = 3 + Math.floor(rand() * 6) // 3–8
  const average = product.rating?.value ?? 4.4
  const forForm = BY_FORM[formGroup(product.form)]
  const used = new Set()
  const fresh = (list) => {
    for (let i = 0; i < 6; i++) {
      const s = pick(rand, list)
      if (!used.has(s)) return used.add(s), s
    }
    return pick(rand, list)
  }
  // spread over the last ~18 months before 2026-11-01
  const end = Date.UTC(2026, 10, 1)
  return Array.from({ length: n }, () => {
    const rating = stars(rand, average)
    const name = `${pick(rand, FIRST)} ${String.fromCharCode(65 + Math.floor(rand() * 26))}.`
    const body =
      rating >= 4
        ? [fresh(forForm), fresh(GENERAL), rating === 5 ? pick(rand, POSITIVE_CLOSERS) : ""]
        : [fresh(forForm), pick(rand, MIXED_LINES)]
    return {
      product_id: productId,
      rating,
      author_name: name,
      location: pick(rand, PLACES) ?? undefined,
      title: rating >= 4 ? pick(rand, POSITIVE_TITLES) : pick(rand, MIXED_TITLES),
      content: body.filter(Boolean).join(" "),
      source: "demo",
      status: "approved",
      published_at: new Date(end - Math.floor(rand() * 540) * 86400000).toISOString(),
    }
  })
}

// ---------- import ----------
let created = 0
let skipped = 0
for (const product of products) {
  const {
    products: [found],
  } = await admin(`/admin/products?handle=${encodeURIComponent(product.slug)}&fields=id`)
  if (!found) throw new Error(`Product ${product.slug} not found — run pnpm import:metagenics first`)
  const existing = await admin(`/admin/reviews?product_id=${found.id}&source=demo&limit=1`)
  if (existing.count) {
    skipped++
    continue
  }
  const { count } = await admin("/admin/reviews", { body: { reviews: makeReviews(product, found.id) } })
  created += count
}
console.log(JSON.stringify({ products: products.length, created, skipped }))
