import type { L10n } from "@/i18n/config"

/** Simple informational pages linked from the header/footer (not part of the Figma boards). */
export const infoPages: Record<string, { title: L10n; intro: L10n }> = {
  about: {
    title: { en: "About Us", zh: "关于我们" },
    intro: {
      en: "Freshnesecom offers practitioner-grade supplements for everyday health needs — from probiotics and omega-3s to protein and sleep support.",
      zh: "Freshnesecom 提供专业级营养补充剂，满足日常健康需求：益生菌、Omega-3、蛋白粉、睡眠支持等。",
    },
  },
  careers: {
    title: { en: "Careers", zh: "加入我们" },
    intro: { en: "We are always looking for people who care about health. Drop us a line at info@freshnesecom.com.", zh: "我们一直在寻找关注健康的伙伴，欢迎发邮件到 info@freshnesecom.com。" },
  },
  press: {
    title: { en: "Press Releases", zh: "新闻动态" },
    intro: { en: "News and media resources about Freshnesecom.", zh: "Freshnesecom 的最新动态和媒体资料。" },
  },
  affiliate: {
    title: { en: "Become an Affiliate", zh: "成为推广伙伴" },
    intro: { en: "Earn a commission by recommending supplements you trust.", zh: "推荐你信赖的营养补充剂，即可获得佣金。" },
  },
  advertise: {
    title: { en: "Advertise your product", zh: "投放广告" },
    intro: { en: "Reach thousands of health-conscious customers.", zh: "触达成千上万关注健康的顾客。" },
  },
  sell: {
    title: { en: "Sell on Market", zh: "入驻开店" },
    intro: { en: "Are you a supplement brand? Join our marketplace and sell directly to customers.", zh: "你是营养品牌吗？入驻我们的商城，直接把产品卖给消费者。" },
  },
  account: {
    title: { en: "Your account", zh: "我的账户" },
    intro: { en: "Sign-in is not part of this demo. Your cart and wish list are saved in this browser.", zh: "此演示版本暂不支持登录，购物车和心愿单保存在当前浏览器中。" },
  },
  returns: {
    title: { en: "Returns Centre", zh: "退换货中心" },
    intro: { en: "Not happy with a product? Contact us within 48 hours and we will refund or replace it.", zh: "对商品不满意？48 小时内联系我们，即可退款或换货。" },
  },
  protection: {
    title: { en: "100 % purchase protection", zh: "100% 购物保障" },
    intro: { en: "Every order is covered: if it arrives damaged, we replace it for free.", zh: "每一笔订单都有保障：商品破损免费补发。" },
  },
  help: {
    title: { en: "Help", zh: "帮助中心" },
    intro: { en: "Questions about an order? Chat with us or call +420 336 775 664.", zh: "订单有疑问？联系在线客服，或拨打 400-800-1234。" },
  },
  terms: {
    title: { en: "Terms and conditions", zh: "服务条款" },
    intro: { en: "These demo terms describe how orders, delivery and refunds work at Freshnesecom.", zh: "本演示条款说明 Freshnesecom 的下单、配送和退款规则。" },
  },
  privacy: {
    title: { en: "Privacy policy", zh: "隐私政策" },
    intro: { en: "We only use your data to deliver your order. We never sell it.", zh: "我们只把你的信息用于配送订单，绝不出售。" },
  },
  // ---- vitacost-style footer (redesign): placeholder pages, kept truthful about what the demo does ----
  "track-order": {
    title: { en: "Track My Order", zh: "查询订单" },
    intro: {
      en: "Order tracking is not part of this demo yet. After checkout, the confirmation page shows your order number and the expected delivery date.",
      zh: "本演示暂不支持订单追踪。下单后，确认页会显示订单号和预计送达日期。",
    },
  },
  "refund-policy": {
    title: { en: "Refund Policy", zh: "退款政策" },
    intro: {
      en: "Not happy with a product? Contact us within 48 hours of delivery and we will refund or replace it. This is a demo store: no real payment is taken.",
      zh: "对商品不满意？收货后 48 小时内联系我们，即可退款或换货。本站为演示，不会真实扣款。",
    },
  },
  shipping: {
    title: { en: "Domestic Shipping", zh: "配送说明" },
    intro: {
      en: "Orders of $30 or more (items total after discounts) ship free with any carrier. Below $30: DHL $15 (about 3 days) or FedEx $32 (about 2 days).",
      zh: "商品金额（折后）满 $30，任选物流都免运费。不满 $30 时，DHL $15（约 3 天）或 FedEx $32（约 2 天）。",
    },
  },
  "promo-exclusions": {
    title: { en: "Promo Exclusions", zh: "优惠说明" },
    intro: {
      en: "Promo codes apply to the whole order: OCT26DAILY (20% off), FRESH10 (10% off) and FARM20 (20% off). Enter the code at checkout.",
      zh: "优惠码对整单有效：OCT26DAILY（8 折）、FRESH10（9 折）、FARM20（8 折）。结账时输入即可。",
    },
  },
  contact: {
    title: { en: "Contact Us", zh: "联系我们" },
    intro: { en: "Email us anytime at info@freshnesecom.com — we reply within one business day.", zh: "欢迎随时发邮件到 info@freshnesecom.com，我们会在一个工作日内回复。" },
  },
  orders: {
    title: { en: "Order History", zh: "历史订单" },
    intro: {
      en: "Sign-in is not part of this demo yet, so past orders can't be listed here. Your order number is shown on the confirmation page after checkout.",
      zh: "本演示暂不支持登录，所以这里还不能显示历史订单。下单后，确认页会显示订单号。",
    },
  },
  "service-updates": {
    title: { en: "Service Updates", zh: "服务公告" },
    intro: { en: "Everything is running normally. Delivery estimates are shown at checkout.", zh: "一切运行正常。预计送达时间会在结账时显示。" },
  },
  "privacy-choices": {
    title: { en: "Your Privacy Choices", zh: "隐私设置" },
    intro: {
      en: "This demo store uses no advertising cookies. One cookie remembers your cart and another your language; your wish list and compare list stay in this browser. Nothing is shared with third parties.",
      zh: "本演示商城不使用广告 cookie。只有一个 cookie 记住购物车、一个记住语言；心愿单和对比列表只保存在当前浏览器里。不会与第三方共享任何信息。",
    },
  },
  "do-not-sell": {
    title: { en: "Do Not Sell or Share My Personal Information", zh: "不出售或共享我的个人信息" },
    intro: { en: "We do not sell or share personal information. It is only used to deliver your order.", zh: "我们不会出售或共享个人信息，只用于配送你的订单。" },
  },
  brands: {
    title: { en: "Shop by Brand", zh: "按品牌选购" },
    intro: {
      en: "Every product in this store is made by Metagenics. To browse by product line (UltraFlora, OmegaGenics and more), use the Product Lines menu at the top.",
      zh: "本店所有商品都来自 Metagenics。想按产品系列（UltraFlora、OmegaGenics 等）浏览，可以使用顶部的“产品系列”菜单。",
    },
  },
  "site-map": {
    title: { en: "Site Map", zh: "网站地图" },
    intro: {
      en: "All categories are in the Categories menu at the top of every page; product lines and forms have their own menus next to it.",
      zh: "所有分类都在每页顶部的“全部分类”菜单里；产品系列和剂型在旁边各有一个菜单。",
    },
  },
}
