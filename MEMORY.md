# 项目记忆（给新对话看的）

> 更新于 2026-11-03。记录之前的对话做了什么、做过哪些决定，新对话先读这份文件。

> **正在进行：改造成 Vitacost 风格。** 导航栏、首页（轮播、圆形分类、6 排商品）、页脚、所有商品列表页、全站白底干净商品图都已完成；商品详情页、账户页还没做。决定和进度单独写在 `metagenics` 分支的 `MEMORY-REDESIGN.md` 里（开头有"当前状态速览"），读完这份后再读那份。

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

### 在云端启动 Medusa 的方法（第 1 件已完成，2026-11-03）

云端环境用 **root** 运行，而 shopStore 的 `./medusa.sh` 用的是 embedded-postgres。PostgreSQL 不能以 root 身份运行，所以 embedded-postgres 会改用系统里的 `postgres` 用户，这时会遇到三个问题。按下面的顺序处理即可：

```bash
cd /home/user/shopstore            # shopStore 的 clone（深度 1）
cd tools/medusa-local && npm ci && cd ../..
PATH="$PWD/tools/medusa-local/node_modules/.bin:$PATH" ./tools/medusa-local/node_modules/node/bin/node \
  ./tools/medusa-local/node_modules/pnpm/bin/pnpm.cjs --dir medusa-dtc install --frozen-lockfile
./medusa.sh status || true         # 第一次运行会生成 .medusa-local/config.json（失败也没关系）
# 问题 1：postgres 用户进不去 .medusa-local（权限 700）
# 问题 2：initdb 不能在里面新建数据目录
# 问题 3：数据库的 socket 文件（-k .medusa-local）写不进去，导致启动"静默失败"（没有任何输出，退出码 0）
mkdir -p .medusa-local/postgres && chown postgres:postgres .medusa-local/postgres && chmod 700 .medusa-local/postgres
chown postgres .medusa-local && chmod 711 .medusa-local   # config.json 仍是 root 所有、权限 600
./medusa.sh setup                  # 建库、迁移、创建管理员；成功时输出 "Setup complete"
./medusa.sh backend                # 后台运行；http://localhost:9000/health 返回 200，Admin 在 /app
```

还有两个注意点：
- 如果脚本检测到 55432 端口上**已经有一个数据库在运行**，会打印 "Using workspace PostgreSQL" 并**跳过建库**，接着就会报 "database shopstore_medusa_dtc does not exist"。遇到这种情况，先杀掉遗留的 `native/bin/postgres` 进程再重跑。这次的遗留进程是我手动测试时没关掉的。
- 管理员密码在 `.medusa-local/config.json` 里，读取后直接使用，**不要显示在对话里**。截图用 Playwright 登录 `localhost:9000/app/login`。
- 这些改动只在云端，**没有修改 shopStore 仓库**。setup 生成的 `.env` 文件已经被 git 忽略。

第 1 件的结果：后台已登录，商品列表里只有 4 件 Medusa 官方示例衣服。

### 用 shopStore 的后端试跑（已完成，计划已经被取代）

- 第 1 件已完成：在云端启动 shopStore 的 Medusa，见上文。
- 第 2 件已完成：用 shopStore 的 `import-metagenics.mjs` 导入了 229 个商品（新建 226 个，加上之前的 3 个样本）。官方核验脚本 `verify-metagenics.mjs` 全部通过：229 个商品、316 个规格、18 个分类、9 个组合装、美元价格一致、库存都是 99、229 张图可访问、购物车测试通过。核验脚本还需要官方店面在 `:8000` 运行，用 `./medusa.sh storefront` 启动。
- 导入和核验会改写 shopStore 的 `verification/*.json`；Next 开发模式会改写 `medusa-dtc/apps/storefront/next-env.d.ts`。这些都要用 `git checkout` **还原，不要提交**到 shopStore。

### 关于评价数据（2026-11-03 查证）

