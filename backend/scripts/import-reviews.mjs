#!/usr/bin/env node
/**
 * Import the collected review texts (../src/lib/data/metagenics/reviews.json) into the review module.
 *
 *   node scripts/import-reviews.mjs
 *
 * Products are matched by handle. A product that already has collected reviews is skipped,
 * so re-runs never create duplicates. Requires the backend to be running and the products
 * to be imported first (pnpm import:metagenics).
 *
 * The collected rating summary (product.metadata.rating) already counts these reviews,
 * so importing them does not change the rating shown in the storefront.
 */
import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const BACKEND = process.env.MEDUSA_BACKEND_URL ?? "http://localhost:9000"
const readJson = async (file) => JSON.parse(await readFile(file, "utf8"))
const { reviews: bySlug } = await readJson(path.join(backendDir, "../src/lib/data/metagenics/reviews.json"))
const config = await readJson(path.join(backendDir, ".local/config.json"))

async function request(route, body, token) {
  const response = await fetch(`${BACKEND}${route}`, {
    method: body ? "POST" : "GET",
    headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  const value = await response.json()
  if (!response.ok) throw new Error(`${route}: HTTP ${response.status}: ${value.message}`)
  return value
}
const { token } = await request("/auth/user/emailpass", { email: config.adminEmail, password: config.adminPassword })
const admin = (route, body) => request(route, body, token)

const summary = []
for (const [handle, reviews] of Object.entries(bySlug)) {
  const {
    products: [product],
  } = await admin(`/admin/products?handle=${encodeURIComponent(handle)}&fields=id,title`)
  assert(product, `Product ${handle} not found — run pnpm import:metagenics first`)
  const existing = await admin(`/admin/reviews?product_id=${product.id}&source=collected&limit=1`)
  if (existing.count) {
    summary.push({ handle, skipped: existing.count })
    continue
  }
  const { count } = await admin("/admin/reviews", {
    reviews: reviews.map((r) => ({
      product_id: product.id,
      rating: r.rating,
      author_name: r.author,
      location: r.location,
      title: r.title,
      content: r.content,
      source: "collected",
      status: "approved",
      published_at: r.date,
    })),
  })
  summary.push({ handle, created: count })
}
console.log(JSON.stringify(summary))
