# MEMORY-REDESIGN.md — 首页改造（参考 Vitacost 布局）

> 这是"改造"专用的记忆文件，和 `MEMORY.md`（项目从头到现在的总记录）分开。新对话先读 `MEMORY.md` 了解项目，再读这份了解改造进度。
> 分支：`metagenics`（保健品版）。只改英文界面，中文暂时不管。

## 当前状态速览（2026-11-08 更新，新对话先看这里）

**已经改成 Vitacost 风格的（都在 `metagenics` 分支，已推送）：**

| 部分 | 状态 | 主要文件 |
|---|---|---|
| 导航栏 + 全站字体（Roboto Slab 标题 / Helvetica 正文）+ 搜索框阴影 | ✅ | `src/components/layout/vc-header/`、`src/lib/nav.ts`、`globals.css` |
| 首页轮播图 + 后端优惠（OCT26DAILY、满 $30 包邮） | ✅ | `src/components/home/vc-slideshow/`、`backend/scripts/import-metagenics.mjs` |
| 首页圆形分类 Explore More（6 个） | ✅ | `src/components/home/explore-circles.tsx`、`public/circles/` |
| 首页 6 排商品行 | ✅ | `src/components/home/vc-carousel/` |
| 页脚 + 11 个占位页 | ✅ | `src/components/layout/site-footer.tsx`、`src/lib/data/pages.ts` |
| 所有商品列表页（collection 风格） | ✅ | `src/components/collection/`、`category/[slug]/page.tsx` |
| 列表页排序下拉面板 + 商品一行一行出现（8 个起，每次 4 个，满 24 个出页码） | ✅ | `collection-toolbar.tsx`、`reveal-grid.tsx` |
| 顾客账户（登录注册、订单、订阅、地址、资料） | ✅ | `src/app/[lang]/(shop)/account/`、`src/lib/account/`、`src/components/account/` |
| 商品详情页（Vitacost 风格）+ 示例评价 | ✅ | `product/[slug]/page.tsx`、`purchase-panel.tsx`、`product-details.tsx`、`product-reviews.tsx`、`backend/scripts/import-demo-reviews.mjs` |
| 列表页横幅换成 Vitacost 照片横幅（12 张，去掉了原图的文字和 logo） | ✅ | `public/collection-banners/`、`collection-banners.ts`、`collection-banner.tsx` |
| 全站商品图换成白底干净图（229 张） | ✅ | `public/products/*.jpg`、`product-images.json`、`backend/scripts/import-metagenics.mjs` |

**已定不改**（2026-11-08 用户决定）：中文界面字体保持思源黑体，排序的 "Most popular" 不改名。改造工作到此告一段落，没有待办。

**继续工作前**：云端的后台进程最多跑 2 小时就会被系统停掉（前后端都被停过很多次）。用 Bash 的 `run_in_background` 启动（普通 `&` 启动的进程会被收掉）：先 `cd backend && pnpm start:local`（等 `/health` 返回 OK），再在根目录 `pnpm build && pnpm start`。被停掉后系统提示不要自动重启，等下次需要时再启动。数据都在 `backend/.local/postgres`，不会丢。数据库结构有新迁移时先跑 `pnpm setup:local`（可以重复运行）。

**用户的 Windows 电脑**：用户在自己电脑上让本地 agent 跑这个项目（启动脚本 `spawn("pnpm")` 在 Windows 上要加 shell，那边的 agent 负责修）。拉新代码后：有新迁移就在 backend 跑 `pnpm setup:local`；示例评价用 `pnpm import:demo-reviews` 导入。

## 用户的沟通习惯（和 MEMORY.md 一致）

- 用中文回复；一次只讲一件事，结构是"一句话 / 我会做的 / 做完之后会是什么样 / 你需要做的"，多用类比。
- 问题一个一个问；每做完一步停下来汇报，等用户确认再继续。
- 用户说"先谈谈"时只讨论，不动代码。

## 起因

用户想把商城首页改成 vitacost.com 首页的样子。2026-11-04 用 Playwright 访问并截图了 Vitacost 首页（云端可以访问，会弹出 20% OFF 邮件弹窗和 cookie 条）。

Vitacost 首页从上到下依次是：
1. 绿色促销条（"Free shipping over $30"，右边 Quick Reorder）
2. 头部：Logo、很长的搜索框、账户图标、购物车图标
3. 主导航：Categories / Specialty Shops / Brands / Deals（橙色）/ Holiday Shop / New Arrivals / Tips & Recipes，前四项是大下拉面板
4. 大横幅轮播（3 张）
5. Explore More：6 个圆形分类图标
6. 商品行：每行 5 个，可左右滑动；卡片有图、名字、星级+评价数、价格，图片左下角有绿色"+"可以一键加购；每行下面有"Shop all"
7. 页脚：Customer Service / My Account / Way to Shop / Email us

**边界**：只学布局，不用他们的 Logo、照片、文案和菜单数据。

## 导航栏组件来源

- 用户在另一个对话里做了一个组件 `vc-header`，放在 GitHub `Yuki-223/fresshshop` 的 Release "vc-header" 里，附件是 `vc-header-.zip`（asset id 709871908）。
- 下载命令：`gh api -H "Accept: application/octet-stream" repos/Yuki-223/fresshshop/releases/assets/709871908 > vc-header.zip`
- zip 里有：`VcHeader.tsx`（组件）、`vc-header.css`（样式，前缀 `.vch`）、`types.ts`、`nav-data.ts`（Vitacost 的 132 个链接，**不能用**）、`example.tsx`、`README.md`、`screenshots/`（8 张图）。
- 组件只依赖 React。功能有：促销条、吸顶（fixed + 等高占位）、鼠标移入展开 / 140ms 后收起、Esc 和点击外部关闭、三种下拉面板（sidebar：左边分类 + 右边三列；columns：多列；condensed：单列），还有手机抽屉。

## 已做的决定

### 导航栏
- 用 vc-header 当外壳，换成我们自己的内容：
  - 菜单数据改成我们的，从现有的分类和商品数据生成，保证每个链接都能打开，不会 404。
  - 普通 `<a>` 换成 `@/i18n/navigation` 的 `Link`，自动加 `/en` 前缀，也不会整页刷新。
  - 写死的英文（Shop All、搜索提示等）接到字典里。
  - Logo 换成我们的 "Freshnesecom" 文字。