- **评分汇总**：229 个商品里有 213 个有平均分和评价数，来自 `structuredData` 里的 `aggregateRating`。
- **评论原文**：只有 2 个商品有。原始数据里每条评论重复记录了两次，看起来是各 20 条、共 40 条，**去重后其实是各 10 条、共 20 条**：MagActive® Magnesium Muscle Powder Packets、Tran-Q Sleep。字段有标题、正文、日期、作者、地区和星级。其余商品没有采集评论原文。
- Medusa **默认没有评论功能**，需要在后端自己加一个评论模块（官方有教程）。
- 前端现状：保健品版只显示星级、评价数，以及一个跳到品牌官网的链接，没有评论列表，也不能写评论。生鲜版（main）有一个写评论的表单，但没有后端，刷新后评论就没了。

### 新计划：后端搬进 FresshShop + 评论功能（用户已认可方向，还没开始动手）

用户的决定：**把后端复制一份到 FresshShop 里，在这里加评论功能，不改 shopStore**。shopStore 只作为采集数据的来源。之后会有两份后端，各自独立修改。

总览，一共 7 件：
1. **把后端搬进 FresshShop**：在 FresshShop 新建 `backend/`，复制 shopStore 的 Medusa 后端和启动工具（`medusa-dtc` 里的 backend 和 `tools/medusa-local`），在云端启动。**不复制** `node_modules`、数据库文件、`.env` 和 `config.json` 这类密码文件。做完后截一张后台的图，这时后台里没有商品。
2. **把商品放进新后端**：在 FresshShop 写导入程序，参照 shopStore 的 `import-metagenics.mjs`。这次**另外放进订阅价和评分汇总**，存到商品或规格的 metadata 里。做完后截图：后台有 229 个商品，并且能看到订阅价和评分。
3. **给后端加评论功能**：在后端新建一个评论模块（"评论柜子"），每条评论记录商品、作者、星级、标题、正文、时间。再加几个接口：查看某个商品的评论、提交新评论、店主在后台查看所有评论。这一步页面上还看不到变化，用程序测试"能存也能取"，然后把结果告诉用户。
4. **放入已有的评价数据**：
   - 213 个商品的评分汇总（平均分和评价数）记在商品上，作为**初始评分**。
   - 20 条评论原文（MagActive Muscle、Tran-Q Sleep 各 10 条，去重后）逐条放进评论模块。
   - 新评论在初始评分的基础上合并计算：总条数加 1，平均分重新计算。比如 Adreset 原来是 4.86 分、14 条，加一条 5 星后变成 15 条，平均分重新算。
   - 挑一个商品测试，把结果告诉用户。
5. **商城从后端读取商品**：把 `metagenics` 分支的 `lib/api` 改成调用 Medusa Store API。页面代码基本不动，因为所有数据本来就是从 `lib/api` 拿的。商品列表、详情、分类、筛选、搜索都改成从后端读取。**购物车和下单也走后端**：加购时检查库存，下单后订单保存在后端并扣减库存。验证方法：在后台改价格后商城跟着变；下单后后台能看到订单。
6. **商城加上评论界面**：在商品页的 Ratings 标签里，先显示评分汇总，下面是评论列表（作者、星级、标题、正文、日期）。没有评论原文的商品只显示汇总。加一个写评论的表单（星级、标题、内容、名字），提交后**保存到后端**，刷新后还在，评分也会自动更新。截图给用户看：Tran-Q Sleep 的 10 条评论、提交一条新评论、刷新后还在。
7. **整体走一遍，截图给用户看**：
   - 首页商品来自后端
   - 后台改价格后商城跟着变
   - 选规格、加购、下单
   - 后台订单列表里出现这个订单
   - 写评论后刷新还在

   每个环节截一张图。收尾时提交并推送到 FresshShop，并更新 `MEMORY.md`，写清楚怎么启动和注意事项。

目前进度：**7 件都已经给用户讲完**。**每做完一件都要停下来汇报，等用户确认再继续。**

