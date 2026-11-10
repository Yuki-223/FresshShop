import productGallery from "@/lib/data/metagenics/product-gallery.json"

const galleries = productGallery as Record<string, { variants?: Record<string, string> }>

/**
 * Own photo of a size / flavour other than the product's default one (e.g. the 180-capsule
 * bottle), or undefined. The backend only knows each product's main photo, so cart and order
 * lines look the photo up here by product handle + SKU.
 */
export function variantImage(slug: string | null | undefined, sku: string | null | undefined): string | undefined {
  return slug && sku ? galleries[slug]?.variants?.[sku] : undefined
}
