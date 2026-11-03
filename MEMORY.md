# 项目记忆（给新对话看的）

> 更新于 2026-11-03。记录之前的对话做了什么、做过哪些决定，新对话先读这份文件。

## 关于用户和协作方式

- 用中文交流。这是**个人项目**，不面向真实消费者：法规、授权、广告合规都**不用考虑**。
- 喜欢**先讨论再动手**。有多个问题要确认时，**一次问一个**，等回答后再问下一个。
- 只做桌面端，**不做移动端适配**（页面最小宽度 1280px）。
- Figma MCP 是 Starter 套餐，调用额度很快就用完，不要依赖它。

## 仓库

| 仓库 | 用途 |
|---|---|
| `Yuki-223/FresshShop` | 本项目（Next.js 商城外壳） |
| `Yuki-223/shopStore` | 用户的另一个项目：Metagenics 采集数据、Medusa 后端、Vite 原型。**只读，不要改** |

FresshShop 有两个分支：
- `main`：生鲜版商城（Figma 模板 "eCommerce - Template" / Freshnesecom），中英双语。
- `metagenics`：同一套外壳装载 Metagenics 保健品数据，英文优先。

## 时间线

1. **生鲜版商城**：根据 Figma 模板的 8 个画板实现首页、分类页（网格和列表视图）、商品详情、结账、博客列表和详情、购物车抽屉。博客两页没有拿到设计图，按站内风格自己做的。
2. **两份文档**：`docs/frontend-architecture.md`（前端技术构成）、`docs/chinese-version-plan.md`（中文版方案和实施记录）。
3. **中文版**：中英双语可切换，中文用人民币显示（汇率 7.1），结账按国内习惯改造（省市区三级联动、11 位手机号、顺丰/京东、支付宝/微信/银联）。
4. **部署讨论**：Artifact 只能托管静态页面，不适合这个 Next.js 应用。推荐用 Vercel 从 GitHub 导入，或在本地运行（`pnpm install && pnpm dev`）。用户还没有部署。
5. **换品类讨论**：通用部分（购物车、结账、筛选框架、i18n）可以直接复用；要改的是商品属性和规格系统。
6. **保健品版**（`metagenics` 分支）：用 shopStore 的采集数据替换商品。用户的选择依次是：数据从 GitHub 读取、用静态数据（不接 Medusa）、做订阅、这批商品先只做英文界面、代码放在 FresshShop 的新分支。

## 技术要点

- **技术栈**：Next.js 16.4（App Router，开启 Cache Components 和 Partial Prefetching）、React 19、TypeScript、Tailwind v4、shadcn/ui（**Base UI 版本**，不是 Radix）、zustand、react-hook-form + zod、pnpm。
- Next 16 和训练数据里的版本差别很大，写代码前先读 `node_modules/next/dist/docs/`（`AGENTS.md` 里也这样要求）。例如 middleware 改名为 `src/proxy.ts`，根参数用 `next/root-params`。
- **i18n**：所有路由都在 `app/[lang]/` 下。字典是 `src/i18n/dictionaries/en.ts`（结构基准）和 `zh.ts`，缺 key 时 tsc 会报错。服务端组件用 `getI18n()`，客户端组件用 `useI18n()`。链接用 `@/i18n/navigation` 的 `Link`，会自动加语言前缀。
- **数据层**：组件只通过 `src/lib/api/index.ts` 读取数据，以后接后端只改这一个文件。
- **价格**：以美元为基准存储，`src/i18n/format.ts` 负责换算和格式化。
- **踩过的坑**：
  - Base UI 的 Checkbox/Radio 不能被 `<label>` 包住（会切换两次），要用 `htmlFor` 加 `id`，让 label 和控件并排。
  - 用 Cache Components 时，读取 `searchParams` 或 `usePathname` 的组件要包在 `<Suspense>` 里。
  - Playwright 测试时，Next 会把之前访问过的页面隐藏保留，选择器要加 `:visible`。

## 保健品版（metagenics 分支）细节

- **导入**：`node scripts/import-metagenics.mjs ../shopStore`，生成 `src/lib/data/metagenics/catalog.json`，并把主图复制到 `public/products/`。
- **数据量**：229 个商品、316 个规格、18 个健康分类，其中 213 个商品有真实评分。
- **导航分组**：18 个健康分类合并成 8 个导航分组，定义在 `src/lib/data/metagenics/groups.ts`。
- **购物车**：每一行按"SKU + 购买方式"区分（单次购买，或订阅 1/2/3 个月）。持久化版本是 v3。
- **默认英文**：默认语言是 `en`。proxy 只看 cookie，不看浏览器语言。
- **已去掉**：博客和顾客评价轮播。
- **已知限制**：详情内容取自每个商品的第一个规格；9 个组合装没有拆分组件；4 个商品缺货。

## 可能的下一步（还没做）

- 给保健品版换站名和配色（目前还叫 Freshnesecom、用绿色主题）。
- 部署到 Vercel。
- 把 Playwright 测试脚本放进项目（目前只在会话的临时目录里）。
- 商品内容的中文翻译。
- 接入 shopStore 里的 Medusa 后端。
