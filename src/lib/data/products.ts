import type { L10n } from "@/i18n/config"
import { slugify } from "@/lib/format"
import type { Unit } from "@/types"
import { brandRecords } from "@/lib/data/categories"

/** Raw product record holding text in every language. The API turns it into a localized `Product`. */
export interface ProductRecord {
  id: string
  slug: string
  title: L10n
  categorySlug: string
  subcategory: string
  brand: string
  price: number
  oldPrice?: number
  rating: number
  reviewsCount: number
  questionsCount: number
  sku: string
  freshnessDays: number
  stock: number
  units: Unit[]
  deliveryDays: number
  deliveryArea: "europe" | "domestic"
  freeShipping: boolean
  tags: string[]
  createdAt: string
}

type Seed = [en: string, zh: string, subcategory: string, tags?: string[]]

const seeds: Record<string, Seed[]> = {
  bakery: [
    ["Sourdough Rye Bread", "酸种黑麦面包", "Bread"],
    ["Butter Croissants", "黄油可颂", "Pastry"],
    ["Whole Grain Baguette", "全麦法棍", "Bread"],
    ["Cinnamon Rolls", "肉桂卷", "Pastry"],
    ["Carrot Cake Slice", "胡萝卜蛋糕", "Cakes", ["Carrots"]],
    ["Oat Honey Cookies", "燕麦蜂蜜饼干", "Cookies"],
  ],
  "fruit-and-vegetables": [
    ["Carrots from Tomissy Farm", "托米西农场胡萝卜", "Vegetables", ["Carrots", "Fresh food"]],
    ["Cherry Tomatoes", "樱桃番茄", "Vegetables", ["Tomatoes", "Fresh food"]],
    ["Red Gala Apples", "嘎啦红苹果", "Fruit", ["Apples"]],
    ["Organic Garlic", "有机大蒜", "Vegetables", ["Garlic"]],
    ["Brown Mushrooms", "褐蘑菇", "Mushrooms", ["Mushrooms"]],
    ["Chilli Peppers Mix", "混合辣椒", "Vegetables", ["Chilli peppers"]],
    ["Broccoli Crowns", "西兰花", "Vegetables", ["Broccoli"]],
    ["Seedless Watermelon", "无籽西瓜", "Fruit", ["Watermelons"]],
    ["Valencia Oranges", "瓦伦西亚橙", "Fruit", ["Oranges"]],
    ["Fairtrade Bananas", "公平贸易香蕉", "Fruit", ["Bananas"]],
    ["Green Grapes", "青提", "Fruit", ["Grapes"]],
    ["Sweet Cherries", "甜樱桃", "Fruit", ["Cherries"]],
    ["Amalfi Lemons", "阿马尔菲柠檬", "Fruit", ["Lemons"]],
    ["Green Beans", "四季豆", "Vegetables", ["Beans"]],
    ["Fresh Basil", "新鲜罗勒", "Herbs"],
    ["Potatoes Agria", "黄心土豆", "Vegetables", ["Fresh food"]],
  ],
  "meat-and-fish": [
    ["Free Range Chicken Breast", "散养鸡胸肉", "Chicken", ["Meat"]],
    ["Pork Tenderloin", "猪里脊", "Pork", ["Meat"]],
    ["Grass Fed Beef Steak", "草饲牛排", "Beef", ["Meat"]],
    ["Atlantic Salmon Fillet", "大西洋三文鱼排", "Fish", ["Fish"]],
    ["Smoked Mackerel", "烟熏鲭鱼", "Fish", ["Fish"]],
    ["Chicken Drumsticks", "鸡琵琶腿", "Chicken", ["Meat"]],
  ],
  drinks: [
    ["Cold Pressed Orange Juice", "冷压鲜橙汁", "Juices", ["Oranges"]],
    ["Sparkling Spring Water", "含气矿泉水", "Water"],
    ["Green Tea Sencha", "日式煎茶", "Tea"],
    ["Single Origin Coffee Beans", "单一产地咖啡豆", "Coffee"],
    ["Apple & Ginger Juice", "苹果生姜汁", "Juices", ["Apples"]],
  ],
  kitchen: [
    ["Extra Virgin Olive Oil", "特级初榨橄榄油", "Oils"],
    ["Smoked Paprika", "烟熏红椒粉", "Spices"],
    ["Durum Wheat Spaghetti", "硬质小麦意大利面", "Pasta"],
    ["Tomato Basil Sauce", "番茄罗勒酱", "Sauces", ["Tomatoes"]],
    ["Himalayan Pink Salt", "喜马拉雅玫瑰盐", "Spices"],
  ],
  "special-nutrition": [
    ["Gluten Free Oat Flakes", "无麸质燕麦片", "Gluten free"],
    ["Vegan Protein Bar", "纯素蛋白棒", "Vegan"],
    ["Whey Protein Vanilla", "香草味乳清蛋白", "Protein"],
    ["Sugar Free Granola", "无糖格兰诺拉", "Low sugar"],
  ],
  baby: [
    ["Organic Apple Puree", "有机苹果泥", "Baby food", ["Apples"]],
    ["Carrot & Pea Baby Meal", "胡萝卜豌豆辅食", "Baby food", ["Carrots"]],
    ["Rice Rusks", "米饼", "Snacks"],
    ["Gentle Baby Wipes", "温和婴儿湿巾", "Care"],
  ],
  pharmacy: [
    ["Vitamin C 1000 mg", "维生素 C 1000 毫克", "Vitamins", ["Lemons"]],
    ["Chamomile Herbal Tea", "洋甘菊花草茶", "Herbal"],
    ["Multivitamin Daily", "每日复合维生素", "Vitamins"],
    ["Aloe Vera Gel", "芦荟凝胶", "Care"],
  ],
}

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