- **菜单内容**（用户已确认）：

  | 菜单 | 内容 | 面板类型 |
  |---|---|---|
  | Categories | 左边 8 个导航分组，右边是每组下的健康分类 | sidebar |
  | Product Lines | UltraFlora、OmegaGenics 等产品系列 | condensed |
  | Shop by Form | 胶囊、粉剂、软胶囊等剂型 | columns |
  | Deals（强调色） | 订阅更省、组合装 | condensed |
  | Top Rated | 直接跳转 | 无下拉 |
  | Best Sellers | 直接跳转 | 无下拉 |

- **账户图标：保留。** 先链接到现有的占位页 `/en/account`（`src/lib/data/pages.ts` 里的 account）。用户**确实想要一个真正的账户页**，等首页改完后再做（Medusa 支持顾客注册、登录和订单列表）。设计稿（Figma 的 8 个画板）里没有账户页。
- **语言切换（中文 / EN）**：放在账户图标旁边。
- **购物车图标**：打开我们已有的购物车抽屉，数量从 zustand 购物车读取。
- **手机抽屉：删掉**（项目不做手机版）。

### 颜色和字体
- **颜色：用我们自己的**（橄榄绿 `--brand: #6a983c`，没有用 Vitacost 的亮黄绿 `#92C03C`）。
- **字体：用 Vitacost 的，全站一起换。**
  - 标题用 **Roboto Slab**（衬线，粗体 700），通过 next/font/google 加载。
  - 其他文字（正文、导航、搜索框、商品名、按钮、页脚）用 **Helvetica, Arial, sans-serif**（系统字体，不用下载）。
  - 这是 2026-11-04 用 getComputedStyle 实测的结果：Vitacost 的 `--font-heading-family` 是 "Roboto Slab", serif；`--font-body-family` 是 Helvetica, Arial, sans-serif。
  - 现在的字体是 Poppins（标题）、Open Sans（正文）、Noto Sans SC（中文），定义在 `src/app/globals.css` 和 `src/app/[lang]/layout.tsx`。
- **中文字体不换**：用户 2026-11-08 决定中文标题保持思源黑体，不用思源宋体。

## 计划

### 第 1 步：导航栏（✅ 已完成，2026-11-04）
1. 把组件放进项目，删掉手机抽屉，`<a>` 换成 `Link`。
2. 用我们的数据写菜单。
3. 用新导航栏替换现在的 `site-header`，接上搜索、购物车、语言切换和账户。
4. 换全站字体。
5. 检查：每个下拉面板、每个链接（不能有 404）、吸顶效果；确认商品页、购物车和结账没有被影响。
6. 截图给用户看，然后提交。

### 第 2 步：首页轮播图（✅ 已完成，2026-11-04）

- **组件来源**：Release "vc-header" 里的 `default.zip`（asset id 710007098）。zip 里有一个 `轮播图/` 文件夹，里面还有一层 zip（`vc-slideshow-react/`）。用户说只需要看 `VcSlideshow.tsx`、`vc-slideshow.css`、`types.ts`，接入方式参考 `example.tsx`；`assets/`（3 组 banner，1920×525 桌面 + 960×960 移动）和 `screenshots/` 是素材和截图。同一层还有一个 `vitacost-redesign.md`，还没读。
  - 下载：`gh api -H "Accept: application/octet-stream" repos/Yuki-223/fresshshop/releases/assets/710007098 > default.zip`
- 组件：零依赖，自动播放 3 秒一张，悬停暂停，下方是"← 1/3 → ⏸"。用原生横向滚动 + scroll-snap 实现。有可选的文字层（heading/subheading/ctaLabel）。
- 接入时要改：`<a>` 换成 `Link`；英文 aria 文案（Previous slide 等）接到字典；宽度对齐 `.container-page`（`--vcs-max-width: 1440px`，`--vcs-gutter: 45px`）；`#3a7a07` 换成我们的品牌色；放在首页顶部，替换现在的两张绿色卡片 banner。
- **图片：原样用 Vitacost 的 3 张图**（用户确认可以用，图 1 里别家品牌的瓶子也不换）。图上的文字是画在图里的：
  1. "20% off probiotics · Code: OCT26DAILY"（图里是 California Gold、Garden of Life 等别家瓶子）
  2. "Supplement Sale · 20% off trending categories · Code: OCT26DAILY"
  3. "Free shipping on orders over $30"
- **用户选了"改商城去配合图片"（方案 2）**，具体决定：
  - **OCT26DAILY = 整单 8 折**（和 FRESH10、FARM20 一样，在后端 import 脚本里建 promotion）。
  - **满 $30 包邮：4 种物流全部免运费**（FedEx、DHL、顺丰、京东）。按商品金额算，不含运费；如果用了优惠码，按折后金额算。做法：给每个 shipping option 的价格加一条 `item_total >= 30 → 0` 的价格规则。**要实测** Medusa 的 item_total 是折前还是折后金额；如果是折前，先告诉用户再商量。
  - **点击跳转**：图 1 → 益生菌分类（`/category/gut-detox?sub=digestion-and-probiotics`）；图 2 → 全部商品按评价最多排序（`/category/all?sort=popular`）；图 3 → 全部商品。整张图都可以点（"Shop now"是画在图里的）。
  - 改动要写进 `backend/scripts/import-metagenics.mjs`，保证从零 clone 也能复刻；README 的优惠码说明也要更新。
- 用户还说：**以后想把首页的商品图也换成 Vitacost 的**，因为我们的商品图很多带阴影，放在首页看起来灰蒙蒙的，Vitacost 的图很干净。等做商品行时再讨论。
- Release 里还有一个 `VcCarousel.zip`（asset id 709967201，里面是 `VcCarousel.tsx`、`INTEGRATE.md`、`example.tsx`），看名字是商品行的滑动组件，**还没读**，等做商品行时再看。

### 第 3 步起：圆形分类、商品行、首页商品图、页脚、商品列表页（✅ 全部已完成，2026-11-05）

规矩不变：一次只问一个问题，讨论完写进这里，用户说"开始"才动手。

#### 用户的总体要求（2026-11-05）
- 把 Vitacost 首页的**圆形分类**和**商品行**复刻过来，**图片也用 Vitacost 的**，但**点击跳转到我们自己的链接**。

#### 调研结果
- **Vitacost 也卖 Metagenics，一共 209 个商品**（例如 AdvaClear、Bone Builder、Collagenics、Glutagenics、Magnesium Glycinate、OmegaGenics）。
  - 查询方式：`https://www.vitacost.com/search?q=metagenics`；品牌页 `https://www.vitacost.com/collections/metagenics` 返回 200。
  - 这意味着商品行可以做成：**商品还是我们的**（价格、库存、购物车都不变），**图片换成 Vitacost 上同一个商品的干净白底图**（按商品名匹配）。这正好解决用户之前说的"我们的商品图有阴影、灰蒙蒙"的问题。具体做法还没讨论。
