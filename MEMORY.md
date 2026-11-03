# 项目记忆（给新对话看的）

> 更新于 2026-11-03。记录之前的对话做了什么、做过哪些决定，新对话先读这份文件。

## 关于用户和协作方式

- 用中文交流。这是**个人项目**，不面向真实消费者：法规、授权、广告合规都**不用考虑**。
- 喜欢**先讨论再动手**。有多个问题要确认时，**一次问一个**，等回答后再问下一个。
- **讲解时要慢**：一次只讲一件事，每件事用"一句话 / 我会做的 / 做完之后会是什么样 / 你需要做的"这样的短结构，多用通俗的比喻。一次塞太多信息，用户会跟不上（用户原话："太快了，信息太多了"）。讲完一件就停下来，问用户要不要继续。
- 做事时也一样：每完成一步，先停下来汇报结果，用户确认后再做下一步。
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

## 之后的讨论：完整图库和接后端（还没开始动手）

### 1.2 GB 的完整图库

- 用户本机 shopStore 的 `data/metagenics/2026-10-31/assets/` 里有 **2,632 张图片，压缩后约 1.2 GB**，另有 `manifest.json` 和 `detail-manifest.json`。这部分**没有上传到 GitHub**。
- 这些图片是每个商品的额外图片（侧面、背面、标签特写、不同规格的包装）。主图（每个商品一张，共 229 张）已经在 shopStore 的 `storefront/public/collection/` 里了。
- 用户已经理解：**接后端不需要这 1.2 GB**，只有想在详情页显示多张图片时才需要，可以以后再补。
- 以后如果要传：GitHub 单个文件不能超过 100 MB，压缩包不能直接提交。推荐在 shopStore 建一个 **GitHub Release**，把压缩包作为附件上传（单个附件最大 2 GB），再在云端下载。下载前先用小文件测试这个环境能不能下载 Release 附件。不推荐 Git LFS，因为免费额度只有 1 GB。

### 云端环境（2026-11-03 检查）

磁盘约 29 GB 可用，15 GB 内存，4 核 CPU，已装 PostgreSQL 16、Redis、Docker。跑 Medusa 没问题。但环境是**临时的**，对话结束一段时间后会被回收，数据库也会清空。

### shopStore 里已有的 Medusa（来自 `MEDUSA_DTC_SETUP.md`）

- 一键脚本 `./medusa.sh`：`setup` 负责建表、管理员和店面配置；`dev` 启动数据库、后端和官方店面。新环境要先在 `tools/medusa-local` 里运行 `npm ci`，再用其中的 pnpm 安装 `medusa-dtc` 的依赖。
- 导入：`tools/medusa-local/import-metagenics.mjs`（可加 `--sample` 只导样本），然后用 `verify-metagenics.mjs` 核验。用的是 `home-catalog.json` 和 normalized 数据，会上传 229 张主图。
- 地址：Admin 是 `localhost:9000/app`，官方店面是 `localhost:8000/us`。管理员邮箱 `admin@shopstore.local`，密码在 setup 时随机生成，存在 `.medusa-local/config.json`。
- 之前的导入**没有**订阅价和评分。成分表等原文存在商品的 metadata 里，库存都是演示值 99。

### 接后端的计划（已经给用户一件一件讲完，用户还没说开始）

1. 在云端安装并启动 Medusa（后端里是空的），截管理后台的图给用户看。
2. 用现成脚本导入 229 个商品，截后台商品列表的图。
3. 把商城（FresshShop 的 `metagenics` 分支）的 `lib/api` 改成从 Medusa 读数据，购物车和下单也走后端。做到这一步时要**问用户**：后端没有的订阅价和评分怎么处理（暂时隐藏，还是继续读静态文件）。
4. 走一遍流程，截图给用户看：商城页面、后台改价格后商城跟着变、下单后后台出现订单。

每做完一件都要停下来汇报，等用户确认再继续。

## 可能的下一步（还没做）

- **接入 Medusa 后端**：按上面的 4 步做，等用户说开始。
- 给保健品版换站名和配色（目前还叫 Freshnesecom、用绿色主题）。
- 部署到 Vercel。
- 把 Playwright 测试脚本放进项目（目前只在会话的临时目录里）。
- 商品内容的中文翻译。
- 把 1.2 GB 完整图库通过 GitHub Release 传上来，做详情页的多图相册。
