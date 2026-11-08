# Freshnesecom — Metagenics 保健品版（`metagenics` 分支）

> 这个分支用同一套商城外壳装载 Metagenics 保健品数据：229 个商品、316 个规格、18 个健康分类。`main` 分支仍然是原来的生鲜版。

## 这个分支和 main 的区别

- **数据**：来自 `Yuki-223/shopStore` 的采集数据（批次 2026-10-31）。`scripts/import-metagenics.mjs` 把它转成精简的 `src/lib/data/metagenics/catalog.json`，并复制 229 张主图到 `public/products/`。采集原件不做任何修改。
- **商品图**（2026-11-05 换成白底干净图）：`public/products/<slug>.jpg`，每张图的来源记在 `src/lib/data/metagenics/product-images.json`：136 张是 vitacost.com 上同一商品的图（`vitacost`），87 张是我们的原图用 `scripts/clean-product-image.py` 去掉阴影（`cleaned`），6 张保留原图（`original`）。后端导入脚本重复运行时，图片有变化的商品会自动换图。
- **语言**：默认进入英文站，商品内容是英文原文。仍然可以切换到中文界面，界面文字是中文、商品内容保持英文，价格换算成人民币。
- **导航**：18 个健康分类合并成 8 个导航分组，分类页里再按健康分类细分。一个商品可以同时属于多个分类。
- **商品详情**：可选容量和口味；可选单次购买或订阅（1/2/3 个月），订阅价来自采集数据；标签页依次是介绍、成分表（Supplement Facts）、用法与储存、注意事项、FAQ、评分。
- **评分**：只显示采集到的真实评分和评价数（229 个商品中有 213 个），不编造评价内容。
- **筛选**：健康分类、产品系列（UltraFlora、OmegaGenics 等）、剂型、评分、价格，以及"有货 / 订阅更省 / 组合装"快捷筛选。
- **购物车**：按"规格 + 购买方式"区分行，同一个规格的单次购买和订阅是两行。
- **移除的内容**：博客、顾客评价轮播等生鲜版的演示内容。

### 后端（Medusa）

商城的商品、价格、库存、购物车、下单和评论都由 `backend/` 里的 Medusa 后端负责。**本地运行商城前要先启动后端**。

#### 从零跑起来（已在全新 clone 上实测通过，最近一次 2026-11-08）

需要 Node 20+ 和 pnpm 10。数据库是内置的 PostgreSQL（embedded-postgres），不用另外安装。

```bash
git clone -b metagenics https://github.com/Yuki-223/fresshshop.git && cd fresshshop
```

**终端 1：后端**

```bash
cd backend
pnpm install              # 提示 "Ignored build scripts …" 可以忽略
pnpm setup:local          # 只需第一次：建数据库、表、管理员，生成 .env 和 .local/
pnpm start:local          # 启动数据库 + 后端（保持运行）→ http://localhost:9000/app
```

**终端 2：导入数据（只需第一次，等终端 1 显示启动完成）**

```bash
cd backend
pnpm import:metagenics    # 229 个商品、物流、优惠码（可以重复运行）
pnpm import:reviews       # 20 条采集评论
pnpm import:demo-reviews  # 演示用：每个商品 3–8 条示例评价（页面上标着 "Sample review"）
node scripts/verify-metagenics.mjs   # 可选：检查结果，最后输出 OK
```

**终端 2：商城**

```bash
cd ..                     # 回到项目根目录
pnpm install
pnpm dev                  # http://localhost:3000
```

- 后台登录：账号和密码在 `backend/.local/config.json`（不进 Git，每台机器各自生成）。
- 示例评价是编的（只写口感、包装、发货这类日常内容，不写功效），数据库里标为 `demo`，不计入商品总分。全部删掉：`cd backend && node scripts/import-demo-reviews.mjs --remove`。
- 以后再启动：只需要 `cd backend && pnpm start:local`，再在根目录 `pnpm dev`。数据保存在 `backend/.local/postgres`，重启后还在。
- 端口固定：数据库 55433，后端 9000，商城 3000。

商城通过 `src/lib/medusa/server.ts` 访问后端，环境变量：