- **`VcCarousel.zip`（商品行组件）缺文件**：`INTEGRATE.md` 说需要 `VcCarousel.tsx` + `vc-carousel.css` + `types.ts` 三个文件，缺一不可。但 zip 里只有 `VcCarousel.tsx`（491 行）、`INTEGRATE.md`、`example.tsx`，**没有 `vc-carousel.css` 和 `types.ts`**。已告诉用户，等讨论到商品行时请用户补传。
  - 组件要点（来自 INTEGRATE.md）：props 必填 `title`、`products`；`background` 用 `#ffffff` 或 `#edf6de` 交替；`perView` 默认 5（卡宽 = 1280 ÷ 5 = 240px）；有 `shopAllHref`；`onAddToCart`（悬停时加购按钮从 36px 圆形展开成 128px 胶囊）；有 loading、空、错误三种状态；`scrollStorageKey` 用来区分多个商品行；Next.js 里要加 `'use client'`。
  - 下载：`gh api -H "Accept: application/octet-stream" repos/Yuki-223/fresshshop/releases/assets/709967201 > VcCarousel.zip`

#### 圆形分类：已做的决定
- **图片：原样用 Vitacost 的 6 张圆形图**（用户选的方案 1，理由是"为了页面干净"）。用户已知道图和我们的分类内容对不上，可以接受。
  - Vitacost 原来的 6 个圆圈：Supplements（胶原蛋白粉）、Sports（Orgain 蛋白粉）、Grocery（玉米片）、Personal Care（Rael 女性护理）、Pets（宠物关节咀嚼片）、See all deals（"See all deals"文字图）。圆圈下的文字是 Helvetica 18px。
  - 实现时要从 vitacost.com 首页把这 6 张图下载到 `public/` 里自己托管（CDN 链接会过期）。

#### 圆形分类：文字问题（✅ 用户选了 B）
**圆圈下面的文字用他们的还是我们的？**
- **A. 用他们的文字**（Supplements / Sports / Grocery / Personal Care / Pets / See all deals）：最像原站，但我们没有 Grocery、Pets 这些分类，点进去会对不上。
- **B. 换成我们的分类名（推荐）**，按图的内容找最接近的分类：

  | 图 | 文字 | 链接 |
  |---|---|---|
  | 胶原蛋白粉 | Vitamins & Wellness | `/category/vitamins-wellness` |
  | Orgain 蛋白粉 | Joint & Sports | `/category/joint-sports` |
  | 玉米片 | Gut & Detox | `/category/gut-detox` |
  | Rael 女性护理 | Women, Men & Kids | `/category/women-men-kids` |
  | 宠物关节咀嚼片 | Brain, Mood & Sleep（最难对上，只是凑一个位置） | `/category/brain-mood-sleep` |
  | See all deals | See All Deals | `/category/all?subscribe=1` |

  我们有 8 个分组，只有 6 个位置，Heart & Metabolism 和 Immune Health 放不进来（顶部 Categories 菜单里都有）。用户选 B 的话，表里任何一行都可以改。

#### 圆形分类：✅ 已完成（2026-11-05）
- 用户选 **B**（文字用我们的分类名），并且**保持 6 个圆圈**。Heart & Metabolism、Immune Health、Bundles 这 3 个分组没有圆圈，只在顶部 Categories 菜单里。之前写成"2 个放不进来"是错的，实际是 3 个，已向用户更正。
- 实现：`src/components/home/explore-circles.tsx`（服务端组件）。图片在 `public/circles/`，文件名是 vitamins-wellness / joint-sports / gut-detox / women-men-kids / brain-mood-sleep / deals.jpg，从 vitacost.com 下载，360×360。字典新增 `home.exploreMore`、`home.seeAllDeals`。
- 按原站实测：标题 Roboto Slab 24px 700，居中，在轮播控件下方 12px（首页里轮播和圆圈包在一个 `space-y-3` 的 div 里）；标题和图片间隔 30px；图片 170×170，间距 48px，整排居中，横坐标和原站完全一致（90、308、526……）；文字是 Helvetica 18px，字间距 0.6px，颜色 ink/75，在图片下方 30px，悬停时加下划线。
- 我们的分类名比原站长，所以文字用 `-mx-6 whitespace-nowrap`，可以占用两侧间距，保持一行（每个 218px 宽）。
- 6 个链接都实测能打开：Vitamins & Wellness 119 个商品、Joint & Sports 57、Gut & Detox 65、Women, Men & Kids 61、Brain, Mood & Sleep 63、See All Deals → 订阅商品 195。控制台没有报错。

#### 商品行：✅ 已完成（2026-11-05）
- **Vitacost 首页其实有 6 排**（我第一次只看到 4 排，被用户指出）：Vitacost Best Sellers / California Gold Nutrition Favorites / Sport Supplements / NAD+ Formulas / GLP-1 Support / Trending Products。背景浅绿（#edf6de）和白色交替，第一排是绿色。
- 用户同意的对应关系（每排 10 个商品，一屏 5 个）：

  | # | Vitacost | 我们 | 数据 | Shop all |
  |---|---|---|---|---|
  | 1 | Best Sellers | Best Sellers | `getMostReviewed(10)` | `/category/all?sort=popular` |
  | 2 | California Gold Favorites | UltraFlora Favorites | `getByProductLine("UltraFlora")`（新增） | `/category/all?brand=UltraFlora`（21 个） |
  | 3 | Sport Supplements | Sports Nutrition | `getByCategory("protein-and-sports-nutrition")` | `/category/joint-sports?sub=…`（27） |
  | 4 | NAD+ Formulas | Brain & Cognitive Health | `getByCategory("brain-and-cognitive-health")` | `/category/brain-mood-sleep?sub=…`（31） |
  | 5 | GLP-1 Support | Weight Management | `getByCategory("weight-management")` | `/category/heart-metabolism?sub=…`（42） |
  | 6 | Trending Products | Top Rated | `getTopRated(10)` | `/category/all?sort=rating` |

