import type { L10n, Locale } from "@/i18n/config"
import type { BlogBlock } from "@/types"

export const testimonialRecords: { id: string; quote: L10n; author: L10n }[] = [
  {
    id: "t1",
    quote: {
      en: "This is an super space for your customers qoute. Don't worry it works smooth as pie. You will get all what you need by writiing a text here",
      zh: "下单方便，配送准时，蔬菜水果都特别新鲜。现在全家的日常食材基本都在这里买。",
    },
    author: { en: "Name and Surname", zh: "王女士" },
  },
  {
    id: "t2",
    quote: {
      en: "Ordering vegetables here is faster than walking to the market. Everything arrives crisp, cold and exactly on time.",
      zh: "在这里买菜比去菜市场还快，送到时又脆又凉，时间也特别准。",
    },
    author: { en: "Lucy Martin", zh: "陈静" },
  },
  {
    id: "t3",
    quote: {
      en: "I love knowing which farm my food comes from. The carrots from Tomissy Farm are simply the best in town.",
      zh: "每样食材都能看到来自哪个农场，很安心。托米西农场的胡萝卜是我吃过最甜的。",
    },
    author: { en: "Petr Svoboda", zh: "李先生" },
  },
  {
    id: "t4",
    quote: {
      en: "Great prices on the weekly deals and the customer support actually answers. Highly recommended for families.",
      zh: "每周特惠很划算，客服回复也及时，非常适合有孩子的家庭。",
    },
    author: { en: "Anna Novak", zh: "张女士" },
  },
  {
    id: "t5",
    quote: {
      en: "Freshness you can taste. The bakery section has become our Sunday morning ritual.",
      zh: "新鲜看得见也吃得出。周末早上来一份烘焙，已经成了我们家的习惯。",
    },
    author: { en: "Tomas Dvorak", zh: "刘先生" },
  },
]

function article(locale: Locale, title: string): BlogBlock[] {
  if (locale === "zh") {
    return [
      { type: "paragraph", text: `${title}其实没有那么复杂。我们努力确保所售的每一份水果和蔬菜都新鲜优质，不是自己种植的，就从精心挑选的供应商处采购，并且优先选择本地产品。` },
      { type: "heading", text: "从应季食材开始" },
      { type: "paragraph", text: "应季食材更便宜、更好吃，运输距离也更短。每周逛逛商城，看看什么最新鲜，再围绕它来安排菜单：胡萝卜、番茄和绿叶菜几乎永远不会出错。" },
      { type: "image", caption: "刚从农场送来的新鲜蔬果" },
      { type: "list", items: ["提前规划三顿晚餐，一次买齐", "到货后马上把蔬菜处理好", "把香草插在水杯里放在台面上", "一次煮好一批谷物，分装冷冻"] },
      { type: "quote", text: "好的食物是幸福的基础，而这一切都从你的菜篮子开始。" },
      { type: "heading", text: "全家一起参与" },
      { type: "paragraph", text: "每周让孩子各挑一种蔬菜，一起动手做。这是让挑食的孩子变得好奇的最简单方法。无论是烤、拌沙拉、煲汤，还是做砂锅和蛋糕，蔬菜都能为菜肴增添清甜、口感和色彩。" },
    ]
  }
  return [
    { type: "paragraph", text: `${title} doesn't have to be complicated. We work hard to ensure that the fruit and vegetables we sell are fresh and high in quality. If we don't grow them ourselves, we source them from carefully chosen suppliers, preferring to buy locally whenever possible.` },
    { type: "heading", text: "Start with seasonal ingredients" },
    { type: "paragraph", text: "Seasonal produce is cheaper, tastier and travels less. Visit the market section each week and build your menu around what's freshest — carrots, tomatoes and leafy greens are almost always a safe bet." },
    { type: "image", caption: "Fresh produce straight from the farm" },
    { type: "list", items: ["Plan three dinners ahead and shop once", "Prep vegetables right after delivery", "Keep herbs in a glass of water on the counter", "Cook grains in bulk and freeze portions"] },
    { type: "quote", text: "Good food is the foundation of genuine happiness — and it starts with what you put in your basket." },
    { type: "heading", text: "Make it a family thing" },
    { type: "paragraph", text: "Let the kids pick one vegetable each week and cook it together. It's the easiest way to turn picky eaters into curious ones. From roasts, salads and soups to casseroles and cakes, vegetables lend sweetness, texture and colour to an enormous number of recipes." },
  ]
}

