# Freshnesecom 前端技术构成

本文说明 Freshnesecom 商城前端的技术选型、分层结构，以及各部分的实现方式。

## 一、技术栈

| 层 | 选型 | 用途 |
|---|---|---|
| 框架 | **Next.js 16**（App Router，开启 Cache Components 和 Partial Prefetching） | 路由、服务端渲染、静态预渲染、流式输出 |
| 语言 | **TypeScript 5**（严格模式） | 全项目类型约束，路由参数也有自动生成的类型 |
| UI 运行时 | **React 19** | 服务端组件（RSC）和客户端组件混合使用 |
| 样式 | **Tailwind CSS v4** | 原子类样式，设计 Token 用 CSS 变量定义 |
| 组件库 | **shadcn/ui**（新版，底层是 **Base UI**） | 按钮、下拉、Select、Sheet 抽屉、Tabs、Slider、Carousel 等 |
| 图标 | lucide-react | 统一的线性图标 |
| 状态管理 | **zustand**，配合 persist 中间件 | 购物车、心愿单、对比，存在 localStorage |
| 表单 | **react-hook-form** + **zod** | 结账表单的状态管理和校验 |
| 轮播 | embla-carousel（shadcn 封装好的） | 首页评价轮播 |
| 提示 | sonner | "已加入购物车"等 toast 提示 |
| 字体 | next/font（Poppins + Open Sans） | 自托管字体，不发外部请求 |
| 包管理 | pnpm | |

## 二、整体分层

```
┌─────────────────────────────────────────────────────┐
│ app/  路由层：页面、布局、loading、404               │
│   (shop)/     完整的 header 和 footer               │
│   (checkout)/ 精简版 footer                         │
├─────────────────────────────────────────────────────┤
│ components/  业务组件层（按功能分目录）              │
│   layout  product  catalog  cart  checkout  home ...│
├─────────────────────────────────────────────────────┤
│ components/ui  基础组件层（shadcn 生成，只改样式）   │
├─────────────────────────────────────────────────────┤
│ lib/  逻辑层                                        │
│   api/            数据访问（全部是 async 函数）      │
│   store/          客户端状态（zustand）              │
│   search-params   URL 和筛选条件互相转换             │
│   checkout-schema 表单校验规则                      │
│   format          价格和日期格式化                  │
├─────────────────────────────────────────────────────┤
│ lib/data/  mock 数据      types/  类型定义           │
└─────────────────────────────────────────────────────┘
```

依赖方向是自上而下：页面调用业务组件，业务组件调用基础组件，数据统一从 `lib/api` 读取。组件里不会直接引用 mock 数据。

## 三、渲染模型：服务端组件和客户端组件分工

这是整个项目最核心的设计。

- **服务端组件**（默认）：负责页面骨架、取数据、展示类组件。
  例如：`page.tsx`、`ProductCard`、`Price`、`Rating`、`SiteFooter`。
  它们不打包进浏览器端的 JS，只输出 HTML。
- **客户端组件**（文件开头写 `"use client"`）：只用在需要交互的"叶子"位置。
  例如：`BuyNowButton`、`FilterSidebar`、`CartDrawer`、`CheckoutForm`、`SearchBar`。

举个例子，`ProductCard` 本身是服务端组件，只有里面的"Buy now"按钮是客户端组件。所以页面上虽然有几十张卡片，浏览器端几乎没有额外的 JS。

服务端传给客户端组件的商品数据，会先用 `toSnapshot()`（在 `lib/product.ts`）裁剪成一个可序列化的小对象，只保留价格、标题这些必要字段。

**Cache Components**：首页、结账页是完全静态预渲染的。分类页、商品页这类依赖 URL 参数的页面，静态外壳（header、导航、footer）会立刻显示，内容区再流式加载，加载期间显示 `loading.tsx` 里的骨架屏。

## 四、路由设计

| 路由 | 说明 |
|---|---|
| `/` | 首页 |
| `/category/[slug]` | 分类页，`all` 表示全部商品，搜索结果也在这个页面 |
| `/product/[slug]` | 商品详情 |
| `/checkout`、`/checkout/success` | 结账、下单成功 |
| `/blog`、`/blog/[slug]` | 博客列表、详情 |
| `/[page]` | About、Help 等信息页，共用一个模板 |