- 用户说"按你说的做"，没讨论的三处我按默认处理，并告诉了用户：
  1. 图片暂时用我们自己的商品图（换成 Vitacost 干净图是下一步）。
  2. "+" 加入**默认规格、单次购买**（`defaultVariant` + `toCartLine(..., {type:"once"})`，复用 `useAddToCart`，会弹出提示）；缺货时 "+" 变灰不能点。
  3. 首页原来的区块（Most reviewed / Top rated 侧栏 + 网格、Shop by health goal、Weekly deals、Sleep picks）**全部换成这 6 排**。首页现在只剩：轮播 → Explore More → 6 排商品。
- 组件：用户先传了 `VcCarousel.zip`（只有 tsx），之后又单独上传了 `vc-carousel.css`（Release 资源 id 712651989）。`types.ts` 一直没传，我直接用我们的 `Product` 类型代替了 VcProduct。
- 实现：`src/components/home/vc-carousel/vc-carousel.tsx` + `vc-carousel.css`。
  - 只保留桌面端；去掉了加载、空、错误三种状态和滚动位置记忆（数据由服务端渲染，用不上）。
  - 内容对齐 `.container-page`（max 1440，左右 45），卡片 254px 宽。
  - 颜色用我们的变量：绿色背景是 `color-mix(brand 12%, white)`，"+"和 Shop all 用 `--brand`。
  - 标题用 Roboto Slab 24px 700；商品名强制用 `--font-sans`（因为 h3 默认是衬线体）。
  - 图片用 `object-fit: contain` 加白底（我们的图不是正方形棚拍图）。
  - 字典新增 `home.shopAll`、`home.shelf*`。
  - 6 排放在 `.container-page` 外面，这样背景能铺满整个宽度。
- 验证结果：
  - 6 排都是 10 个商品，背景交替正确。
  - 悬停时 "+" 展开到 128px，显示 "Add to cart"。
  - 右箭头翻页（scrollLeft 0 → 1096），翻页后出现左箭头。
  - "+" 加购后购物车 0 → 1，弹出提示，抽屉里是单次购买。
  - 点商品名进入商品页。
  - 6 个 Shop all 的商品数都对。
  - 完整走查通过（订单 #11），控制台没有报错。

#### 首页商品图：✅ 已完成（2026-11-05）
- 用户决定：**现在只换首页 6 排的图**。全站的图以后由用户把**自己采集的图片导入数据库**，改数据库就能统一，到时候首页的覆盖可以删掉。
- 数据来源：Vitacost 是 Shopify 网站，`https://www.vitacost.com/collections/metagenics/products.json?limit=250` 可以一次拿到 203 个 Metagenics 商品的标题和图片（第 2 页是空的）。
- 匹配方法：按商品名的词重合度打分，再比默认规格的数量（如 120 Tablets）和口味，打分脚本在会话 scratchpad 里（`match.py`，没有放进仓库），**然后人工逐个检查**：
  - 手动改正了 2 个：Rapid Relief → "Rapid Relief, Body Soreness, 20 Softgels"（之前错配成 HerWellness Rapid *Period* Relief）；UltraFlora Triplebiotic with Akkermansia → "UltraFlora Triplebiotic, Gut Health"（之前错配成 Healthy Weight）。
  - **继续用我们自己的图（8 个）**：StayStrong+ 的 3 个商品、Ceriva、Essential Nutrition Shake、OmegaGenics Fish Oil Mega 10（Vitacost 没有这些商品）；Power Nutrition Shake（我们默认是 Mixed Berry，他们只有 Chocolate）、UltraClear Plus pH（我们默认是 Pineapple Banana，他们只有 Vanilla）。口味不同时不换，避免图上印的口味和"+"加进购物车的不一样。
- 结果：首页 52 个不同商品里有 44 个换成 Vitacost 的图（60 张卡片里有 50 张）。
- 实现：
  - （已被"全站商品图"取代，下面两行是当时的做法）图片在 `public/home-products/<slug>.jpg`（从 Shopify CDN 下载，`?width=600`，一共 2.3MB）。
  - 对照表 `src/lib/data/metagenics/home-images.json` 的格式是 `{slug: {image, vitacost: 对应的 Vitacost 标题}}`。
  - 首页 `page.tsx` 的 `withHomeImage()` 只在首页把 `product.image` 换掉；商品页、分类页、购物车都不受影响。
- 验证结果：60 个图片地址都能打开；没翻页的卡片图片是延迟加载，翻页后全部加载完成；控制台没有报错。

#### 页脚：✅ 已完成（2026-11-05）
- 用户要求："换成他们的页脚，哪怕没有页面就用一个占位页面来做"。
- 先给用户看了对比：我们原来的页脚是 4 栏（Get in touch / Connections / Earnings / Account）加产品系列标签和版权行，**大部分链接都是只有一句话的说明页**；Vitacost 是"客服中心"式的页脚。
- 实现：重写 `src/components/layout/site-footer.tsx`（`Copyright` 组件保留，结账页还在用），新增 `src/components/layout/payment-icons.ts`。
  - 按原站实测：背景 `#eeefee`；全用 Helvetica，字间距 0.6px；栏目标题 18px 700 `#121212`；链接 14px，行距 18.2，行间隔 28.8，颜色 75%；三栏间距 40px；右边 "Email us anytime" 13px 700，前面是品牌绿的信封图标，左侧 1px 分隔线，宽 319；底部政策链接居中，用浅灰 "I" 隔开；再往下是一条 1px 分隔线、支付图标（38×24，间距 10），最后是带细边框的免责声明（12px）。
  - 和原站对比：三栏横向间距一致；底部链接 250 对 249；总高度 484 对 482。
  - 支付图标**只放我们结账真正支持的**：Amex、Diners、Discover、Mastercard、PayPal、Visa（Shopify 标准 SVG，从原站取下来）。原站还有 Apple Pay、Google Pay、Shop Pay，因为我们不支持，所以没放。
  - 免责声明用 "*"（我们商品描述里用的是 *），中文也翻译了。
  - 去掉了：社交链接、Earnings 栏、产品系列标签、版权行。
- **新增 11 个占位页**（`src/lib/data/pages.ts`，复用 `[page]` 说明页模板，中英文都有，内容按演示站的真实情况写）：track-order、refund-policy、shipping（满 $30 包邮，否则 DHL $15 / FedEx $32）、promo-exclusions（列出 3 个优惠码）、contact、orders、service-updates、privacy-choices（购物车和语言用 cookie，心愿单和对比列表存在浏览器里）、do-not-sell、brands（全部是 Metagenics，按系列浏览请用 Product Lines 菜单）、site-map。
  - 链接对应：Account Login → /account（已有的占位页）；Shop by Category → /category/all；About → /about；Privacy → /privacy；Terms → /terms。
  - 16 个链接全部实测 200，标题和内容都对；中文版 /zh/shipping 也正常。
