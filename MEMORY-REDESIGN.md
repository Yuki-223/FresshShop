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
  - 下一步：首页的其他部分（横幅、圆形分类、商品行）。要先和用户讨论。
