# Freshnesecom 中文版实施方案

本文说明如何基于现有的组件化结构做出中文版商城。

> **状态：已实施。** 采用的选择是：中英双语可切换（默认中文）、人民币按汇率换算显示、结账按国内习惯改造。与下文方案相比，实施时有几处调整，见文末「实施记录」。

由于页面都是由组件拼起来的，做中文版主要是改**组件的依赖**，不用改组件结构。核心原则是：**组件里不写死三样东西：文案、格式、内容。** 这三样由外部按语言注入，组件只负责布局和交互。

## 一、三样东西分别从哪里注入

| 写死的东西 | 现在 | 改成 |
|---|---|---|
| 界面文案："Buy now"、"Add to cart" | 写在 JSX 里 | 翻译函数 `t("product.buyNow")`，从字典里取 |
| 格式：`36.99 USD`、`17. 6. 2020`、`- 36 %` | `formatPrice` 等写死英文格式 | 格式化函数按语言输出 `¥36.99`、`2020年6月17日`、`6.4折` |
| 内容：商品名、描述、博客正文 | mock 数据只有英文 | 数据层按语言返回：`getProductBySlug(slug, locale)` |

## 二、基础设施（新增 4 个文件）

```
src/i18n/
  config.ts          # 支持的语言、默认语言、货币和地区配置
  dictionaries/
    en.json
    zh.json
  server.ts          # 服务端组件用：getDictionary(locale)
  client.tsx         # 客户端组件用：<I18nProvider> + useT() / useFormat()
proxy.ts             # 按浏览器语言把 / 跳转到 /zh 或 /en
```

**1. 语言配置**（一处定义，全站共用）

```ts
// i18n/config.ts
export const locales = {
  en: { label: "EN",   intl: "en-US", currency: "USD", region: "intl" },
  zh: { label: "中文", intl: "zh-CN", currency: "CNY", region: "cn" },
} as const
export type Locale = keyof typeof locales
```

**2. 字典按组件模块分组，key 有类型检查**

```json
// zh.json
{
  "product": { "buyNow": "立即购买", "addToCart": "加入购物车", "addToWishlist": "加入心愿单" },
  "catalog": { "discounted": "折扣商品", "freeShipping": "包邮", "showMore": "加载更多商品" },
  "cart":    { "title": "购物车", "subtotal": "小计", "goToCheckout": "去结算" }
}
```

以 `en.json` 为基准生成类型，`zh.json` 必须结构完全一致。少翻译一个 key，或者 key 拼错，`tsc` 都会直接报错。这样能保证不会漏翻。

**3. 服务端组件和客户端组件拿翻译的方式不同**

```tsx
// 服务端组件：直接 await
const t = await getT(locale)
<h2>{t("home.bestSelling")}</h2>

// 客户端组件：根布局用 Provider 下发当前语言的字典，组件里用 hook
"use client"
const t = useT()
<Button>{t("product.buyNow")}</Button>
```

客户端只会收到**当前语言**的字典，不会把两种语言的字典都打包进浏览器端的 JS。

## 三、组件怎么改：以三类组件为例

**1. 纯文案组件**：只把字符串换成 `t()`，结构完全不动

```tsx
// 改之前
<Button size="sm">Buy now</Button>
// 改之后
<Button size="sm">{t("product.buyNow")}</Button>
```

大部分组件都属于这一类，比如 `SectionHeader`、`FilterBar`、`CartDrawer`、`SiteFooter`。

**2. 格式类组件**：只需要改格式化函数，组件本身不用动

```tsx
// Price 和 DiscountBadge 都改为通过 useFormat() 或 getFormat(locale) 拿格式化函数
const fmt = useFormat()
fmt.price(36.99)          // en: "36.99 USD"   zh: "¥36.99"
fmt.discount(36.99, 57.8) // en: "- 36 %"      zh: "6.4折"
fmt.date(iso)             // en: "17. 6. 2020" zh: "2020年6月17日"
```

全站有 25 处调用价格和日期格式化，但都会经过这几个函数。**只要改这一层，所有显示价格和日期的地方就都变成中文格式。**

**3. 业务规则因地区而不同的组件**：用"地区配置"替换实现，不在组件里写 `if (中文)`

结账页是唯一需要这样处理的地方，因为中国的地址、物流、支付方式和国外完全不同。把差异抽成一份按地区区分的配置：

```ts
// checkout/regions/cn.ts
export const cnCheckout = {
  addressFields: ["province", "city", "district", "detail"],   // 省市区三级联动
  phonePattern: /^1[3-9]\d{9}$/,                              // 11 位手机号
  carriers: [{ id: "sf", name: "顺丰", price: 12 }, { id: "jd", name: "京东物流", price: 8 }],
  payments: ["alipay", "wechat", "unionpay"],
  schema: makeSchema("cn"),                                   // zod 规则按地区生成
}
```