**第 1 件已完成（2026-11-03）**：后端已经在 `metagenics` 分支的 `backend/` 里。
- 复制了 shopStore `medusa-dtc/apps/backend` 下被 git 管理的 32 个文件，没有复制 node_modules、.env、数据库和上传文件。
- 后端是独立的 pnpm 项目（`backend/pnpm-workspace.yaml`），有自己的 `pnpm-lock.yaml`。根目录的 `tsconfig.json` 和 eslint 都排除了 `backend/`。
- pnpm 默认不运行依赖包的安装脚本，所以在 `backend/pnpm-workspace.yaml` 的 `onlyBuiltDependencies` 里允许了 `@embedded-postgres/*`，否则会报 "Missing symlink libecpg.so"。
- 启动脚本是 `backend/scripts/local.mjs`。用 `pnpm setup:local` 初始化（注意不能叫 `pnpm setup`，那是 pnpm 自带命令），用 `pnpm start:local` 启动。脚本已经**自动处理 root 权限**：数据目录和 socket 目录交给 postgres 用户；PostgreSQL 已在运行时也会确保建库。
- 端口：PostgreSQL 用 55433，数据库名 `freshshop_medusa`，Medusa 用 9000。管理员 `admin@freshshop.local`，密码在 `backend/.local/config.json`。publishable key 写在 `backend/.local/publishable-key`。`.env` 的 STORE_CORS 允许 `localhost:3000`。
- shopStore 那一套后端已经停掉。
- 结果：后台可以登录，只有 4 件官方示例商品。

**第 2 件已完成（2026-11-03）**：在 `backend/scripts/import-metagenics.mjs` 写了导入程序（`pnpm import:metagenics`，`--sample` 只导 3 个）。
- 数据源是 FresshShop 自己的 `src/lib/data/metagenics/catalog.json` 和 `public/products/*.png`，**导入时不需要 shopStore**。
- 比 shopStore 的导入多放了这些：规格 metadata 里有 `size`、`flavor`、`subscriptions`、`source_available`；商品 metadata 里有 `rating`、`product_line`、`form`、`is_bundle`、`content`、`supplement_facts`、`directions`、`storage`、`cautions`、`warnings`、`faq`、`related`。
- 选项改成正规的 `Size` / `Flavor`，组合装用 `Bundle`，原来是单一的 "Size / Flavor"。4 个缺货商品库存设为 0，其余是 99。
- 核验程序 `backend/scripts/verify-metagenics.mjs` 全部通过：229 个商品、316 个规格、18 个分类、213 个评分、316 个规格都有订阅价、价格 316/316 一致、229 张图可以访问、缺货商品加购会被拒绝。
- **坑**：Store API 的 fields 如果写成"只要这几个字段"（例如 `handle,title,…`），就拿不到 `variants.metadata`。要用 `+metadata,*variants,…` 这种写法。
- **坑**：后端开发模式会监视文件，改 `backend/` 里的文件（包括 package.json 和 scripts）会自动重启，大约 10 秒内调用接口会连不上。

**第 3 件已完成（2026-11-03）**：评论模块放在 `backend/src/modules/review`。
- 模型 `review` 的字段：`id`（前缀 rev）、`product_id`、`author_name`、`location`、`rating`（1–5）、`title`、`content`、`source`（collected 或 customer）、`status`（approved、pending 或 rejected）、`published_at`。在 `product_id` 和 `status` 上建了索引。
- 模块在 `medusa-config.ts` 的 `modules` 里注册。迁移文件 `src/modules/review/migrations/Migration20261103123008.ts` 已提交，`pnpm setup:local` 会自动执行。
- 接口：
  - `GET /store/reviews?product_id=` 返回评论列表和 `summary`。
  - `POST /store/reviews` 由 zod 校验，在 `src/api/store/reviews/validators.ts` 里，并在 middlewares 里注册。这个演示里评论自动通过审核。
  - `GET /admin/reviews` 需要管理员登录。
- 评分汇总在 `src/lib/review-summary.ts`：采集到的 `metadata.rating`（已经包含采集到的评论）加上 customer 来源、已通过审核的评论，合并重新计算。
- 测试 7 项全部通过：Adreset 原本 4.86 分、14 条，提交一条 5 星后变成 4.87 分、15 条；6 星返回 400；不存在的商品返回 404；后台不登录返回 401。测试评论已经用 SQL 删掉。
- zod 用 `import { z } from "@medusajs/framework/zod"`。新模块要先运行 `pnpm exec medusa db:generate review`，再运行 `db:migrate`。

