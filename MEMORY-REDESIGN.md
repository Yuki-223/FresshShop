# MEMORY-REDESIGN.md — 首页改造（参考 Vitacost 布局）

> 这是"改造"专用的记忆文件，和 `MEMORY.md`（项目从头到现在的总记录）分开。新对话先读 `MEMORY.md` 了解项目，再读这份了解改造进度。
> 分支：`metagenics`（保健品版）。只改英文界面，中文暂时不管。

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
- **中文先不管**，以后再考虑中文标题要不要用思源宋体。

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

### 第 3 步：圆形分类（"Explore More"）+ 商品行（🗣 讨论中，还没动代码）

**新对话从这里接着讨论。** 规矩不变：一次只问一个问题，讨论完写进这里，用户说"开始"才动手。

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
  - 图片在 `public/home-products/<slug>.jpg`（从 Shopify CDN 下载，`?width=600`，一共 2.3MB）。
  - 对照表 `src/lib/data/metagenics/home-images.json` 的格式是 `{slug: {image, vitacost: 对应的 Vitacost 标题}}`。
  - 首页 `page.tsx` 的 `withHomeImage()` 只在首页把 `product.image` 换掉；商品页、分类页、购物车都不受影响。
- 验证结果：60 个图片地址都能打开；没翻页的卡片图片是延迟加载，翻页后全部加载完成；控制台没有报错。

#### 之后还要讨论的（按顺序，一个一个问）
1. ~~圆形分类的文字~~ ✅
2. ~~商品行放什么~~ ✅（上面）
3. ~~商品行的图片~~ ✅（下面"首页商品图"一节）
2. 商品行：放几行、每行标题和放什么商品（Vitacost 是 "Vitacost Best Sellers"、"California Gold Nutrition Favorites"、"Sport Supplements"、"Trending Products"，背景白色和浅绿色交替）。对应到我们，可以是评价最多、某个产品系列精选（如 UltraFlora）、运动、评分最高等。
3. 商品行的图片：是否换成 Vitacost 上 Metagenics 商品的干净图？怎么匹配（按商品名）？匹配不上的怎么办？只换首页，还是全站都换？
4. 商品卡片上的"+"一键加购：有多个规格的商品，点"+"加哪个规格（比如默认规格、单次购买）？
5. 首页区块标题对齐 Vitacost：Roboto Slab 24px 700（现在是 18px semibold）。
6. 首页上现有的其他区块（Most reviewed、Top rated 侧栏 + 网格、Shop by health goal、组合优惠、睡眠类）保留哪些、换掉哪些。
7. 页脚改不改。

#### 环境提醒
- 2026-11-04 后端在后台跑满 2 小时，被系统停掉了。数据还在数据库文件里。继续工作前先启动：`cd backend && pnpm start:local`（放在后台运行，等 `/health` 返回 OK），然后在根目录 `pnpm build && pnpm start`（或 `pnpm dev`）。

### 以后的步骤（还没讨论细节）
- 首页其他部分：大横幅轮播（图片从哪里来还要决定）、圆形分类（8 个分组）、可滑动的商品行加"+"一键加购（多规格商品点"+"加哪个规格还要决定）、页脚改不改。
- 真正的账户页。
- 中文界面的字体。

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
- 2026-11-05：**首页商品图换成 Vitacost 的干净图**（只换首页，44/52 个）。全站的图以后由用户导入数据库。下一步：讨论列表第 4 项起（"+"规格已经按默认处理了，可以跳过，直接问标题样式、页脚）。
