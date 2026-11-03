import type { L10n } from "@/i18n/config"

/**
 * The source site has 18 health categories — too many for the top navigation.
 * They are grouped into 8 navigation groups; each group's dropdown lists its categories.
 * A product belongs to a group when it belongs to any of the group's categories.
 */
export const navGroups: { slug: string; name: L10n; categories: string[] }[] = [
  {
    slug: "vitamins-wellness",
    name: { en: "Vitamins & Wellness", zh: "维生素与基础营养" },
    categories: ["essential-wellness", "vitamins-and-minerals", "omega-3s-and-fish-oil", "magnesium"],
  },
  { slug: "gut-detox", name: { en: "Gut & Detox", zh: "肠道与排毒" }, categories: ["digestion-and-probiotics", "liver-and-detox"] },
  {
    slug: "brain-mood-sleep",
    name: { en: "Brain, Mood & Sleep", zh: "大脑、情绪与睡眠" },
    categories: ["brain-and-cognitive-health", "stress-mental-health", "sleep"],
  },
  { slug: "heart-metabolism", name: { en: "Heart & Metabolism", zh: "心脏与代谢" }, categories: ["heart-health", "weight-management"] },
  { slug: "immune", name: { en: "Immune Health", zh: "免疫健康" }, categories: ["immune-health"] },
  {
    slug: "joint-sports",
    name: { en: "Joint & Sports", zh: "关节与运动" },
    categories: ["pain-bone-and-joint", "protein-and-sports-nutrition"],
  },
  { slug: "women-men-kids", name: { en: "Women, Men & Kids", zh: "女性、男性与儿童" }, categories: ["womens-health", "mens-health", "kids-health"] },
  { slug: "bundles", name: { en: "Bundles", zh: "组合装" }, categories: ["bundle-and-save"] },
]

/** Chinese labels for the 18 source categories (English comes from the collected data). */
export const categoryZh: Record<string, string> = {
  "bundle-and-save": "组合优惠",
  "brain-and-cognitive-health": "大脑与认知",
  "digestion-and-probiotics": "消化与益生菌",
  "heart-health": "心脏健康",
  "essential-wellness": "基础健康",
  "immune-health": "免疫健康",
  "liver-and-detox": "肝脏与排毒",
  magnesium: "镁补充",
  "omega-3s-and-fish-oil": "Omega-3 与鱼油",
  "pain-bone-and-joint": "骨骼与关节",
  "protein-and-sports-nutrition": "蛋白与运动营养",
  sleep: "睡眠",
  "stress-mental-health": "压力与情绪",
  "vitamins-and-minerals": "维生素与矿物质",
  "weight-management": "体重管理",
  "womens-health": "女性健康",
  "mens-health": "男性健康",
  "kids-health": "儿童健康",
}

export const formZh: Record<string, string> = {
  Tablets: "片剂",
  Capsules: "胶囊",
  Softgels: "软胶囊",
  Powders: "粉剂",
  Chewables: "咀嚼型",
  Packets: "独立包装",
  Programs: "疗程套装",
  Bundles: "组合装",
  Bars: "能量棒",
  Liquids: "液体",
  Other: "其他",
}