- **顺手修复：分类页的页码被 "Show more products" 按钮挡住了**。原因是 229 个商品 ÷ 每页 9 个 = 26 页，全部列出来超出了左边 1/3 栏的宽度（换成 Helvetica 后更宽）。改成省略式：`pageWindow()` 显示第一页、最后一页和当前页前后各 2 页，比如 `1 2 3 4 5 … 26`、`1 … 11 12 13 14 15 … 26`。实测页码右边到 495px，按钮左边从 616px 开始，不再重叠。
- 完整走查通过（订单 #12），测试评论已删除。

#### 商品列表页（collection 风格）：✅ 已完成（2026-11-05）
- 用户给了 Vitacost 的 `https://www.vitacost.com/collections/glp-1-formula` 作参考，要求把我们的列表页改成那样。
- 讨论：给用户解释了分类页是"积木拼起来的"（Breadcrumbs / 标题+ViewToggle / FilterBar / AppliedFilters / FilterSidebar / ProductCard 或 ProductListItem / CatalogPagination），数据来自网址参数。**所有列表页共用一个模板**（`category/[slug]`）：分类、子分类、产品系列、剂型、Deals、Top Rated、Best Sellers、头部搜索结果、首页圆圈和 Shop all 都会一起变。商品详情页不变。
- 用户选 **A：做一套新积木**。旧积木不删；`ProductCard` 继续用在商品详情页底部的"Frequently bought together"（实测那里还是 4 个 "Buy now"）。用说明图（同一张卡片用在两个地方 → A/B 两种做法）向用户解释过。
- 原站实测（这些页面由 Boost Commerce 插件渲染，class 前缀是 `boost-sd__`）：
  - 横幅图 1300×317（标题直接画在图里）。
  - 左侧筛选栏宽 244（外层 272，离横幅左边 42），每个筛选项下边线 `#e8e8e1`，上下 padding 25，▸ 加 14px 标题；展开后是勾选框行，数量 "(n)" 是灰色；Brand 带一个 "Search Options" 搜索框；Price 是两个 "$" 输入框加滑块，下面有 5 个刻度数字；Price 和 Review Ratings 默认展开。
  - 右侧：方角搜索框（944×34，1px `#7d7d7d` 边框），下面一行左边 "37 Products"、右边 "Sort By: Best Selling"。
  - 每行 4 个，卡片 230 宽，横向间距 8，纵向间距 26，无边框，图片 1:1；下面依次是 vendor（12px）、标题（12px/18，两行）、绿色星星 16px + 评价数 13px、价格 16px、整条按钮（36 高，圆角 4，15px，字间距 1px，背景 `#8fc042`）。
  - 翻页：底部居中的 "1 2 ›"；每页 24 个。
- 实现（`src/components/collection/`）：
  - `collection-banner.tsx`：浅色面板 `#f3f4f1`，高 330；左边是 Roboto Slab 56px 的标题，选了子分类或单个品牌时加一行副标题（所属分组名）；右边最多 3 张商品图，**只用有干净图的商品**（首页的 `home-images.json`），轻微倾斜放在白卡上；没有干净图时只显示标题。
  - `collection-sidebar.tsx` + `collection.css`（双滑块样式）：分类（子分类）、Brand（产品系列 + 搜索框）、Specialties（订阅更省、组合装）、Price、Availability（有货）、Form、Review Ratings（5→1 星，带数量）。**网址参数和旧 FilterSidebar 完全一样**（sub / brand / form / rating / min / max / stock / subscribe / bundle）。有筛选条件的那一项会自动展开。
  - `collection-toolbar.tsx`：本分类搜索（写 `?q=`）、"N Products"、Sort By（原生 select）。
  - `collection-card.tsx`：vendor 显示产品系列，没有系列时写 "Metagenics"；价格显示**最低价**，不同规格价格不一样时前面加 "From"（和价格排序、价格筛选保持一致——一开始用了默认规格的价格，按价格排序时第一个显示 $33.95、第二个 $17.95，已修正）；按钮加入默认规格、单次购买，缺货时是灰色 "Out of stock"。
  - `collection-pagination.tsx`：复用 `pageWindow()`，居中，前后有箭头，当前页加下划线。
  - `category/[slug]/page.tsx`：去掉了面包屑、ViewToggle 和列表视图（Vitacost 没有）；`AppliedFilters` 沿用旧组件。
  - 数据层：`getFacets()` 新增 `ratings`（按整星分桶，和评分筛选的规则一致）；`PAGE_SIZE` 从 9 改成 24。
  - 字典新增 `collection.*`（中英文）。
- 验证结果：
  - 体重管理 42 个；勾选 UltraFlora 后 3 个；再加 4 星仍是 3 个；Clear all 回到 72 个。
  - 全部商品 229 个，页码显示 "1 2 3 4 5 … 10"；按价格从低到高排序正确（15.95 → 17.95…）；第 2 页正常。
  - 在 gut-detox 里搜 fiber 得到 4 个；价格上限 $20 得到 6 个。
  - 列表页加购正常；中文页、头部搜索结果、订阅、组合装、多条件组合筛选都正常。
  - 完整走查通过（订单 #13）。走查脚本已经改成先展开 "Form" 再点 Capsules。

#### 全站商品图：✅ 已完成（2026-11-05）
- 用户觉得列表页的图"太脏"（我们的原图瓶子下面有蓝灰色阴影和倒影），选了方案 **B**：能在 Vitacost 找到同一商品的用他们的图，找不到的把我们的图用程序去阴影。
- 结果（229 个，每个都人工看过对比图）：
  - **136 个用 Vitacost 的图**（含首页之前换过的 44 个）。按名字、规格、口味逐个核对；规格不同但我们也卖那个规格的算对上（例如 Lipo-Gen 我们默认 90 粒，图是 270 粒）。
  - **87 个用我们的图去阴影**：76 个 Vitacost 没有；6 个 Vitacost 的图是旧包装（Exhilarin、GlutaClear、Lipotain、MetaFiber、GLA 240、Tran-Q Sleep），为了和新包装统一不用；其余是包装、口味、剂量对不上（规矩和首页一样：图上印的要和加进购物车的一致）。
  - **6 个保留原图**：原图是白底照片（不是透明底），程序分不清白色背景和白色瓶盖，去阴影会把瓶盖和标签抠掉，所以不动。
