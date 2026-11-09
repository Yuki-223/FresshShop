#!/usr/bin/env node
/**
 * Import the Metagenics collection (shopStore repo) into this storefront.
 *
 *   node scripts/import-metagenics.mjs [path/to/shopStore]
 *
 * Reads (never modifies) the collected data:
 *   data/metagenics/2026-10-31/normalized/{products,categories,category-memberships}.json
 *   storefront/src/home-catalog.json            (product ids + main image paths)
 *   storefront/public/collection/*.png          (229 main images)
 * Writes derived files only:
 *   src/lib/data/metagenics/catalog.json        (trimmed catalog used by lib/api)
 *   public/products/*                           (copied main images, except the clean photos listed in product-images.json)
 *   src/lib/data/metagenics/reviews.json        (review texts found in the structured data)
 */
import fs from "node:fs"
import path from "node:path"

const root = path.resolve(process.argv[2] ?? "../shopstore")
const batch = "2026-10-31"
const normalized = path.join(root, "data/metagenics", batch, "normalized")
const outDir = path.resolve("src/lib/data/metagenics")
const imageOut = path.resolve("public/products")
/** slug → where its photo in public/products comes from (see scripts/build-product-gallery.py); listed photos are kept */
const cleanImages = JSON.parse(fs.readFileSync(path.resolve("src/lib/data/metagenics/product-images.json"), "utf8"))

const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"))
const products = readJson(path.join(normalized, "products.json"))
const categoriesRaw = readJson(path.join(normalized, "categories.json"))
const memberships = readJson(path.join(normalized, "category-memberships.json"))
const homeCatalog = readJson(path.join(root, "storefront/src/home-catalog.json"))

