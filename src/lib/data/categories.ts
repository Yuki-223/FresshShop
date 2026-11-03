import type { L10n } from "@/i18n/config"

export interface CategoryRecord {
  slug: string
  name: L10n
  subcategories: { value: string; label: L10n }[]
}

const sub = (en: string, zh: string) => ({ value: en, label: { en, zh } })

export const categoryRecords: CategoryRecord[] = [
  {
    slug: "bakery",
    name: { en: "Bakery", zh: "烘焙面包" },
    subcategories: [sub("Bread", "面包"), sub("Pastry", "酥点"), sub("Cakes", "蛋糕"), sub("Cookies", "饼干")],
  },
  {
    slug: "fruit-and-vegetables",
    name: { en: "Fruit and vegetables", zh: "水果蔬菜" },
    subcategories: [sub("Vegetables", "蔬菜"), sub("Fruit", "水果"), sub("Herbs", "香草"), sub("Mushrooms", "菌菇")],
  },
  {
    slug: "meat-and-fish",
    name: { en: "Meat and fish", zh: "肉禽水产" },
    subcategories: [sub("Chicken", "鸡肉"), sub("Pork", "猪肉"), sub("Beef", "牛肉"), sub("Fish", "鱼类")],
  },
  {
    slug: "drinks",
    name: { en: "Drinks", zh: "酒水饮料" },
    subcategories: [sub("Juices", "果汁"), sub("Water", "饮用水"), sub("Tea", "茶"), sub("Coffee", "咖啡")],
  },
  {
    slug: "kitchen",
    name: { en: "Kitchen", zh: "厨房调味" },
    subcategories: [sub("Oils", "食用油"), sub("Spices", "香料"), sub("Pasta", "意面"), sub("Sauces", "酱料")],
  },
  {
    slug: "special-nutrition",
    name: { en: "Special nutrition", zh: "特殊膳食" },
    subcategories: [sub("Gluten free", "无麸质"), sub("Vegan", "纯素"), sub("Protein", "蛋白补充"), sub("Low sugar", "低糖")],
  },
  {
    slug: "baby",
    name: { en: "Baby", zh: "母婴" },
    subcategories: [sub("Baby food", "辅食"), sub("Snacks", "零食"), sub("Care", "护理")],
  },
  {
    slug: "pharmacy",
    name: { en: "Pharmacy", zh: "健康保健" },
    subcategories: [sub("Vitamins", "维生素"), sub("Herbal", "草本"), sub("Care", "护理")],
  },
]

/** Product tags: stable key + labels. The footer links search for the localized label. */
export const productTagRecords: { key: string; label: L10n }[] = [
  ["Beans", "豆角"],
  ["Carrots", "胡萝卜"],
  ["Apples", "苹果"],
  ["Garlic", "大蒜"],
  ["Mushrooms", "蘑菇"],
  ["Tomatoes", "番茄"],
  ["Chilli peppers", "辣椒"],
  ["Broccoli", "西兰花"],
  ["Watermelons", "西瓜"],
  ["Oranges", "橙子"],
  ["Bananas", "香蕉"],
  ["Grapes", "葡萄"],
  ["Cherries", "樱桃"],
  ["Meat", "肉类"],
  ["Fish", "鱼"],
  ["Fresh food", "生鲜"],
  ["Lemons", "柠檬"],
].map(([en, zh]) => ({ key: en, label: { en, zh } }))

export const brandRecords: { key: string; label: L10n }[] = [
  { key: "Tomissy Farm", label: { en: "Tomissy Farm", zh: "托米西农场" } },
  { key: "Grocery Farm Fields", label: { en: "Grocery Farm Fields", zh: "丰田农庄" } },
  { key: "Tharamis Farm", label: { en: "Tharamis Farm", zh: "塔拉米斯农场" } },
  { key: "Green Valley", label: { en: "Green Valley", zh: "青谷农场" } },
  { key: "Mountain Fresh", label: { en: "Mountain Fresh", zh: "山野鲜" } },
]