export const blogTagLabels: Record<string, L10n> = {
  "Dinner tips": { en: "Dinner tips", zh: "晚餐灵感" },
  Vegetable: { en: "Vegetable", zh: "蔬菜" },
  Breakfast: { en: "Breakfast", zh: "早餐" },
  Bakery: { en: "Bakery", zh: "烘焙" },
  Fruit: { en: "Fruit", zh: "水果" },
  Farmers: { en: "Farmers", zh: "农场故事" },
  Drinks: { en: "Drinks", zh: "饮品" },
  "Fresh food": { en: "Fresh food", zh: "生鲜" },
  Recipes: { en: "Recipes", zh: "食谱" },
}

export interface BlogRecord {
  slug: string
  title: L10n
  excerpt: L10n
  tag: string
  author: L10n
  date: string
  readMinutes: number
}

export const blogRecords: BlogRecord[] = [
  {
    slug: "chef-tips-tasty-dinner-in-20-minutes",
    title: { en: "Our chef tips for a great and tasty dinner ready in 20 minutes", zh: "主厨教你 20 分钟做出美味晚餐" },
    excerpt: { en: "Quick, healthy and delicious: our head chef shares the tricks for weeknight dinners.", zh: "快手、健康又好吃：主厨分享工作日晚餐的小窍门。" },
    tag: "Dinner tips",
    author: { en: "Petr Bilek", zh: "彼得" },
    date: "2020-06-17T00:00:00Z",
    readMinutes: 6,
  },
  {
    slug: "which-vegetable-your-family-will-love",
    title: { en: "Which vegetable your family will love and want's eat each day", zh: "哪种蔬菜能让全家天天爱吃？" },
    excerpt: { en: "We asked hundreds of families what makes vegetables disappear from the plate.", zh: "我们问了几百个家庭，什么样的蔬菜最容易被一扫而光。" },
    tag: "Vegetable",
    author: { en: "Anna Novak", zh: "张女士" },
    date: "2020-06-15T00:00:00Z",
    readMinutes: 4,
  },
  {
    slug: "salad-good-start-morning-routine",
    title: { en: "Salat is kinda good start to your morning routines", zh: "用一份沙拉开启美好早晨" },
    excerpt: { en: "A light, crunchy breakfast salad that keeps you full until lunch.", zh: "一份清爽脆口的早餐沙拉，饱腹到午饭。" },
    tag: "Breakfast",
    author: { en: "Lucy Martin", zh: "陈静" },
    date: "2020-01-14T00:00:00Z",
    readMinutes: 3,
  },
  {
    slug: "chef-tips-great-and-healthy-breakfast",
    title: { en: "Our chef tips for a great and healthy breakfast", zh: "主厨推荐的健康早餐" },
    excerpt: { en: "Five breakfast ideas that take less than ten minutes.", zh: "五款十分钟内就能搞定的早餐。" },
    tag: "Breakfast",
    author: { en: "Petr Bilek", zh: "彼得" },
    date: "2020-01-14T00:00:00Z",
    readMinutes: 5,
  },
  {
    slug: "prepare-simple-and-delicious-breads",
    title: { en: "Prepare a simple and delicious breads", zh: "在家做简单又好吃的面包" },
    excerpt: { en: "No fancy equipment needed — just flour, water, salt and a little patience.", zh: "不需要专业设备，只要面粉、水、盐和一点耐心。" },
    tag: "Bakery",
    author: { en: "Tomas Dvorak", zh: "刘先生" },
    date: "2020-01-14T00:00:00Z",
    readMinutes: 7,
  },
  {
    slug: "how-to-store-fruit-longer",
    title: { en: "How to store fruit so it stays fresh longer", zh: "水果怎么存放才能更久保鲜" },
    excerpt: { en: "Which fruit belongs in the fridge and which should never go there.", zh: "哪些水果该进冰箱，哪些千万别放进去。" },
    tag: "Fruit",
    author: { en: "Emma Brown", zh: "刘洋" },
    date: "2020-01-10T00:00:00Z",
    readMinutes: 4,
  },
  {
    slug: "meet-the-farmers-tomissy-farm",
    title: { en: "Meet the farmers: a day at Tomissy Farm", zh: "走近农场：在托米西农场的一天" },
    excerpt: { en: "We spent a day in the fields with the family behind our best-selling carrots.", zh: "我们和热销胡萝卜背后的那家人，在田里待了一整天。" },
    tag: "Farmers",
    author: { en: "Anna Novak", zh: "张女士" },
    date: "2020-01-05T00:00:00Z",
    readMinutes: 8,
  },
  {
    slug: "fish-on-friday-easy-recipes",
    title: { en: "Fish on Friday: three easy oven recipes", zh: "周五吃鱼：三道简单的烤箱菜" },
    excerpt: { en: "Salmon, mackerel and cod — three foolproof ways to cook fish at home.", zh: "三文鱼、鲭鱼和鳕鱼，三种零失败的家常做法。" },
    tag: "Dinner tips",
    author: { en: "Lucy Martin", zh: "陈静" },
    date: "2019-12-20T00:00:00Z",
    readMinutes: 5,
  },
  {
    slug: "smoothies-kids-actually-drink",
    title: { en: "Smoothies your kids will actually drink", zh: "孩子愿意喝的蔬果奶昔" },
    excerpt: { en: "Sneak some greens into breakfast without any complaints.", zh: "把绿叶菜悄悄加进早餐，孩子也不会抱怨。" },
    tag: "Drinks",
    author: { en: "Emma Brown", zh: "刘洋" },
    date: "2019-12-12T00:00:00Z",
    readMinutes: 3,
  },
]

