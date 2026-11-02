# Freshnesecom

基于 Figma 模板「eCommerce - Template」实现的生鲜商城前端：Next.js 16（App Router，开启 Cache Components）、TypeScript、Tailwind v4、shadcn/ui（Base UI 版本）。

## 运行

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build && pnpm start
```

## 页面

| 设计稿画板 | 路由 |
|---|---|
| 01 Homepage | `/` |
| 02 / 03 Category list / grid | `/category/[slug]`（`?view=list` 切换列表视图，`all` 表示全部商品） |
| 04 Product detail | `/product/[slug]` |
| 05 Checkout | `/checkout` → `/checkout/success` |
| 06 / 07 Blog list / detail | `/blog`、`/blog/[slug]` |
| 08 Shopping cart | 全局右侧抽屉（点击 header 购物篮打开） |

页脚和顶栏链接到的 About、Help 等页面不在设计稿里，统一用一个简单的信息页模板 `/(shop)/[page]` 承接。

## 目录结构

```
src/
  app/
    (shop)/            # 完整 header + footer 的页面
    (checkout)/        # 结账页，使用精简版 footer
  components/
    ui/                # shadcn 生成的基础组件（button 已按设计稿扩展了 variant）
    common/            # ButtonLink, Breadcrumbs, SectionHeader, 各类 pill/tag, 占位图
    layout/            # SiteHeader, SearchBar, MainNav, SiteFooter
    product/           # ProductCard, ProductListItem, Price, Rating, QuantityUnitSelector,
                       # PurchasePanel, ProductTabs, 加购和收藏按钮
    catalog/           # FilterSidebar, FilterBar, AppliedFilters, ViewToggle, CatalogPagination
    cart/              # CartDrawer, CartLineItem（抽屉和结账汇总共用）
    checkout/          # CheckoutForm, OrderSummary, 表单基础组件
    home/ blog/        # 首页 banner、评价轮播、博客卡片
  lib/
    api/               # 数据访问层（全部是 async 函数），接真实后端时只改这里
    data/              # mock 数据（按固定种子生成，每次渲染结果一致）
    store/             # zustand：购物车、心愿单、对比（存 localStorage）
    search-params.ts   # URL ⇄ 筛选条件，URL 是筛选状态的唯一来源
    checkout-schema.ts # zod 结账校验规则
  types/
```

## 设计 Token

颜色定义在 `src/app/globals.css` 的 `:root` 里，并映射到 shadcn 的语义变量（`--primary` 就是品牌绿 `#6A983C`）。可以直接使用的工具类有 `bg-brand`、`text-ink-muted`、`border-line`、`bg-surface` 等。字体：标题用 Poppins，正文用 Open Sans。

## 可以用的功能

- 搜索（可按分类限定）、分类导航下拉菜单
- 分类页筛选：子分类、品牌、评分、价格区间、快捷筛选标签，支持排序、分页和"加载更多"，网格和列表两种视图，所有状态都同步在 URL 里
- 加入购物车（数量和单位可选）、购物车抽屉、心愿单和对比切换
- 结账：分步表单，带 zod 校验；切换配送方式和优惠码会实时重算总价（可以试试 `FRESH10` / `FARM20`）；下单成功后进入确认页
- 博客列表（按分类筛选）和文章详情

## 说明

- 图片位按设计稿保留灰色占位块（`PlaceholderImage`），以后有图片资源时把 `<Image>` 作为 children 放进去即可。
- 博客两个画板没有拿到导出图（Figma 的 MCP 调用额度用完了），目前是按站内统一风格实现的。
