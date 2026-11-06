/**
 * Photo banners of the product-list pages (public/collection-banners/, 1024×250).
 * They are vitacost.com collection banners with the painted-in title or brand logo removed
 * (inpainted), so our own page title can be written on top. Purely decorative: the photos
 * don't have to match the category.
 *
 * `align` is where the empty space for the title is: "center" for banners with photos on both
 * sides, "left" for banners with the photos on the right.
 */
export type CollectionBanner = { src: string; align: "center" | "left" }

const banner = (name: string, align: CollectionBanner["align"] = "center"): CollectionBanner => ({
  src: `/collection-banners/${name}.jpg`,
  align,
})

/** "all" + the 8 navigation groups */
const byGroup: Record<string, CollectionBanner> = {
  all: banner("spoons-beige", "left"),
  "vitamins-wellness": banner("herbs-softgels"),
  "gut-detox": banner("capsule-bowls"),
  "brain-mood-sleep": banner("heart-dishes"),
  "heart-metabolism": banner("fish-oil-lemon"),
  immune: banner("citrus-softgels"),
  "joint-sports": banner("dumbbells", "left"),
  "women-men-kids": banner("leaf-capsules"),
  bundles: banner("shaker-powder"),
}

/** subcategories (?sub=) that get a banner of their own; the others use their group's */
const bySubcategory: Record<string, CollectionBanner> = {
  magnesium: banner("beet-powder"),
  "omega-3s-and-fish-oil": banner("fish-oil-lemon"),
  "protein-and-sports-nutrition": banner("dumbbells", "left"),
  "weight-management": banner("shaker-powder"),
  "liver-and-detox": banner("mortar-herbs"),
  "stress-mental-health": banner("mortar-herbs"),
  "vitamins-and-minerals": banner("leaf-capsules"),
  "heart-health": banner("spices"),
}

/** Banner for a list page: the subcategory's own, else the group's, else the "all products" one. */
export function collectionBanner(slug: string, subcategory?: string): CollectionBanner {
  return (subcategory && bySubcategory[subcategory]) || byGroup[slug] || byGroup.all
}