export function blogArticle(locale: Locale, title: string) {
  return article(locale, title)
}

export const nutritionRecords: { name: L10n; quantity: string; dv: string }[] = [
  { name: { en: "Vitamin A equiv.", zh: "维生素 A 当量" }, quantity: "735 μg", dv: "104 %" },
  { name: { en: "Thiamine (B1)", zh: "硫胺素（B1）" }, quantity: "0.066 mg", dv: "6 %" },
  { name: { en: "Niacin (B3)", zh: "烟酸（B3）" }, quantity: "0.983 mg", dv: "7 %" },
  { name: { en: "Folate (B9)", zh: "叶酸（B9）" }, quantity: "19 μg", dv: "5 %" },
  { name: { en: "Vitamin C", zh: "维生素 C" }, quantity: "5.9 mg", dv: "7 %" },
  { name: { en: "Vitamin E", zh: "维生素 E" }, quantity: "0.66 mg", dv: "4 %" },
  { name: { en: "Vitamin K", zh: "维生素 K" }, quantity: "13.2 μg", dv: "13 %" },
]

export const questionRecords: { q: L10n; a: L10n }[] = [
  {
    q: { en: "How long does it stay fresh?", zh: "能保鲜多久？" },
    a: { en: "Stored in the fridge, about 2–3 weeks. We ship everything within 24 hours of harvest.", zh: "冷藏可保存约 2–3 周。所有商品都在采摘后 24 小时内发货。" },
  },
  {
    q: { en: "Is it certified organic?", zh: "有有机认证吗？" },
    a: { en: "Yes, all our partner farms hold an EU organic certification.", zh: "有的，我们所有的合作农场都通过了有机认证。" },
  },
  {
    q: { en: "Can I choose a delivery day?", zh: "可以指定送货日期吗？" },
    a: { en: "Sure — add a note at checkout and we will do our best to match it.", zh: "可以，结算时在备注里写明，我们会尽量安排。" },
  },
  {
    q: { en: "Do you deliver outside the EU?", zh: "可以配送到偏远地区吗？" },
    a: { en: "Not yet, but we are working on it.", zh: "目前还不行，我们正在努力扩大配送范围。" },
  },
]

export const deliveryAreaLabels: Record<"europe" | "domestic", L10n> = {
  europe: { en: "Europe", zh: "全国" },
  domestic: { en: "Czech republic", zh: "江浙沪" },
}