- `MEDUSA_BACKEND_URL`：默认 `http://localhost:9000`
- `MEDUSA_PUBLISHABLE_KEY`：默认读取 `backend/.local/publishable-key`，这个文件由 `pnpm setup:local` 生成

导航分类和页脚的产品系列来自本地的 `catalog.json`，属于网站结构，可以提前生成。商品数据在请求时从后端读取，并缓存 15 秒，所以后台改价后十几秒内商城就会更新。

### 顾客账户

- 右上角账户图标 → `/account/login`：邮箱 + 密码登录 / 注册（Medusa emailpass；本演示不能发邮件，所以没有"忘记密码"，个人资料里可以凭旧密码修改密码）。
- 登录后是 `/account/...`：订单（列表和详情）、我的订阅（只显示，订阅为演示功能）、地址（增删改、设默认）、个人资料。头部显示 "Hi, 名字"。
- 不登录也能结账；登录后结账会自动填邮箱、电话和默认地址，订单归到账户下。登录前下的订单不会出现在账户里。
- 登录状态存在 httpOnly cookie `freshshop_customer_token` 里（Medusa 的 JWT，一天后过期）。

### 首页轮播和优惠

- 首页顶部是 Vitacost 风格的轮播图（`src/components/home/vc-slideshow/`），用的是 vitacost.com 的 3 张 banner（`public/banners/`）。
- banner 上写的优惠在后端都是真的（由 `pnpm import:metagenics` 创建）：
  - 优惠码 **OCT26DAILY**：整单 8 折。另外还有 `FRESH10`（9.5 折）、`FARM20`（8 折）。
  - **满 $30 包邮**：商品金额（折后、不含运费）≥ $30 时，所有物流（FedEx、DHL、顺丰、京东）运费都是 0。实现方式是给每个 shipping option 加一个价格规则 `item_total >= 30 → 0`。
  - Medusa 在输入优惠码后不会重新计算已选物流的运费，所以 `applyPromoCode` 会重新选一次同一个物流。

### 重新导入数据

```bash
git clone https://github.com/Yuki-223/shopStore.git ../shopStore
node scripts/import-metagenics.mjs ../shopStore
```

### 已知限制

- 规格详情（成分表、用法等）取自每个商品的第一个规格。不同口味的成分表可能略有不同。
- 4 个商品采集时显示缺货，页面上不能加入购物车。
- 9 个组合装作为普通商品展示，没有拆分组件。
- 价格是 2026-10-31 的快照；订阅只是演示，不会产生真实的周期扣款。

---

# 以下是 main 分支（生鲜版）的说明

基于 Figma 模板「eCommerce - Template」实现的生鲜商城前端，支持**中文 / 英文**双语：Next.js 16（App Router，开启 Cache Components）、TypeScript、Tailwind v4、shadcn/ui（Base UI 版本）。

## 运行

```bash
pnpm install
pnpm dev        # http://localhost:3000 → 自动跳转到 /zh 或 /en
pnpm build && pnpm start
```

## 语言

- 所有页面都在 `/zh` 或 `/en` 下。访问不带语言前缀的地址时，`src/proxy.ts` 按 cookie（用户选过的语言）→ 浏览器 `Accept-Language` → 默认中文的顺序跳转。
- 顶栏右侧可以切换"中文 / EN"，切换时保留当前页面和筛选条件，购物车内容也会跟着显示对应语言。
- 中文版用人民币显示价格（按 `src/i18n/config.ts` 里的汇率换算），结账按国内习惯：收货人、11 位手机号、省市区三级联动、顺丰/京东物流、支付宝/微信/银联。

## 页面

| 设计稿画板 | 路由（`[lang]` = `zh` / `en`） |
|---|---|
| 01 Homepage | `/[lang]` |
| 02 / 03 Category list / grid | `/[lang]/category/[slug]`（`?view=list` 切换列表视图，`all` 表示全部商品） |
| 04 Product detail | `/[lang]/product/[slug]` |
| 05 Checkout | `/[lang]/checkout` → `/[lang]/checkout/success` |
| 06 / 07 Blog list / detail | `/[lang]/blog`、`/[lang]/blog/[slug]` |
| 08 Shopping cart | 全局右侧抽屉（点击 header 购物篮打开） |