function buildProducts(): ProductRecord[] {
  const rand = rng(42)
  const list: ProductRecord[] = []
  let n = 0
  for (const [categorySlug, items] of Object.entries(seeds)) {
    for (const [en, zh, subcategory, tags = []] of items) {
      n++
      const price = Math.round((0.25 + rand() * 48) * 100) / 100
      const discounted = rand() < 0.45
      const picked = brandRecords[Math.floor(rand() * brandRecords.length)].key
      // keep names consistent: "Carrots from Tomissy Farm" must be sold by Tomissy Farm
      const brand = brandRecords.find((b) => en.includes(b.key))?.key ?? picked
      list.push({
        id: `p${String(n).padStart(3, "0")}`,
        slug: slugify(en),
        title: { en, zh },
        categorySlug,
        subcategory,
        brand,
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
        deliveryArea: rand() < 0.5 ? "europe" : "domestic",
        freeShipping: rand() < 0.6,
        tags,
        createdAt: new Date(Date.UTC(2020, 0, 1) + n * 86400000 * 3).toISOString(),
      })
    }
  }
  return list
}

export const productRecords: ProductRecord[] = buildProducts()

export const reviewTexts: Record<"en" | "zh", { authors: string[]; bodies: string[] }> = {
  en: {
    authors: ["Anna Novak", "Petr Svoboda", "Lucy Martin", "Tomas Dvorak", "Emma Brown"],
    bodies: [
      "Super fresh and tasty, arrived the next morning. Will order again!",
      "Great quality for the price. The packaging could be a bit less plastic.",
      "My kids love them. Sweet, crunchy and clearly grown with care.",
      "Good, but one item was slightly bruised. Support sorted it quickly.",
      "Best I've had from an online grocery so far.",
    ],
  },
  zh: {
    authors: ["王小明", "李华", "陈静", "张伟", "刘洋"],
    bodies: [
      "非常新鲜，第二天一早就送到了，还会再买！",
      "这个价格品质很好，就是包装塑料有点多。",
      "孩子特别喜欢，又甜又脆，一看就是用心种的。",
      "整体不错，有一个稍微磕碰了，客服很快就处理好了。",
      "是我在网上买过最好的生鲜。",
    ],
  },
}

export { rng }