**第 4 件已完成（2026-11-03）**：
- 根目录的 `scripts/import-metagenics.mjs` 会从 shopStore 提取评论，写进 `src/lib/data/metagenics/reviews.json`，并按"作者 + 日期 + 内容"**去重**，因为原始数据里每条评论都出现了两次。
- 后端新增 `POST /admin/reviews` 批量创建接口（zod 校验，在 `src/api/admin/reviews/validators.ts`），可以保留原来的作者、地区和日期，source 标为 collected。
- 导入程序是 `backend/scripts/import-reviews.mjs`（`pnpm import:reviews`），按 handle 找商品。某个商品如果已经有 collected 评论就跳过，所以重复运行不会产生重复数据。
- 结果：Tran-Q Sleep 和 MagActive Muscle 各 10 条。评分保持不变，因为采集到的 `metadata.rating` 本来就包含这些评论：Tran-Q 是 3.91 分、91 条，MagActive 是 4.28 分、58 条。
- 注意：采集到的评论**全是 5 星**，而平均分只有 3.9 到 4.3，说明采集的只是原网站排在前面的好评。
- 第一次导入时没有去重，导进了 40 条，后来用 SQL 删掉 collected 评论，再按去重后的数据重新导入。

**第 5 件已完成（2026-11-03）**：商城的商品、购物车和下单都走后端。
- `src/lib/medusa/server.ts`：只在服务端使用，访问 Store API。key 优先读环境变量 `MEDUSA_PUBLISHABLE_KEY`，否则读 `backend/.local/publishable-key`；还会找到美元区（`storeRegion()`）。
- `src/lib/data/metagenics/remote.ts`：从后端拉取 metagenics 集合的全部商品，转换成原来的 `CatalogProduct` 结构，在进程内缓存 15 秒。函数里调用了 `connection()`，所以只在请求时读取，构建时不需要后端。
- `lib/api` 的商品函数都改成 `await records()`。`priceRange` 改成异步。`listCategories` 和 `listProductTags` 仍然读本地 `catalog.json`，这样页头页脚可以提前生成。
- 类型新增：`Variant.id`（Medusa variant id）、`Product.medusaId`、`CartLineInput.variantId`。
- 后端图片地址是 `http://localhost:9000/static/...`。因为 Next 16 默认不优化本机 IP 的图片，所以对 http 地址加了 `unoptimized`，没有打开 `dangerouslyAllowLocalIP`。
- 后端新增 `POST /store/carts/:id/purchase-items`（`backend/src/api/store/carts/[id]/purchase-items/`）。订阅价由服务端从 variant metadata 里查出，再用 `addToCartWorkflow` 的 `unit_price` 加购。line item 的 metadata 里有 `purchase`、`months`、`list_price`。单次购买和订阅是两行。不存在的订阅周期会被拒绝。
- `backend/scripts/import-metagenics.mjs` 新增：
  - 区域改为美元区，包含 us 和 cn。
  - 物流：FedEx $32、DHL $15（美国）；SF $1.69、JD $1.127（中国，换算后正好 ¥12 和 ¥8）。shipping option 的 type code 是 `carrier-<id>`。
  - 优惠码 FRESH10 和 FARM20（按订单打折）。
  - 旧的 "Demo Standard $10" 在当前数据库里还在，商城按 `carrier-` 过滤掉了。
- 购物车：`src/lib/cart/actions.ts`（server actions）+ `src/lib/cart/types.ts` + `src/lib/store/cart.ts`（zustand，不再持久化）+ `components/cart/cart-sync.tsx`（启动时加载）。cookie 是 `freshshop_cart_id`（httpOnly）。所有金额都由后端计算。
- 结账：进入页面先调用 `prepareCheckout(us|cn)` 设置收货国家并列出物流；选择物流时调用 `selectCarrier`；提交时调用 `placeOrder`，依次更新邮箱和地址、设置物流、创建付款（pp_system_default），最后 complete。订单号显示为 `FR-00007` 这种格式（display_id）。英文站国家只有 United States。中文地址的映射：province → province，prefecture → city，区县和详细地址合并成 address_1，国家是 cn。
- 人民币显示：`localTotals()` 逐行换算再相加，保证每一行加起来等于总价。金额全程保留完整精度，只在显示时四舍五入。
- 验证结果：
  - 后台把 Adreset 改成 $49.95，16 秒后商城跟着变（之后已改回 $45.95）。
  - 购物车可以加入单次和订阅；改数量后订阅价不变；刷新页面购物车还在。
  - 无效优惠码被拒绝，FRESH10 生效。
  - 英文站 DHL 下单生成后台订单；中文站顺丰下单生成后台订单，地址是中国。
  - 控制台没有报错。
