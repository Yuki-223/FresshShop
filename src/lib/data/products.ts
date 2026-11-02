import type { Product, Review, Unit } from "@/types"
import { slugify } from "@/lib/format"

type Seed = [title: string, subcategory: string, tags?: string[]]

const seeds: Record<string, Seed[]> = {
  bakery: [
    ["Sourdough Rye Bread", "Bread"],
    ["Butter Croissants", "Pastry"],
    ["Whole Grain Baguette", "Bread"],
    ["Cinnamon Rolls", "Pastry"],
    ["Carrot Cake Slice", "Cakes", ["Carrots"]],
    ["Oat Honey Cookies", "Cookies"],
  ],
  "fruit-and-vegetables": [
    ["Carrots from Tomissy Farm", "Vegetables", ["Carrots", "Fresh food"]],
    ["Cherry Tomatoes", "Vegetables", ["Tomatoes", "Fresh food"]],
    ["Red Gala Apples", "Fruit", ["Apples"]],
    ["Organic Garlic", "Vegetables", ["Garlic"]],
    ["Brown Mushrooms", "Mushrooms", ["Mushrooms"]],
    ["Chilli Peppers Mix", "Vegetables", ["Chilli peppers"]],
    ["Broccoli Crowns", "Vegetables", ["Broccoli"]],
    ["Seedless Watermelon", "Fruit", ["Watermelons"]],
    ["Valencia Oranges", "Fruit", ["Oranges"]],
    ["Fairtrade Bananas", "Fruit", ["Bananas"]],
    ["Green Grapes", "Fruit", ["Grapes"]],
    ["Sweet Cherries", "Fruit", ["Cherries"]],
    ["Amalfi Lemons", "Fruit", ["Lemons"]],
    ["Green Beans", "Vegetables", ["Beans"]],
    ["Fresh Basil", "Herbs"],
    ["Potatoes Agria", "Vegetables", ["Fresh food"]],
  ],
  "meat-and-fish": [
    ["Free Range Chicken Breast", "Chicken", ["Meat"]],
    ["Pork Tenderloin", "Pork", ["Meat"]],
    ["Grass Fed Beef Steak", "Beef", ["Meat"]],
    ["Atlantic Salmon Fillet", "Fish", ["Fish"]],
    ["Smoked Mackerel", "Fish", ["Fish"]],
    ["Chicken Drumsticks", "Chicken", ["Meat"]],
  ],
  drinks: [
    ["Cold Pressed Orange Juice", "Juices", ["Oranges"]],
    ["Sparkling Spring Water", "Water"],
    ["Green Tea Sencha", "Tea"],
    ["Single Origin Coffee Beans", "Coffee"],
    ["Apple & Ginger Juice", "Juices", ["Apples"]],
  ],
  kitchen: [
    ["Extra Virgin Olive Oil", "Oils"],
    ["Smoked Paprika", "Spices"],
    ["Durum Wheat Spaghetti", "Pasta"],
    ["Tomato Basil Sauce", "Sauces", ["Tomatoes"]],
    ["Himalayan Pink Salt", "Spices"],
  ],
  "special-nutrition": [
    ["Gluten Free Oat Flakes", "Gluten free"],
    ["Vegan Protein Bar", "Vegan"],
    ["Whey Protein Vanilla", "Protein"],
    ["Sugar Free Granola", "Low sugar"],
  ],
  baby: [
    ["Organic Apple Puree", "Baby food", ["Apples"]],
    ["Carrot & Pea Baby Meal", "Baby food", ["Carrots"]],
    ["Rice Rusks", "Snacks"],
    ["Gentle Baby Wipes", "Care"],
  ],
  pharmacy: [
    ["Vitamin C 1000 mg", "Vitamins", ["Lemons"]],
    ["Chamomile Herbal Tea", "Herbal"],
    ["Multivitamin Daily", "Vitamins"],
    ["Aloe Vera Gel", "Care"],
  ],
}

const brands = ["Tomissy Farm", "Grocery Farm Fields", "Tharamis Farm", "Green Valley", "Mountain Fresh"]
const unitSets: Unit[][] = [
  ["pcs", "kgs", "box", "pack"],
  ["pcs", "pack"],
  ["kgs", "box"],
  ["pcs"],
]

/** Tiny deterministic PRNG so mock data is stable between server renders. */
function rng(seed: number) {
  let t = seed
  return () => {
    t = (t + 0x6d2b79f5) | 0
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function buildProducts(): Product[] {
  const rand = rng(42)
  const list: Product[] = []
  let n = 0
  for (const [categorySlug, items] of Object.entries(seeds)) {
    for (const [title, subcategory, tags = []] of items) {
      n++
      const price = Math.round((0.25 + rand() * 48) * 100) / 100
      const discounted = rand() < 0.45
      const pickedBrand = brands[Math.floor(rand() * brands.length)]
      // keep names consistent: "Carrots from Tomissy Farm" must be sold by Tomissy Farm
      const brand = brands.find((b) => title.includes(b)) ?? pickedBrand
      const product: Product = {
        id: `p${String(n).padStart(3, "0")}`,
        slug: slugify(title),
        title,
        description: "Space for a small product description",
        longDescription: `${title.includes(brand) ? title : `${title} from ${brand}`} are one of the best on the market. The family behind ${brand} is giving full love to their bio products, grown naturally and harvested at the right moment so they arrive at your door full of flavour.`,
        categorySlug,
        subcategory,
        brand,
        farm: brand === "Tomissy Farm" ? "Grocery Tarm Fields" : brand,
        price,
        oldPrice: discounted ? Math.round((price / 0.64) * 100) / 100 : undefined,
        rating: 2 + Math.floor(rand() * 4),
        reviewsCount: Math.floor(rand() * 30),
        questionsCount: Math.floor(rand() * 6),
        sku: String(70000 + Math.floor(rand() * 9999)),
        freshnessDays: 1 + Math.floor(rand() * 3),
        stock: rand() < 0.12 ? 0 : 20 + Math.floor(rand() * 400),
        units: unitSets[Math.floor(rand() * unitSets.length)],
        deliveryDays: 1 + Math.floor(rand() * 3),
        deliveryArea: rand() < 0.5 ? "Europe" : "Czech republic",
        freeShipping: rand() < 0.6,
        tags,
        createdAt: new Date(Date.UTC(2020, 0, 1) + n * 86400000 * 3).toISOString(),
      }
      list.push(product)
    }
  }
  return list
}

export const products: Product[] = buildProducts()

const reviewBodies = [
  "Super fresh and tasty, arrived the next morning. Will order again!",
  "Great quality for the price. The packaging could be a bit less plastic.",
  "My kids love them. Sweet, crunchy and clearly grown with care.",
  "Good, but one item was slightly bruised. Support sorted it quickly.",
  "Best I've had from an online grocery so far.",
]
const reviewers = ["Anna Novak", "Petr Svoboda", "Lucy Martin", "Tomas Dvorak", "Emma Brown"]

export function buildReviews(product: Product): Review[] {
  const rand = rng(Number(product.id.slice(1)) * 7)
  const count = Math.min(product.reviewsCount, 5)
  return Array.from({ length: count }, (_, i) => ({
    id: `${product.id}-r${i}`,
    productId: product.id,
    author: reviewers[Math.floor(rand() * reviewers.length)],
    rating: Math.max(1, Math.min(5, product.rating + Math.round(rand() * 2 - 1))),
    date: new Date(Date.UTC(2020, 5, 1 + i * 4)).toISOString(),
    body: reviewBodies[Math.floor(rand() * reviewBodies.length)],
  }))
}
