# 执行前审查报告

生成时间：2026-05-03

本报告基于当前仓库结构、`AGENTS.md`、`docs/blog-refactor-plan.md`、Hugo 配置、项目级 layouts/assets/content 覆盖情况整理。审查阶段未修改代码、未创建运行时产物、未执行重构。

## 1. 当前项目技术栈判断

当前项目是 Hugo 静态博客项目，根配置为 `hugo.yaml`。

- Hugo 版本：`v0.152.2 extended`
- 主题：`hugo-theme-stack`
- 主题版本：从主题 footer 判断为 `3.32.0`
- 内容语言：默认 `zh-cn`
- 样式管线：Hugo Pipes 编译 `themes/hugo-theme-stack/assets/scss/style.scss`，最后导入项目级 `assets/scss/custom.scss`
- 主题脚本：Stack 主题通过 Hugo Pipes 构建 `assets/ts/main.ts`
- 项目额外脚本：`static/js/particles.js`、`static/js/fireworks.js`、`static/js/avatar-colors.js`
- 部署：GitHub Actions 中使用 `hugo -D` 构建并部署到外部 Pages 仓库

没有发现 npm、Vite、React、Tailwind、PostCSS 等独立前端工程链。

## 2. 当前目录结构分析

根目录基本符合 Hugo 项目结构：

- `archetypes/`：内容模板
- `assets/`：Hugo Pipes 资源，包含 SCSS、图片、字体、图标
- `content/`：Markdown 内容
- `data/`：当前为空或未作为主要数据源使用
- `docs/`：重构规划文档
- `i18n/`：项目级国际化目录
- `layouts/`：项目级模板覆盖
- `static/`：直接复制到站点根目录的静态资源
- `themes/hugo-theme-stack/`：Stack 主题源码
- `public/`、`resources/`：生成产物，已在 `.gitignore` 中忽略

项目当前主要通过根目录 `layouts/` 和 `assets/scss/custom.scss` 覆盖 Stack 主题，而不是直接修改主题目录。

## 3. Hugo layouts / partials / assets / content 现状

### layouts

项目级 `layouts/` 当前覆盖文件较少：

- `layouts/index.html`
- `layouts/_default/single.html`
- `layouts/_default/archives.html`
- `layouts/partials/article/components/details.html`
- `layouts/partials/article/components/related-content.html`
- `layouts/partials/footer/custom.html`
- `layouts/partials/widget/toc.html`

项目级尚未创建 `layouts/_default/baseof.html`，因此当前全站骨架仍来自 Stack 主题，包含左侧 sidebar、主题默认 main container、footer include 管线。

### partials

当前项目级 partial 主要用于：

- 文章 metadata details 增加 lastmod
- 禁用 related-content
- 自定义 TOC 图标
- 在 footer/custom 中注入大量 CSS/JS 与回到顶部按钮

还没有新重构方案要求的 `site-header.html`、`hero-section.html`、`music-staff-bg.html`、`blog-card.html` 等组件。

### assets

`assets/scss/custom.scss` 是当前样式主覆盖文件，大小约 108KB，包含：

- 代码块高亮与滚动条覆盖
- Stack 文章列表卡片样式覆盖
- sidebar / menu / widget / TOC 样式
- Welcome 跳字动画
- 粒子与礼花相关样式
- 归档页时间线
- 暗色模式与 View Transitions
- 当前 editorial 文章详情页样式

`assets/scss/menu-interactions.scss` 存在但未确认被主入口引用。

`assets/img/` 中有头像和个人图片；`assets/background/` 与 `static/background/` 都存在大图背景资源；`assets/icons/` 与 `static/icons/` 各有部分图标。

### content

当前内容目录只有：

- `content/_index.md`
- `content/_index.zh-cn.md`
- `content/categories/`
- `content/page/archives/`
- `content/page/search/`
- `content/post/`

`content/post/` 下有 22 个文章目录，多数为 page bundle。部分目录同时保留 `index.md` 与同名原始 Markdown 文件。

尚无：

- `content/page/about/`
- `content/music/`
- `content/page/contact/`

## 4. 已存在页面与需要新增或重构的页面

已存在但需要重构：