- 去阴影的方法：我们的原图大多是透明底 PNG，瓶子不透明、阴影半透明。把透明度低于 180 的像素去掉，180–250 之间做平滑过渡，然后居中放在白色正方形上（四周留约 6%）。脚本是 `scripts/clean-product-image.py`。
- 实现：
  - 229 张图统一成 `public/products/<slug>.jpg`（原来的 PNG 删掉了，图片总大小从 20MB 降到 8.5MB）；`catalog.json` 里的图片路径同步改成 `.jpg`。
  - 新增 `src/lib/data/metagenics/product-images.json`：记录每张图的来源（`vitacost` + 对应的 Vitacost 标题 / `cleaned` + 原因 / `original` + 原因）。
  - **删掉了首页的临时覆盖**：`home-images.json`、`public/home-products/`、首页 `withHomeImage()`。列表页横幅现在直接用列表里前 3 个商品的图。
  - 后端导入脚本：重复运行时，比较数据库里的图和仓库里的文件是否一样，不一样就上传新图并更新商品（第一次运行更新了 217 + 6 个，再运行是 0 个）。上传时按扩展名设置图片类型（原来写死成 PNG）。
  - 根目录的 `scripts/import-metagenics.mjs`（从 shopStore 重新生成 catalog 的脚本）会跳过 `product-images.json` 里的商品，不会用原图覆盖干净图。
- 注意：开着 `pnpm start:local`（medusa develop）时修改 `backend/scripts/` 里的文件会让后端自动重启几秒钟。
- 验证：全部商品 10 页共 229 张图都能加载；首页、分类页、详情页没有坏图；控制台没有报错；完整走查通过（订单 #14），测试评论已删除。

#### 第 3 步里讨论过的问题（全部已解决）
1. 圆形分类的文字 → B（用我们的分类名），6 个圆圈。
2. 商品行放什么 → 6 排（Best Sellers / UltraFlora / Sports / Brain / Weight / Top Rated）。
3. 商品行的图片 → 只换首页（44/52），全站以后导入数据库。
4. "+" 一键加购 → 默认规格、单次购买（用户说"按你说的做"）。
5. 首页区块标题 → Roboto Slab 24px 700（商品行组件自带）。
6. 首页旧区块 → 全部换成 6 排商品行。
7. 页脚 → 换成 Vitacost 风格（见"页脚"一节）。

#### 环境提醒
- 后端在后台跑满 2 小时会被系统停掉：2026-11-04 两次，2026-11-05 一次（做完列表页之后）。系统提示过：已经用了最长时限的后台任务，不要自动重启，等下次需要时再启动。数据还在数据库文件里。继续工作前先启动：`cd backend && pnpm start:local`（放在后台运行，等 `/health` 返回 OK），然后在根目录 `pnpm build && pnpm start`（或 `pnpm dev`）。

### 以后可选的步骤（用户没要求，想做再提）
- 商品图分辨率：去阴影的 87 张大多来自 294px 的原图，在详情页的大图里有点模糊。以后如果用户导入自己采集的高清图，按 `product-images.json` 替换 `public/products/<slug>.jpg`，再运行后端导入脚本就会自动换图。

## 进度

- 2026-11-04：讨论完导航栏、颜色和字体，写了这份文件。
- 2026-11-04：**第 1 步导航栏完成。**
  - 新文件：`src/components/layout/vc-header/`，包括 `vc-header.tsx`（客户端组件）、`vc-header.css`（只保留桌面部分，颜色改用我们的变量，内容和 `.container-page` 对齐，左右各 45px）、`types.ts`、`vc-search.tsx`（长搜索框，搜索全部商品）。还有 `src/lib/nav.ts` 的 `buildNav(locale, t)`，用本地 catalog 生成菜单，所以头部仍然可以预渲染。
  - `site-header.tsx` 改成使用 VcHeader：促销条写"订阅最高省 20%"，链接到订阅筛选；右边是 Help。图标区依次是语言切换、账户（链接到 `/account` 占位页）、购物车（换成购物袋图标，角标用品牌绿）。
  - 删掉了旧的 `main-nav.tsx` 和 `search-bar.tsx`。字典里新增了 `nav.*`（中英文都有）。
  - Categories 面板从 Vitacost 的 1100×420 改成宽 900px、高度随内容变化，因为我们每组只有 1–4 个分类。菜单里每个链接后面显示商品数。
  - 点击菜单里的链接后，菜单会自动关闭（客户端跳转时头部不会重新加载，所以要手动关）。
  - **字体**：`--font-display` 是 Roboto Slab，用在 h1–h6（globals.css 的 base 规则）；`--font-sans` 和 `--font-heading` 都是 Helvetica, Arial。注意：`font-heading` 这个 class 在代码里一直用在按钮、价格、标签上，一共 74 处，所以它现在是无衬线粗体，和 Vitacost 一致。只有真正的标题是衬线体。去掉了 Poppins 和 Open Sans。
  - 验证结果：
    - 菜单里的 60 个商品链接全部能打开，菜单显示的数量和页面上的数量一致。
    - 搜索、吸顶、购物车抽屉、账户链接都正常。
    - 完整走查（首页到下单）全部通过，控制台没有报错。走查产生了测试订单 #9，测试评论已删除。
  - **字体修正（用户指出菜单不是衬线）**：第一次查字体时只取了每类元素的第一个，取到的是隐藏的手机菜单，所以结论错了。重新逐个查了页面上看得见的文字，Vitacost 的规则是：
    - Roboto Slab（衬线）：菜单 7 个主项（400，15px）、下拉面板大标题（700，20px）、多列面板的小标题（600）、首页区块标题（700，24px，例如 "Explore More"、"Vitacost Best Sellers"）。
    - Helvetica：绿条、搜索框、下拉面板里的普通链接和左侧分类、圆形分类下的文字（18px）、商品名、价格。
    - 已经改好：`.vch__menu-link`、`.vch__panel-title`、`.vch__group-title` 改用 `var(--font-display)`。Categories 右侧改成两列，因为面板变窄后三列会把 "Omega-3s & Fish Oil" 截断。
    - **做首页时要注意**：我们的区块标题现在是 18px semibold，Vitacost 是 Roboto Slab 24px 700，到时候要对齐。
  - 下一步：首页的其他部分。