// ---------- helpers ----------
const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", reg: "®", trade: "™", copy: "©", deg: "°", mdash: "—", ndash: "–", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", hellip: "…", dagger: "†", Dagger: "‡", micro: "µ", bull: "•" }
const decode = (s) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n] ?? m)
const stripTags = (html) => decode(html.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim()
const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
const money = (text) => {
  const m = /\$([\d,]+(?:\.\d+)?)/.exec(text ?? "")
  return m ? Number(m[1].replace(/,/g, "")) : undefined
}
const slugFromUrl = (url) => url.split("?")[0].replace(/\/$/, "").split("/").pop()

/** Description HTML → simple blocks (heading / paragraph / list). */
function htmlToBlocks(html) {
  const blocks = []
  const re = /<(h[1-6]|p|li)\b[^>]*>([\s\S]*?)<\/\1>/gi
  let m
  while ((m = re.exec(html))) {
    const tag = m[1].toLowerCase()
    const text = stripTags(m[2])
    if (!text) continue
    if (tag === "li") {
      const last = blocks.at(-1)
      if (last?.type === "list") last.items.push(text)
      else blocks.push({ type: "list", items: [text] })
    } else blocks.push({ type: tag.startsWith("h") ? "heading" : "paragraph", text })
  }
  return blocks
}

/** First Supplement Facts table → serving info + ingredient rows. */
function parseFacts(section) {
  const html = section?.tables?.[0]?.html
  if (!html) return null
  const rows = [...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map((r) =>
    [...r[1].matchAll(/<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((c) => stripTags(c[1])),
  )
  const facts = { servingSize: undefined, servings: undefined, rows: [] }
  for (const cells of rows) {
    const [name = "", amount = "", dv = ""] = cells
    if (!name || /^ingredients$/i.test(name)) continue
    if (/^serving size/i.test(name)) facts.servingSize = amount || name.replace(/^serving size/i, "").trim()
    else if (/^servings per container/i.test(name)) facts.servings = amount || name.replace(/^servings per container/i, "").trim()
    else facts.rows.push({ name, amount, dv })
  }
  return facts.rows.length ? facts : null
}

/** "Select Container Size" label → dosage form used as a filter. */
function formOf(sizeLabel = "") {
  const l = sizeLabel.toLowerCase()
  if (/chew|gumm/.test(l)) return "Chewables"
  if (/softgel/.test(l)) return "Softgels"
  if (/capsule/.test(l)) return "Capsules"
  if (/tablet/.test(l)) return "Tablets"
  if (/packet|pack/.test(l)) return "Packets"
  if (/serving/.test(l)) return "Powders"
  if (/day/.test(l)) return "Programs"
  if (/bar/.test(l)) return "Bars"
  if (/ml|fl|oz|liquid/.test(l)) return "Liquids"
  return "Other"
}

/** Find aggregateRating anywhere in the structured data. */
function findRating(node) {
  if (!node || typeof node !== "object") return undefined
  if (node.aggregateRating) {
    const r = node.aggregateRating
    const value = Number(r.ratingValue)
    const count = Number(r.reviewCount ?? r.ratingCount)
    if (value && count) return { value: Math.round(value * 100) / 100, count }
  }
  for (const v of Object.values(node)) {
    const found = findRating(v)
    if (found) return found
  }
  return undefined
}

/** Collect schema.org Review objects anywhere in the structured data. */
function findReviews(node, found = []) {
  if (!node || typeof node !== "object") return found
  if (Array.isArray(node)) {
    for (const v of node) findReviews(v, found)
    return found
  }
  if (node["@type"] === "Review" && node.reviewBody) {
    found.push({
      author: node.author?.name?.trim() || "Anonymous",
      location: node.locationCreated?.name?.trim() || undefined,
      rating: Number(node.reviewRating?.ratingValue) || undefined,
      title: node.name?.trim() || undefined,
      content: String(node.reviewBody).trim(),
      date: node.datePublished,
    })
    return found
  }
  for (const v of Object.values(node)) findReviews(v, found)
  return found
}

const STANDARD = new Set(["Description", "Supplement Facts", "Directions", "Storage", "Cautions", "Warnings"])
const sectionText = (sections, title) => sections.find((s) => s.title === title)?.text?.trim() || undefined

// ---------- categories ----------
const categories = categoriesRaw
  .filter((c) => !c.isAllProductsEntry)
  .map((c) => {
    const label = c.observedLabels?.[0]?.replace(/\s*\(.*\)\s*$/, "").trim() || c.observedNames[0]
    const name = label.replace(/’/g, "'")
    return { slug: slugify(name), name, sourceUrl: c.url, count: c.collectedUniqueProductCount }
  })
const categoryByUrl = new Map(categories.map((c) => [c.sourceUrl, c.slug]))
const membershipByProduct = new Map(memberships.map((m) => [m.productUrl, m.categoryUrls.map((u) => categoryByUrl.get(u)).filter(Boolean)]))

// ---------- product lines (shared trademark prefix, ≥ 2 products) ----------
const linePrefix = (name) => {
  const m = /^(.+?)[®™]/.exec(name)
  return m ? m[1].trim() : /^(Vitamin D3|Magnesium|Glucosamine|StayStrong\+|Ultra Potent-C)/.exec(name)?.[1]
}
const lineCounts = new Map()
for (const p of products) {
  const l = linePrefix(p.name)
  if (l) lineCounts.set(l, (lineCounts.get(l) ?? 0) + 1)
}

// ---------- products ----------
const homeByUrl = new Map(homeCatalog.map((h) => [h.sourceUrl, h]))
const out = []
const missing = []
const reviewsBySlug = {}
fs.mkdirSync(imageOut, { recursive: true })

for (const p of products) {
  const home = homeByUrl.get(p.sourceUrl)
  const slug = home?.id ?? slugFromUrl(p.sourceUrl)
  const first = p.variants[0]
  const sections = first.sections ?? []

  const variants = p.variants.map((v) => {
    const size = v.selectedOptions?.find((o) => o.group === "Select Container Size")?.label
    const flavor = v.selectedOptions?.find((o) => o.group === "Select Flavor")?.label
    const opts = v.purchaseOptions ?? []
    const once = opts.find((o) => /one time/i.test(o.label))
    const price = money(once?.priceText) ?? v.sourceOffer?.price ?? home?.variants?.find((h) => h.sku === v.sku)?.price
    const subscriptions = opts
      .map((o) => {
        const months = Number(/^(\d+) month subscription/i.exec(o.label)?.[1])
        const subPrice = money(o.priceText)
        if (!months || subPrice == null) return null
        const pct = Number(/save (\d+)%/i.exec(o.badge ?? "")?.[1]) || (price ? Math.round((1 - subPrice / price) * 100) : 0)
        return { months, price: subPrice, savePercent: Math.max(0, pct) }
      })
      .filter(Boolean)
      .sort((a, b) => a.months - b.months)
    if (price == null) missing.push(`${slug}/${v.sku}: no one-time price`)
    return {
      sku: v.sku ?? "",
      // bundles have no size picker (the source label is just the SKU)
      label: [size, flavor].filter(Boolean).join(" · ") || "Standard",
      size,
      flavor,
      price,
      subscriptions,
      available: !/OutOfStock/i.test(v.sourceOffer?.availability ?? ""),
    }
  })

  const imageSrc = home?.image ? path.join(root, "storefront/public", home.image) : undefined
  let image
  if (cleanImages[slug]) {
    // replaced by a clean white-background photo (2026-11-05): keep it, don't copy the original over it
    image = `/products/${slug}.jpg`
  } else if (imageSrc && fs.existsSync(imageSrc)) {
    const file = `${slug}${path.extname(imageSrc)}`
    fs.copyFileSync(imageSrc, path.join(imageOut, file))
    image = `/products/${file}`
  } else missing.push(`${slug}: no main image`)

  // the structured data lists every review twice — keep one per author + date + text
  const seen = new Set()
  const reviews = findReviews(p.structuredData).filter((r) => {
    const key = `${r.author}|${r.date}|${r.content}`
    if (seen.has(key) || !(r.rating >= 1 && r.rating <= 5 && r.date)) return false
    seen.add(key)
    return true
  })
  if (reviews.length) reviewsBySlug[slug] = reviews

  const line = linePrefix(p.name)
  const cats = membershipByProduct.get(p.sourceUrl) ?? []
  if (cats.includes("bundle-and-save")) for (const v of variants) if (v.label === "Standard") v.label = "Bundle"
  out.push({
    slug,
    name: p.name,
    subtitle: p.subtitle?.trim() || undefined,
    summary: p.summary?.trim() || undefined,
    sourceUrl: p.sourceUrl,
    image,
    categories: cats,
    isBundle: cats.includes("bundle-and-save"),
    productLine: line && lineCounts.get(line) >= 2 ? line : undefined,
    form: cats.includes("bundle-and-save") || !variants[0]?.size ? "Bundles" : formOf(variants[0].size),
    rating: findRating(p.structuredData),
    variants,
    description: htmlToBlocks(sections.find((s) => s.title === "Description")?.html ?? ""),
    supplementFacts: parseFacts(sections.find((s) => s.title === "Supplement Facts")),
    directions: sectionText(sections, "Directions"),
    storage: sectionText(sections, "Storage"),
    cautions: sectionText(sections, "Cautions"),
    warnings: sectionText(sections, "Warnings"),
    faq: sections.filter((s) => !STANDARD.has(s.title) && s.text?.trim()).map((s) => ({ q: s.title, a: s.text.trim() })),
    related: (p.related ?? []).flatMap((r) => r.products ?? []).map((r) => slugFromUrl(r.url ?? "")),
  })
}

// keep only related slugs that exist
const known = new Set(out.map((p) => p.slug))
for (const p of out) p.related = [...new Set(p.related.filter((s) => known.has(s) && s !== p.slug))]

fs.mkdirSync(outDir, { recursive: true })
const catalog = { source: { repo: "Yuki-223/shopStore", batch, products: out.length }, categories, products: out }
fs.writeFileSync(path.join(outDir, "catalog.json"), JSON.stringify(catalog))
const reviewCount = Object.values(reviewsBySlug).reduce((n, r) => n + r.length, 0)
fs.writeFileSync(
  path.join(outDir, "reviews.json"),
  JSON.stringify({ source: { repo: "Yuki-223/shopStore", batch, reviews: reviewCount }, reviews: reviewsBySlug }, null, 2) + "\n",
)
console.log(`reviews ${reviewCount} for ${Object.keys(reviewsBySlug).length} products: ${Object.keys(reviewsBySlug).join(", ")}`)

const variantCount = out.reduce((n, p) => n + p.variants.length, 0)
console.log(`products ${out.length}, variants ${variantCount}, categories ${categories.length}`)
console.log(`with rating ${out.filter((p) => p.rating).length}, with facts ${out.filter((p) => p.supplementFacts).length}, with faq ${out.filter((p) => p.faq.length).length}`)
console.log(`product lines: ${[...new Set(out.map((p) => p.productLine).filter(Boolean))].length}, forms: ${JSON.stringify(Object.fromEntries([...new Set(out.map((p) => p.form))].map((f) => [f, out.filter((p) => p.form === f).length])))}`)
console.log(`catalog.json ${(fs.statSync(path.join(outDir, "catalog.json")).size / 1024).toFixed(0)} KB`)
if (missing.length) console.log(`WARN ${missing.length} issues:\n  ${missing.slice(0, 20).join("\n  ")}`)
