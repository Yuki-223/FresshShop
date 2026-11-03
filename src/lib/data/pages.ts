import type { L10n } from "@/i18n/config"

/** Simple informational pages linked from the header/footer (not part of the Figma boards). */
export const infoPages: Record<string, { title: L10n; intro: L10n }> = {
  about: {
    title: { en: "About Us", zh: "关于我们" },
    intro: {
      en: "Freshnesecom connects families with local farms. We deliver fresh fruit, vegetables, meat and bakery products straight from the field to your door.",
      zh: "Freshnesecom 连接家庭与本地农场，把新鲜的水果、蔬菜、肉类和烘焙食品从田间直接送到你家门口。",
    },
  },
  careers: {
    title: { en: "Careers", zh: "加入我们" },
    intro: { en: "We are always looking for people who love good food. Drop us a line at info@freshnesecom.com.", zh: "我们一直在寻找热爱美食的伙伴，欢迎发邮件到 info@freshnesecom.com。" },
  },
  press: {
    title: { en: "Press Releases", zh: "新闻动态" },
    intro: { en: "News and media resources about Freshnesecom.", zh: "Freshnesecom 的最新动态和媒体资料。" },
  },
  affiliate: {
    title: { en: "Become an Affiliate", zh: "成为推广伙伴" },
    intro: { en: "Earn a commission by recommending fresh food from local farms.", zh: "推荐本地农场的新鲜食材，即可获得佣金。" },
  },
  advertise: {
    title: { en: "Advertise your product", zh: "投放广告" },
    intro: { en: "Reach thousands of households that care about where their food comes from.", zh: "触达成千上万关心食材来源的家庭。" },
  },
  sell: {
    title: { en: "Sell on Market", zh: "入驻开店" },
    intro: { en: "Are you a farmer? Join our marketplace and sell directly to customers.", zh: "你是农场主吗？入驻我们的商城，直接把产品卖给消费者。" },
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
    intro: { en: "Every order is covered: if it doesn't arrive fresh, you don't pay.", zh: "每一笔订单都有保障：送到时不新鲜，就不用付钱。" },
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
}