- Home `/`：当前是 Welcome 跳字动画 + 年份归档列表，需要重构为 Hero + 最新文章入口。
- Blog detail `/p/:slug/`：当前是 editorial 双栏，需要改为居中阅读布局。
- Blog section `/post/`：由主题默认 list 生成，需要新增或覆盖为正式 Blog 列表页。
- Archives `/archives/`：已存在，可保留并微调样式。
- Search `/search/`：已存在，可保留或后续样式统一。
- Categories `/categories/`：已存在，可保留或后续纳入 Blog 筛选体系。

需要新增：

- About `/about/`
- Music `/music/`
- Contact `/contact/`

Music 页面必须保持“音乐作为视觉语言”，禁止播放器、播放按钮、进度条、Now Playing、播放列表模块等播放功能。

## 5. 当前 CSS / SCSS / JS 组织方式

当前 CSS 是集中式覆盖：`custom.scss` 作为巨大补丁文件接在主题样式之后，模块边界不清晰。

主要问题：

- design tokens 缺失
- 多处硬编码颜色、尺寸、阴影
- 多处 `!important`
- sidebar、文章列表、归档、文章详情、代码块、动画、暗色模式混在一起
- 当前视觉偏 Notion / 米色 / 彩色动效，与黑白极简编辑部方向不一致

当前 JS 组织：

- 主题 TS：`themes/hugo-theme-stack/assets/ts/main.ts`
- 项目 JS：`static/js/particles.js`、`fireworks.js`、`avatar-colors.js`
- 大量 inline script 位于 `layouts/partials/footer/custom.html`

粒子、礼花和头像取色光晕与新目标冲突，应逐步移除或停止加载。

## 6. 重构风险点

1. 新增项目级 `layouts/_default/baseof.html` 会影响全站所有页面，需要保留主题的 head、footer include、主题 JS、PhotoSwipe、暗色模式初始化。
2. 直接替换 `custom.scss` 会影响文章列表、代码块、TOC、归档页、文章详情页和暗色模式，需要保留过渡桥接样式。
3. 当前 `footer/custom.html` 依赖旧 sidebar DOM 计算回到顶部位置，切换顶部导航后必须重写。
4. 当前 header/nav 来自主题 sidebar，改为顶部导航后 `.Site.Menus.main`、旧 hamburger、暗色模式按钮绑定方式都要重新确认。
5. 多数文章缺少 `image`、`description`、`featured` 等字段，新卡片组件必须设计 fallback。
6. GitHub Actions 使用 `hugo -D`，draft 文章会参与构建和部署，首页/列表逻辑需要明确是否展示 draft。
7. 当前 `related-content.html` 被项目级 partial 禁用，后续恢复相关文章时需要删除或重写该覆盖。
8. About / Music / Contact 目前无内容文件，导航若先出现这些入口，会出现阶段性 404，需要在项目状态文档记录。

## 7. 建议的阶段执行顺序

1. 基础视觉系统与全局骨架：design tokens、字体、顶部导航、全局容器、暗色模式、音乐装饰 partial、footer custom 清理。
2. 首页与 Blog 列表：重写首页，新增复用 Hero / BlogCard / QuoteBlock / FeaturedPost / CategoryTabs。
3. Blog 详情页：重写 single，恢复居中阅读、作者卡、相关文章、封面图。
4. About / Music / Contact：新增页面布局、内容骨架和对应样式模块。
5. 响应式与动效：完善移动端导航、入场动效、克制 parallax，停止加载旧粒子/礼花/头像取色。
6. 性能、SEO、可访问性：meta、语义结构、图片懒加载、ARIA、键盘导航、Lighthouse 与构建验证。

## 8. 第一阶段建议修改的文件清单

建议新增：

- `layouts/_default/baseof.html`
- `layouts/partials/site-header.html`
- `layouts/partials/music-staff-bg.html`
- `layouts/partials/music-note-decor.html`
- `layouts/partials/head/custom.html`
- `layouts/partials/footer/components/custom-font.html`
- `assets/scss/_variables.scss`
- `assets/scss/_reset.scss`
- `assets/scss/_typography.scss`
- `assets/scss/_header.scss`
- `assets/scss/_decorations.scss`
- `assets/scss/_dark-mode.scss`
- `assets/scss/_responsive.scss`
- `assets/scss/_legacy-bridge.scss`

建议修改：

- `assets/scss/custom.scss`
- `layouts/partials/footer/custom.html`
- `hugo.yaml`

建议第一阶段暂不重写：

- `layouts/index.html`
- `layouts/_default/single.html`
- `content/post/`

这些应放到第二、第三阶段处理，以降低全局骨架切换与页面级重构同时发生的风险。