页脚和顶栏链接到的 About、Help 等页面不在设计稿里，统一用一个简单的信息页模板 `[lang]/(shop)/[page]` 承接。

## 目录结构

```
src/
  proxy.ts             # 不带语言前缀的请求 → 跳转到 /zh 或 /en
  i18n/
    config.ts          # 支持的语言、货币、汇率、对应的结账地区
    dictionaries/      # en.ts（结构基准）和 zh.ts，缺 key 时 tsc 直接报错
    dictionary.ts      # 字典类型、翻译函数 t() / t.plural()
    format.ts          # 价格、折扣（"- 36 %" / "6.4折"）、日期格式化
    server.ts          # 服务端组件用：getI18n()，通过 next/root-params 读取当前语言
    client.tsx         # 客户端组件用：I18nProvider、useI18n() / useT() / useFormat()
    navigation.tsx     # 自动加语言前缀的 Link、useRouter、usePathname
  app/
    [lang]/layout.tsx  # 根布局（<html lang>、字体、I18nProvider）
    [lang]/(shop)/     # 完整 header + footer 的页面
    [lang]/(checkout)/ # 结账页，使用精简版 footer
  components/
    ui/                # shadcn 生成的基础组件（button 已按设计稿扩展了 variant）
    common/            # ButtonLink, Breadcrumbs, SectionHeader, 各类 pill/tag, 占位图
    layout/            # SiteHeader（metagenics：vc-header/ 里的 Vitacost 风格头部和菜单）, SiteFooter, LanguageSwitcher
    product/           # ProductCard, ProductListItem, Price, Rating, QuantityUnitSelector,
                       # PurchasePanel, ProductTabs, 加购和收藏按钮
    catalog/           # FilterSidebar, FilterBar, AppliedFilters, ViewToggle, CatalogPagination
    cart/              # CartDrawer, CartLineItem（抽屉和结账汇总共用）
    checkout/          # CheckoutForm, AddressFields（按地区）, OrderSummary, 表单基础组件
    home/ blog/        # 首页 banner、评价轮播、博客卡片
  lib/
    api/               # 数据访问层（全部是 async 函数，接收 locale），接真实后端时只改这里
    data/              # 中英双语 mock 数据（按固定种子生成，每次渲染结果一致）
    checkout/          # 结账地区配置（regions.ts）和按地区生成的 zod 校验（schema.ts）
    store/             # zustand：购物车、心愿单、对比（存 localStorage）
    search-params.ts   # URL ⇄ 筛选条件，URL 是筛选状态的唯一来源
  types/
```

## 设计 Token

颜色定义在 `src/app/globals.css` 的 `:root` 里，并映射到 shadcn 的语义变量（`--primary` 就是品牌绿 `#6A983C`）。可以直接使用的工具类有 `bg-brand`、`text-ink-muted`、`border-line`、`bg-surface` 等。字体：标题用 Poppins，正文用 Open Sans，中文字形回退到 Noto Sans SC（思源黑体）。

## 可以用的功能

- 搜索（可按分类限定，中英文关键词在两种语言下都能搜到）、分类导航下拉菜单
- 分类页筛选：子分类、品牌、评分、价格区间、快捷筛选标签，支持排序、分页和"加载更多"，网格和列表两种视图，所有状态都同步在 URL 里
- 加入购物车（数量和单位可选）、购物车抽屉、心愿单和对比切换
- 结账：分步表单，带 zod 校验（错误提示跟随语言）；切换配送方式和优惠码会实时重算总价（可以试试 `FRESH10` / `FARM20`；metagenics 分支还有 `OCT26DAILY`）；下单成功后进入确认页
- 博客列表（按分类筛选）和文章详情

## 说明

- 图片位按设计稿保留灰色占位块（`PlaceholderImage`），以后有图片资源时把 `<Image>` 作为 children 放进去即可。
- 博客两个画板没有拿到导出图（Figma 的 MCP 调用额度用完了），目前是按站内统一风格实现的。
- 商品价格以美元为基准存储；中文版的人民币价格是按固定汇率换算的演示数据。省市区数据只包含部分省份。
- 详细说明见 `docs/frontend-architecture.md` 和 `docs/chinese-version-plan.md`。