- 后台里有测试订单（#1–#8），是演示数据。
- **商城现在必须先启动后端才能使用**，因为没有静态数据回退。


### 第 6 件完成记录（商城评论界面）

- 新文件：`src/lib/reviews/types.ts`（每页 5 条，`REVIEWS_PAGE_SIZE`）、`src/lib/reviews/actions.ts`（server actions：`loadReviews` 和 `submitReview`，调用后端的 `/store/reviews`）、`src/components/product/product-reviews.tsx`（左侧汇总，右侧评论列表和"Show more reviews"按钮，下方是写评论表单）。
- `lib/api` 里新增 `getProductReviews(product)`。商品页把它的 summary 用在标题旁的评分上（采集评分加上顾客评论），然后传给 `ProductTabs`。
- 点击标题旁的评分（`#reviews`）会自动切到 Ratings 标签。
- 中英文文案都已补齐。
- 验证结果：
  - Tran-Q Sleep 显示 10 条评论，先显示 5 条，点 Show more 后显示 10 条。
  - 提交一条 4 星评论后，列表变成 11 条，标题旁变成 92 条评价。刷新后还在。
  - 没有评论原文的商品（Adreset，中文界面）只显示汇总和"还没有文字评价"。
  - 控制台没有报错。
  - 测试评论已经从数据库删掉。


### 第 7 件完成记录（完整走查 + 全新 clone 复刻）

- 完整走查（英文站）：首页 → 全部商品 229 个，按 Capsules 筛选后剩 43 个 → Tran-Q Sleep 选订阅（$39.96，原价 $49.95）→ 加入购物车，再加一个 Adreset 单次购买（小计 $85.91）→ 写评论 → 结账，使用 FRESH10 和 FedEx → 下单成功，实付 $109.32 → 后台订单列表里有这一单。控制台没有报错。走查脚本在会话的 scratchpad 里，没有放进仓库。
- 全新 clone 复刻：在空文件夹 clone `metagenics` 分支（42 MB，不带数据库和 node_modules），**只按 README 操作**：后端 install → setup:local → start:local → 两个导入脚本 → verify 输出 OK（229/316/213/316/4，图片 229/229）→ 根目录 install → pnpm dev → 同一套走查全部通过。结论：**别的会话 clone 后可以复刻。**
- 复刻时发现并修复的问题：用 `pnpm dev` 时，浏览器控制台会报 "uncached data … outside of <Suspense>"。这是 Next.js 16.4 只在开发模式下给出的提示，build 模式下看不到，所以之前没发现。按官方文档，在分类页和商品页加上 `export const instant = false`（表示"这两页每次请求都要读后端，允许等待"）。加上后报错消失，build 正常。
- README 的"从零跑起来"一节按实测步骤重写：分成终端 1 和终端 2，写明 "Ignored build scripts" 提示可以忽略，固定端口是 55433、9000、3000。
- 测试数据：之前的两条测试评论已经从数据库删除；原环境里多了订单 #8（走查产生的）。复刻用的临时文件夹已删除。

**"后端搬进 FresshShop + 评论功能" 的 7 件事全部完成。**

## 可能的下一步（还没做）

- **后端搬进 FresshShop + 评论功能**：7 件全部完成。
- 用户正在把 1.2 GB 图库作为 Release 上传到 FresshShop。
- 给保健品版换站名和配色（目前还叫 Freshnesecom、用绿色主题）。
- 部署到 Vercel。
- 把 Playwright 测试脚本放进项目（目前只在会话的临时目录里）。
- 商品内容的中文翻译。
- 把 1.2 GB 完整图库通过 GitHub Release 传上来，做详情页的多图相册。