`(shop)` 和 `(checkout)` 是**路由组**：括号里的名字不出现在网址里，只用来给不同页面套不同的布局。

## 五、状态管理：不同状态各放各的地方

| 状态类型 | 放在哪里 | 例子 |
|---|---|---|
| **服务端数据** | 服务端组件直接 `await api.xxx()` | 商品列表、详情、博客 |
| **筛选和分页状态** | **URL 查询参数** | `?brand=Tomissy+Farm&discounted=1&sort=price-asc&view=list` |
| **用户会话状态** | zustand，存在 localStorage | 购物车、优惠码、心愿单、抽屉开关 |
| **组件内部临时状态** | `useState` | 详情页选的数量和单位、价格滑块当前值 |

**筛选为什么放在 URL 里**：刷新不会丢，链接可以分享，浏览器的前进后退也能用。修改筛选条件的入口统一封装在 `useQueryState` 这个 hook 里，并且任何筛选变化都会自动回到第 1 页。

**读取 localStorage 的组件**（比如购物车数量徽标）会先等页面在浏览器端接管（hydration）之后再显示，用的是 `useHydrated` 这个 hook，这样服务端和浏览器渲染出的内容不会不一致而报错。

## 六、样式和设计 Token

```css
/* globals.css */
:root {
  --brand: #6a983c;  --brand-dark: #46760a;  --brand-soft: #f4f8ec;
  --ink: #151515;    --ink-muted: #a9a9a9;   --line: #d1d1d1;  ...
  --primary: var(--brand);     /* 接到 shadcn 的语义色上 */
  --border:  var(--line);
}
```

- 设计稿的颜色定义成 CSS 变量，再映射成 Tailwind 工具类，比如 `bg-brand`、`text-ink-muted`、`border-line`。
- 同时接到 shadcn 的语义变量上。这样 shadcn 的所有组件（Checkbox、Radio、Slider 等）自动就是品牌绿色，不需要逐个改。
- 按钮在 shadcn 基础上按设计稿加了变体：`default`（绿底加深色描边）、`soft`（灰底）、`outline`（白底绿边）。
- 另外定义了两个工具类：`container-page`（1440 宽，左右各 45px 内边距）和 `leaf-pattern`（banner 的浅绿底纹）。

## 七、组件复用

一个组件在多个页面复用的例子：

| 组件 | 用在哪些地方 |
|---|---|
| `ProductCard` | 首页 4 个区块、分类网格、相关商品、博客文章底部 |
| `Price` + `DiscountBadge` | 卡片、列表行、详情、购物车、结账汇总 |
| `QuantityUnitSelector` | 详情页、购物车抽屉、结账汇总 |
| `CartLineItem` | 购物车抽屉和结账页的订单汇总（同一个组件） |
| `computeTotals()` | 抽屉小计和结账总价共用同一个计算函数 |
| `Breadcrumbs`、`SectionHeader`、`CountPill`、`TagChip` | 全站 |

## 八、数据流示例：在分类页勾选一个品牌

```
用户勾选 "Tomissy Farm"
  → FilterSidebar（客户端）调用 useQueryState.toggleInList("brand", ...)
  → router.replace("?brand=Tomissy+Farm")
  → 服务端重新渲染 category/[slug]/page.tsx
       parseProductQuery(searchParams)  把 URL 转成类型化的查询条件
       searchProducts(query)            在数据层过滤、排序、分页
  → 返回新的商品网格；侧栏勾选状态和"已应用筛选"标签都从 URL 读取，自动同步
```

## 九、质量保证

- `tsc --noEmit` 类型检查和 ESLint（含 React Hooks 规则）都通过，生产构建 `next build` 也通过。
- 开发过程中用 Playwright 跑过端到端流程：加购、筛选、搜索、详情页、购物车抽屉、表单校验、下单成功、404 页。复选框点击和表单校验方面的几个 bug 就是靠它发现的。
- 这个脚本目前还没有放进项目，后续可以整理成正式的 `pnpm test:e2e`。

## 十、目前的边界

- **没有后端**：数据都是 mock，登录、真实支付、订单存储都没有做。
- **只有桌面版**：页面最小宽度是 1280px，没有做移动端适配。
- **图片都是占位块**。