- 2026-11-04：讨论完轮播图（第 2 步），决定写在上面。
- 2026-11-04：**第 2 步轮播图完成。**
  - 新文件：`src/components/home/vc-slideshow/`，包括 `vc-slideshow.tsx`（客户端组件，用 useT 读取按钮文字；用 next/image；只保留桌面端；没有文字层）、`vc-slideshow.css`（放在 `.container-page` 里面，图片区域 1350×369）、`types.ts`。图片放在 `public/banners/`（probiotics.jpg、supplement-sale.jpg、free-shipping.jpg，只用了桌面版 1920×525）。
  - 首页第一行原来是"左侧分类列表 + 两张绿色卡片"，整行换成了轮播图（左侧分类列表和顶部 Categories 菜单重复，所以一起去掉）。删掉了 `promo-banner.tsx`。字典新增 `home.slide*`。
  - 后端（`backend/scripts/import-metagenics.mjs`）：
    - OCT26DAILY 整单 8 折。
    - 每个 shipping option 加了价格 `{amount: 0, rules: [{attribute: "item_total", operator: "gte", value: 30}]}`。已经存在的 option 也会补上，脚本可以重复运行。
  - **实测**：Medusa 的 `item_total` 是**折后**金额，符合要求（$34.95 用码后变成 $27.96，物流恢复收费）。
  - **发现并修复的漏洞**：Medusa 改商品数量时会重新计算已选物流的运费，但**输入优惠码时不会**。所以 `applyPromoCode` 会在已经选了物流时重新选一次。结账页在 `subtotal - discount` 变化时也会重新获取物流价格，运费为 0 的物流显示 "Free"（`checkout.freeShipping`）。
  - 验证结果：
    - 轮播：自动 3 秒切换、悬停暂停、箭头、暂停按钮、3 张图的跳转都正常。
    - 结账：$25.95 → 收运费；$60.90 → Free；用码后 $48.72 → 仍然 Free；删掉商品后 $27.96 → 恢复 $32；先选了免费的 FedEx 再用码降到 $30 以下 → 运费变回 $32。
    - 完整走查通过（订单 #10，FedEx 包邮，实付 $77.32），控制台没有报错。测试评论已删除。
- 2026-11-04：**搜索框加阴影**（用户截图指出 Vitacost 的搜索框有阴影）。按原站实测：没有普通边框，用两层伪元素画出来：`::before` 是 `inset 0 1px 3px #ccc`；`::after` 是 1px `rgba(18,18,18,.15)` 边框加同样的内阴影，向内缩 1px。高 38px，圆角 25px，输入文字 16px，提示文字 `rgba(18,18,18,.5)`。聚焦时 `::after` 的边框颜色加深。
- 2026-11-05：开始讨论**第 3 步（圆形分类 + 商品行）**。
  - 已决定：圆形分类原样用 Vitacost 的 6 张图，点击跳转到我们的链接。
  - 用户本来说要开新对话，后来决定在原对话继续。用户选了 B、保持 6 个圆圈，**圆形分类已完成**。
  - 下一步：讨论商品行（上面列表的第 2 项起）。
- 2026-11-05：**6 排商品行完成**（见上面"商品行"一节）。
- 2026-11-05：**首页商品图换成 Vitacost 的干净图**（只换首页，44/52 个）。全站的图以后由用户导入数据库。
- 2026-11-05：**页脚换成 Vitacost 风格**，新增 11 个占位页；修复了分类页页码重叠的问题。
  - 用户还问过"现在下载到本地能不能得到一样的结果"：检查过，上次从零 clone 测试之后没有新增依赖或安装步骤，所有图片都已经提交，**按 README 操作就能复刻**。小差别有三点：Mac 上是真正的 Helvetica（云端是相似的替代字体）；本地没有测试订单；第一次运行需要联网下载依赖和 Roboto Slab。提议过再做一次完整的从零测试，用户还没回答。