`CheckoutForm` 读取当前地区的配置来渲染。`CheckoutSection`、`OptionRow`、`OrderSummary`、`CartLineItem` 这些组件**一行都不用改**。要扩展到第三个地区，只需新增一份配置。

## 四、路由和数据层

**路由**：把 `(shop)` 和 `(checkout)` 挪进 `app/[lang]/`，地址变成 `/zh/product/...` 和 `/en/product/...`。

- 用 `generateStaticParams` 列出两种语言，这样两个版本都可以静态预渲染，现在的 Cache Components 优化不会丢。
- `<html lang>` 和页面标题都跟着语言变。
- header 里加一个"中文 / EN"切换按钮，切换时保留当前路径和筛选参数。

**数据层**：`lib/api` 的函数都加上 `locale` 参数。商品的中文名和描述作为数据存在数据层，不放进界面字典。slug 保持英文，这样两种语言的链接指向同一个商品。以后接真实后端时，就把这个 locale 参数透传给接口。

## 五、字体和样式

- **字体**：加上 Noto Sans SC（思源黑体）。在 CSS 变量里让英文和数字继续用 Poppins，中文回退到思源黑体：`--font-heading: Poppins, "Noto Sans SC"`。
- **行高**：中文正文行高调到 1.75 左右，用 `:lang(zh)` 选择器统一调整，不用逐个组件改。
- **宽度**：中文按钮文字更短，需要逐页检查一遍对齐。

## 六、实施顺序和工作量

| 步骤 | 内容 | 预估 |
|---|---|---|
| 1 | i18n 基础设施：配置、字典类型、Provider、格式化函数 | 小 |
| 2 | 路由迁移到 `[lang]`，加 proxy 跳转和语言切换按钮 | 小 |
| 3 | 逐个组件替换文案（约 28 个文件） | 中，主要是体力活 |
| 4 | 中文 mock 数据：商品、博客、评价 | 中 |
| 5 | 结账的地区配置：省市区、顺丰/京东、支付宝/微信 | 最大 |
| 6 | 字体、行高、版式检查，跑两种语言的端到端测试 | 小 |

前 3 步做完，整个网站的界面就是中文了。第 4、5 步是让内容和业务流程也本地化。

## 七、实施记录

方案中的 6 个步骤都已完成。和上文相比有这些调整：

| 方案里写的 | 实际做法 | 原因 |
|---|---|---|
| 字典用 `en.json` / `zh.json` | 用 `en.ts` / `zh.ts` | TS 文件能直接推导出 key 的类型，`zh.ts` 少 key、拼错 key 都会在 `tsc` 阶段报错；复数用 `{ one, other }` 结构加 `t.plural()` |
| 服务端组件 `getT(locale)`，locale 逐层传递 | `getI18n()` 内部用 `next/root-params` 读取 `[lang]` | Next 16 的根参数可以在任意服务端组件里直接读取，不需要层层传 props |
| 组件里链接写 `href(path)` | 新增 `@/i18n/navigation` 的 `Link` / `useRouter` / `usePathname` | 组件照常写 `/product/x`，语言前缀自动加上，组件代码几乎不用改 |
| 价格直接换成人民币 | 价格仍以美元为基准存储，`format.ts` 按汇率换算显示；购物车和结账的金额先换算单价再计算 | 切换语言时购物车不会乱；页面上每一行金额加起来正好等于总价 |
| 购物车存商品标题 | 购物车快照存 `{ en, zh }` 两种语言的标题和农场名 | 切换语言后购物车也显示对应语言；持久化版本升到 v2，旧数据自动清空 |
| `checkout/regions/cn.ts` | `lib/checkout/regions.ts`（两个地区放一个文件）+ `lib/checkout/schema.ts`（按地区生成 zod 规则，错误提示跟随语言） | 地区配置很短，放在一起更好对照 |

**结账地区差异**（都在 `regions.ts` 里配置，组件里没有 `if (中文)`）：

| | 国际（en） | 中国（zh） |
|---|---|---|
| 地址 | 名、姓、地址、城市、国家、邮编（必填） | 收货人、省/市/区三级联动、详细地址、邮编（选填，6 位） |
| 手机号 | 宽松格式 | 11 位手机号 |
| 物流 | FedEx +32、DHL +15（USD） | 顺丰速运 +¥12、京东物流 +¥8 |
| 支付 | 信用卡、PayPal、比特币 | 支付宝、微信支付、银联卡（需要填卡号） |
| 税率 | 17% | 13% |

**验证**：`tsc`、ESLint、`next build` 全部通过，两种语言都静态预渲染。Playwright 端到端测试覆盖了语言自动跳转、中文搜索、"6.4折"角标、品牌筛选、切换语言保留页面和购物车、中文结账（校验提示、省市区联动、顺丰、支付宝、优惠码）、下单成功、本地化 404，以及英文结账回归测试。

**已知限制**：人民币价格按固定汇率换算，实际业务应该有独立的人民币定价；省市区数据只包含 6 个省市的部分区县，正式上线需要接入完整的行政区划数据。
