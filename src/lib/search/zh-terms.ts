/**
 * Chinese search over an English catalog. The product data is English only, so a Chinese query
 * ("鱼油", "益生菌胶囊", "女性 维生素d") is cut into known words (longest first) and each word is
 * replaced by its English equivalents. A product matches when every recognised word matches one
 * of its equivalents; Latin words typed alongside ("鱼油 1000") must match as well. Characters
 * that are no known word ("的", "推荐") are ignored, as long as at least one word was recognised.
 *
 * English needles match at the start of a word ("men's" doesn't hit "women's"), and may be word stems ("digest" → digestion, digestive).
 */

/** Chinese word → English words or stems (any of them may match). Keys are lower case. */
export const ZH_TERMS: Record<string, string[]> = {
  // fish oil & fats
  鱼油: ["fish oil", "omega"],
  深海鱼油: ["fish oil", "omega"],
  欧米伽: ["omega"],
  欧米茄: ["omega"],
  "omega-3": ["omega"],
  // probiotics
  益生菌: ["probiotic"],
  益生元: ["prebiotic"],
  后生元: ["postbiotic"],
  // minerals
  镁: ["magnesium", "mag"],
  钙: ["calcium", "bone builder"],
  锌: ["zinc"],
  铁: ["iron"],
  矿物质: ["mineral"],
  电解质: ["electrolyte"],
  // vitamins
  维生素: ["vitamin", "multivitamin"],
  维他命: ["vitamin", "multivitamin"],
  复合维生素: ["multivitamin", "multi"],
  多种维生素: ["multivitamin", "multi"],
  多维: ["multivitamin", "multi"],
  维生素d: ["vitamin d", "d3"],
  维生素d3: ["vitamin d", "d3"],
  维他命d: ["vitamin d", "d3"],
  维生素c: ["vitamin c", "potent-c"],
  维他命c: ["vitamin c", "potent-c"],
  维生素b: ["vitamin b", "b12", "b-complex", "methyl"],
  维生素b12: ["b12"],
  b族: ["vitamin b", "b12", "b-complex", "methyl"],
  叶酸: ["folate", "folic"],
  // other ingredients
  蛋白: ["protein"],
  蛋白粉: ["protein"],
  乳清: ["whey"],
  乳清蛋白: ["whey"],
  胶原蛋白: ["collagen"],
  肌酸: ["creatine"],
  辅酶q10: ["coq10"],
  辅酶: ["coq10"],
  小檗碱: ["berberine"],
  黄连素: ["berberine"],
  纤维: ["fiber"],
  膳食纤维: ["fiber"],
  酶: ["enzyme", "spectrazyme"],
  消化酶: ["enzyme", "spectrazyme"],
  姜黄: ["turmeric", "curcumin"],
  褪黑素: ["melatonin"],
  抗氧化: ["antioxidant"],
  // health topics
  免疫: ["immune"],
  免疫力: ["immune"],
  肠道: ["gut", "intestin", "bowel", "digest"],
  肠胃: ["gut", "digest", "stomach"],
  胃: ["stomach", "gastr", "digest"],
  消化: ["digest"],
  排毒: ["detox"],
  肝: ["liver"],
  肝脏: ["liver"],
  护肝: ["liver"],
  心脏: ["heart", "cardio"],
  心血管: ["cardio", "heart"],
  血糖: ["glucose", "blood sugar", "insulin"],
  血压: ["blood pressure"],
  胆固醇: ["cholesterol"],
  代谢: ["metabol"],
  体重: ["weight"],
  减重: ["weight"],
  减肥: ["weight"],
  体重管理: ["weight"],
  关节: ["joint"],
  骨: ["bone"],
  骨骼: ["bone"],
  肌肉: ["muscle"],
  运动: ["sport", "muscle", "creatine", "electrolyte", "protein"],
  睡眠: ["sleep"],
  助眠: ["sleep"],
  失眠: ["sleep"],
  压力: ["stress"],
  减压: ["stress"],
  焦虑: ["stress", "calm"],
  放松: ["relax", "calm"],
  情绪: ["mood"],
  大脑: ["brain"],
  脑: ["brain"],
  认知: ["cognit"],
  记忆: ["memory", "cognit"],
  能量: ["energy"],
  精力: ["energy"],
  疲劳: ["energy", "fatigue"],
  女性: ["women", "woman", "herwellness", "female"],
  男性: ["men's", "men’s", "men$", "male$"],
  儿童: ["kid", "child"],
  孩子: ["kid", "child"],
  更年期: ["menopaus"],
  经期: ["period", "menstru"],
  月经: ["period", "menstru"],
  荷尔蒙: ["hormon"],
  激素: ["hormon"],
  肾上腺: ["adrenal"],
  眼: ["eye", "vision"],
  眼睛: ["eye", "vision"],
  视力: ["eye", "vision"],
  皮肤: ["skin"],
  头发: ["hair"],
  呼吸: ["respirat"],
  泌尿: ["urinary"],
  炎症: ["inflamm"],
  疼痛: ["pain", "relief", "discomfort", "sore"],
  止痛: ["pain", "relief"],
  酸痛: ["sore", "pain"],
  衰老: ["aging", "longevity"],
  抗衰老: ["aging", "longevity"],
  孕期: ["prenatal", "pregnan"],
  备孕: ["prenatal", "pregnan", "fertil"],
  甲状腺: ["thyroid"],
  // product types
  奶昔: ["shake"],
  代餐: ["meal", "shake"],
  粉: ["powder"],
  粉剂: ["powder"],
  胶囊: ["capsule"],
  软胶囊: ["softgel"],
  片: ["tablet"],
  片剂: ["tablet"],
  咀嚼片: ["chew"],
  软糖: ["chew", "gumm"],
  组合: ["bundle"],
  套装: ["bundle", "program", "kit"],
  疗程: ["program"],
}

const HAN = /[㐀-鿿]/
const KEYS = Object.keys(ZH_TERMS).sort((a, b) => b.length - a.length)
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
/** "men$" = the whole word only (not "menstrual", "menopause") */
const atWordStart = (needle: string) =>
  needle.endsWith("$")
    ? new RegExp(`(?:^|[^a-z0-9])${escape(needle.slice(0, -1))}(?![a-z0-9])`, "i")
    : new RegExp(`(?:^|[^a-z0-9])${escape(needle)}`, "i")

/** Each group lists alternatives; every group must match. null = not a Chinese query. */
export function zhQueryGroups(query: string): RegExp[][] | null {
  const q = query.trim().toLowerCase()
  if (!HAN.test(q)) return null
  const groups: RegExp[][] = []
  let rest = ""
  for (let i = 0; i < q.length; ) {
    const key = KEYS.find((k) => q.startsWith(k, i))
    if (key) {
      groups.push(ZH_TERMS[key].map(atWordStart))
      rest += " "
      i += key.length
    } else {
      rest += q[i]
      i++
    }
  }
  // Latin words / numbers typed with the Chinese ones ("鱼油 1000", "uLtraflora 益生菌")
  for (const word of rest.split(/[^a-z0-9+-]+/)) if (word.length >= 2 || /\d/.test(word)) groups.push([atWordStart(word)])
  return groups
}

/**
 * Does `text` (a product's English name, subtitle, summary, labels…) match the Chinese query?
 * `zhText` holds the product's Chinese labels (category, form), matched literally first.
 */
export function matchesZhQuery(groups: RegExp[][], query: string, text: string, zhText: string): boolean {
  if (zhText.includes(query.trim())) return true
  return groups.length > 0 && groups.every((alts) => alts.some((re) => re.test(text)))
}