- 2026-11-05：**所有商品列表页改成 Vitacost collection 风格**（新积木，详情页底部推荐卡片不变）。
- 2026-11-05：后端第 3 次被系统停掉（没有自动重启）。整理了这份文件：加了"当前状态速览"，清理了过时的待办清单。
- 2026-11-05：**全站商品图换成白底干净图**（136 张 Vitacost + 87 张去阴影 + 6 张原图），去掉了首页的临时图片覆盖。
- 2026-11-06：**列表页排序改成 Vitacost 的自定义下拉面板**（原来是浏览器自带的 select，展开是系统样式）：250px 白色面板，按钮下方 10px、右对齐，1px #eee 边框，选项 34px 高、当前项和悬停项加下划线；支持 Esc、点外部关闭和上下方向键。文字改成 "Sort by:"。搜索框只微调了提示文字颜色（#7a7a7a）和放大镜位置。排序选项还是我们原来的 5 个（Vitacost 是 Best selling / Relevance / 价格两种 / Newest / Top Rated）。
- 2026-11-06：**列表页横幅换成 Vitacost 的照片横幅**。用户说"不匹配也可以，好看就行"。Vitacost 大部分分类页其实没有横幅，扫了 261 个分类页，找到 26 张照片横幅（1024×250 或 1441×200），中间都有标题文字或品牌 logo。用 `scripts/erase-banner-text.py`（OpenCV inpaint）把中间的字和 logo 抹掉，挑了 12 张效果干净、和保健品相关的（Bob's Red Mill、Garden of Life、New Chapter 的 logo 是大色块，抹不干净，没用；食品、个护、带别家瓶子的也没用），改成中性的文件名放在 `public/collection-banners/`。横幅组件改成整张照片（按 1024:250 铺满容器宽度，约 1350×330）+ Roboto Slab 52px 标题写在照片留空的地方（两边有图的居中，右边有图的靠左）。`collection-banners.ts` 按分组和部分子分类分配横幅，其他页面（全部商品、搜索、产品系列、剂型、Deals 等，都在 /category/all 下）用 spoons-beige。原来横幅右边的 3 张倾斜商品卡去掉了。
- 2026-11-06：**列表页一行一行出现（用户设计）**：每页还是 24 个（和 Vitacost 一样），先显示 8 个（2 行），滚到离底部 300px 内再出 4 个（1 行，淡入上浮 0.45s），8→12→16→20→24，出完才显示页码，然后去下一页。数据还是一次拿 24 个，只是分批显示（真的每次请求 4 个会卡）；图片本来就是懒加载。高屏幕会自己一行行补满。已显示的数量按列表（语言+分类+筛选+排序+页码）存在 sessionStorage，返回时不会又从 8 个开始，浏览器能回到原来的位置（实测 1000/2100/3000 都回到原位）；同一个标签页里再次打开同一个列表也会直接显示上次看到的数量。代码：`src/components/collection/reveal-grid.tsx`、`collection.css` 的 `.vc-reveal`。走查通过（订单 #15）。
- 2026-11-07：**商品详情页改成 Vitacost 风格**（用户逐项确认）：蓝色面包屑（›）；标题居中 26px 常规字重 + 2px 虚线 + "SKU # | 剂型 | 产品系列"；左边 585 白底细边框大图（去掉 Save 20% 标签）；右边购买区 "Our Price: $ ★ 数量"、**规格保留按钮**（用户：下拉要点两下，成本高）但改成 4px 圆角、选中绿边浅绿底、按钮里带价格；单次/订阅二选一保留；142×42 数量框 + 340×42 绿色 Add to cart；心愿单/对比改成按钮下的小文字链接；虚线下 Key info（每份用量、总份数按所选规格算 = 粒数 ÷ 每份粒数、剂型、产品系列；组合装不显示用量/份数，因为采集的成分表只是第一个商品的）。"You Might Also Like" 用首页商品行（相关商品最多 10 个）。Details 大框全部展开：左说明/用法/储存/注意事项/警告/FAQ，右成分表；注意事项原文里商品名和句子粘连（"Magnesium GlycinateKeep…"、组合装多段），按句首词拆开、商品名加粗。Customer Reviews：左总分 + 星级条形图（**只统计文字评价**，因为采集评分没有每星级数量；后端 `/store/reviews` 新增 `breakdown`）+ "Write a review"（原地展开表单），右评论列表 + "显示更多评论"。删掉了旧的标签页、`product-card.tsx`、`section-header.tsx`、`BuyNowButton/AddToCartButton` 和没人用的字典键。走查脚本已更新（价格选择器、评论区、Add to cart exact）。
- 2026-11-07：**示例评价**（用户要求"为了好看先编一些"，选了 A：页面上标出来）。`backend/scripts/import-demo-reviews.mjs`（`pnpm import:demo-reviews`）：每个商品 3–8 条，共 1292 条，按商品 handle 做种子、结果固定；星级以 4–5 为主，评分低的商品多几条 3 星；只写口感、吞咽、冲调、包装、发货、订阅、回购，**不写功效**。存为 review source `demo`（新迁移 `Migration20261107090000` 放宽 check 约束），不计入总分（总分还是采集的）；页面日期旁有灰色小字 "Sample review / 示例评价"。`--remove` 一键全删（新的 `DELETE /admin/reviews?source=demo`）。README 的从零步骤已加上。走查通过（订单 #17）。
- 2026-11-07：**顾客账户**（用户逐项确认）。决定：邮箱 + 密码（A；Vitacost 是邮件验证码，我们发不了邮件）；加"我的订阅"页但只显示（A；订阅是演示，没有暂停/取消按钮，页面写明）；登录前的订单不显示；没有"忘记密码"，个人资料里凭旧密码改密码。
  - 后端：新增 `POST /store/customers/me/password`（核对旧密码后 `updateProvider("emailpass")`，Medusa 自带的流程要发邮件）。
  - 商城：`src/lib/account/actions.ts`（server actions：signIn/signUp/signOut、getCustomer、updateProfile、changePassword、saveAddress/deleteAddress/setDefaultAddress、listOrders/getOrder、listSubscriptions、getCheckoutPrefill），JWT 存在 httpOnly cookie `freshshop_customer_token`（1 天）；`medusa()` 新增 `token` 参数。`session.ts` 的 `requireCustomer(next)` 没登录就跳到 `/account/login?next=…`，登录后跳回。
  - 页面：`/account/login`（登录/注册两个标签）、`/account/(member)/`：orders、orders/[id]、subscriptions、addresses、profile（左侧菜单 + 退出登录）。`/account` 跳到 orders。别人的订单显示 404 页。
  - 头部：登录后图标旁显示 "Hi, 名字"（`account-link.tsx`，放在 Suspense 里）。页脚 Account Login → /account/login，Order History → /account/orders；删掉了 pages.ts 里的 account、orders 占位页。
  - 结账：登录时 `placeOrder` 先 `POST /store/carts/:id/customer` 把购物车转给顾客；结账页自动填邮箱、电话（地址没有就用资料里的）、名字和默认地址（国家和当前语言的配送国一致时），顶部显示"已登录：邮箱"，没登录显示"有账户？登录"。
  - 验证：注册、密码错误、短密码、地址增删改设默认、改资料、改密码（旧密码错/对）、退出、受保护页跳转并跳回、登录下单（订单 FR-00019 出现在订单和订阅里）、中文版、别人订单 404；原来的游客走查也通过（订单 #20）。注意：后台进程要用 run_in_background 启动，普通 `&` 启动的会被收掉。
- 2026-11-08：**从零 clone 测试通过**（用户要求）。在 `/home/user/fresh-test/` clone `metagenics`（`84bad95`），严格按 README：后端 `pnpm install` → `setup:local` → `start:local`；`import:metagenics`（229 个新建）、`import:reviews`（20 条）、`import:demo-reviews`（1292 条）、`verify-metagenics.mjs` 输出 OK；商城 `pnpm install` → `pnpm dev`。游客走查通过（订单 FR-00001），账户全流程测试通过（FR-00002），首页/列表/详情/评论截图和原环境一致、没有坏图，dev 日志没有警告（只有测试浏览器提前离开页面造成的 2 条 ECONNRESET，无害）。
  - **云端测试的坑**（和仓库无关）：第一次 clone 到 scratchpad（`/tmp/claude-0/...`，权限 700），`setup:local` 报 `spawn initdb EACCES`。原因：云端以 root 运行，脚本改用 `postgres` 用户启动数据库，而它进不了 700 的目录。clone 到 `/home/user/...` 就正常。普通用户电脑上不会遇到。
- 2026-11-08：**列表页加回"网格 / 列表"切换**（用户先看了效果图再同意）。排序右边一条细竖线后面两个 18px 图标，当前的是品牌绿。列表视图每个商品一行：170px 图 | 系列名、16px 半粗标题、星级、两行简介、"剂型 | 全部规格" | 20px 价格、绿色"订阅最多省 X%"、同样的 Add to cart。写在网址 `?view=list`，翻页、筛选、排序都保留；一行行出现的规则不变（8 → 每次 4 → 24 后页码）。代码：`collection-card.tsx` 的 `CollectionRow`（和卡片共用星级、价格、按钮），`collection-toolbar.tsx` 的 `ViewSwitch`，`RevealGrid` 的 `layout`。旧的 `catalog/filter-bar.tsx` 里没用的 `ViewToggle` 删掉了。
