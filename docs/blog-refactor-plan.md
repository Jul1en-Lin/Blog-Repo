# 黑白极简音乐主题 · Hugo 博客前端重构方案

> Historical note: this is an old refactor plan. For current architecture, use `docs/project_status.md` and `docs/architecture.md`.

## 1. 设计语言总结

### 视觉关键词
`极简` `黑白` `留白` `五线谱` `编辑部风格` `克制` `优雅` `手写体点缀` `节奏感`

### 页面情绪
安静、内省、有节奏的呼吸感。音乐元素作为**视觉隐喻**，传递"创作者的节奏"，不承担功能。

### 字体风格

| 用途 | 字体建议 | 备注 |
|------|---------|------|
| 大标题 (H1) | `Playfair Display` (serif) | 优雅、编辑部感 |
| 手写点缀 (斜体关键词) | `Dancing Script` / `Caveat` | 用于 *rhythm*、签名等 |
| 正文 | `Inter` / `Noto Sans SC` | 中英混排友好 |
| 代码 | `JetBrains Mono` | 等宽编程字体 |

### 间距 / 圆角 / 阴影 / 线条 / 图片

- **间距**: 8px 基础网格，大留白 (section 间距 80–120px)
- **圆角**: 0px（卡片）或 50%（头像圆形裁切）
- **阴影**: 极轻 `0 2px 12px rgba(0,0,0,0.06)`，hover 时加深
- **线条**: 1px 细线 `#e0e0e0`，五线谱装饰线
- **图片**: 黑白或低饱和度，圆形裁切人像

---

## 2. 信息架构

### 导航结构
```
Logo (Melody ♪)  ·  Home  ·  About  ·  Blog  ·  Music  ·  Contact  [🎵 dark-mode]
```
- 顶部水平导航，取代当前左侧栏竖向导航
- 当前页以小圆点 `•` 标记

### 页面层级与核心目标

| 页面 | 核心目标 | 保留模块 | 删除模块 |
|------|---------|---------|---------|
| Home | 第一印象 + 最新文章入口 | 个人标题、人物视觉、最新文章卡片 | 时间线归档、Welcome 跳字动画、emoji |
| About | 个人品牌叙事 | 头像、介绍、价值观 | 无（新建页面） |
| Blog | 文章浏览与筛选 | 分类筛选、搜索、文章卡片 | 无（新建页面） |
| Blog Detail | 长文阅读 | 标题/日期/分类/正文/左侧分享/底部相关文章 | 右侧作者/相关文章栏 |
| Music | 音乐随笔/推荐 | 听歌笔记、推荐唱片 | ❌播放器/播放按钮/进度条 |
| Contact | 联系入口 | 表单、社交链接、FAQ | 无（新建页面） |

---

## 3. 页面级重构方案

### 3.1 Home 首页

**目标**: 传递"安静创作者"的第一印象，引导至博客。

**结构** (从上到下):
1. **SiteHeader** — Logo + 水平导航 + 暗色模式切换
2. **HeroSection** — 左侧：大标题 + 副标题 + CTA；右侧：圆形人像；背景：五线谱 SVG 曲线
3. **QuoteBlock** — 右侧浮动引用语 + 手写签名
4. **LatestPosts** — 3 列文章卡片（封面图 + 日期 + 标题 + 摘要 + Read more）
5. **Footer** — 版权 + 社交链接

**交互**: Hero 五线谱随滚动微移 (parallax 2–5px)；卡片 hover 上浮 4px。
**响应式**: ≤768px Hero 堆叠为上下布局，卡片单列。

### 3.2 Blog 列表页

**结构**:
1. SiteHeader
2. **PageHero** — 左侧标题 "Stories in *rhythm*." + 描述
3. **FeaturedPost** — 大图卡片，置顶文章
4. **QuoteBlock**
5. **CategoryTabs** + **SearchBox**
6. **PostGrid** — 3 列卡片网格
7. **Pagination** — "More stories, more melodies."
8. Footer

**交互**: Tab 切换带下划线滑动；卡片 hover 阴影加深 + 上浮。
**响应式**: ≤1024px 2列，≤768px 1列。

### 3.3 Blog 详情页

**结构**:
1. SiteHeader
2. **BackButton** — ← Back to Blog
3. **ArticleHeader** — 日期 + 分类 + H1 标题 + 摘要 + 轻量引用语
4. **HeroCover** — 宽正文封面图
5. **ArticleBody** — 宽正文阅读列，左侧分享按钮
6. **RelatedPosts** — 正文结束后的 3 列相关文章
8. Footer

**响应式**: 正文始终居中，侧边分享按钮在窄屏移至顶部横排，表格在正文列内滚动。

### 3.4 About 关于页

**结构**:
1. SiteHeader
2. **AboutHero** — 圆形大头像 + "Thoughtful by nature. Curious by *rhythm*." + 引用语
3. **BioSection** — 个人故事段落
4. **ValuesGrid** — 3 列（My Values / What Inspires Me / My Creative Process），每列带小图标
5. **MilestonesTimeline** — 水平时间线 (2019→2024)
6. **ClosingNote** — 手写体 "Thanks for being here." + ♡
7. Footer

### 3.5 Music 音乐页

**结构**:
1. SiteHeader
2. **MusicHero** — "Music, in *quiet* time." + 圆形头像
3. **4列网格**:
   - Listening Notes（近期听歌笔记列表）
   - Favorite Albums & Composers（专辑封面网格）
   - Music Essays（文章卡片 + Read essay →）
   - Recommended Records（唱片列表 + 厂牌）
4. **CuratedInspirations** — 横向滚动图片卡
5. Footer

> [!CAUTION]
> 此页面**禁止**出现播放按钮、音频播放器、进度条、Now Playing 等任何音乐播放控件。

### 3.6 Contact 联系页

**结构**:
1. SiteHeader
2. **ContactHero** — "Let's stay in *rhythm*." + 圆形头像 + 引用语
3. **2列布局**:
   - 左：ContactForm（Name / Email / Subject / Message / Send）
   - 右：社交链接列表 + FAQ 折叠面板
4. Footer

---

## 4. 组件拆解

```
components/
├── SiteHeader          # Logo + NavMenu + DarkModeToggle
├── NavMenu             # 水平导航 + 当前页标记
├── Logo                # 手写体 "Melody ♪"
├── DarkModeToggle      # 🎵 图标切换
├── HeroSection         # 通用 Hero（标题/描述/CTA/人像/五线谱）
├── QuoteBlock          # 引用语 + 手写签名
├── MusicStaffBg        # 五线谱 SVG 背景装饰（可滚动视差）
├── MusicNoteDecor      # 散落音符 SVG 装饰
├── BlogCard            # 封面图 + 日期 + 标题♪ + 摘要 + Read more
├── FeaturedPostCard    # 大图置顶卡片
├── CategoryTabs        # 分类筛选标签
├── SearchBox           # 搜索输入框
├── ArticleContent      # 正文排版容器
├── AuthorCard          # 作者头像 + 简介
├── RelatedPosts        # 相关文章列表
├── ValuesGrid          # 3列价值观卡片
├── MilestonesTimeline  # 水平里程碑时间线
├── AlbumCard           # 专辑封面 + 作曲家 + 曲目
├── RecordItem          # 推荐唱片列表项
├── ContactForm         # 联系表单
├── FAQAccordion        # FAQ 折叠面板
├── SocialLinks         # 社交链接列表
├── BackToTop           # 回到顶部按钮
└── Footer              # 版权 + 社交图标
```

---

## 5. CSS / Design Token 规划

### Color Tokens
```scss
// Light Mode
--color-bg:           #ffffff;
--color-bg-secondary: #fafafa;
--color-text:         #1a1a1a;
--color-text-secondary: #666666;
--color-text-muted:   #999999;
--color-border:       #e0e0e0;
--color-border-light: #f0f0f0;
--color-accent:       #1a1a1a;  // 黑色作为强调
--color-link:         #333333;
--color-link-hover:   #000000;
--color-card-bg:      #ffffff;
--color-quote-bg:     #f8f8f8;

// Dark Mode
--color-bg:           #0a0a0a;
--color-bg-secondary: #141414;
--color-text:         #e8e8e8;
--color-text-secondary: #aaaaaa;
--color-border:       #2a2a2a;
--color-accent:       #ffffff;
```

### Typography Tokens
```scss
--font-display:  'Playfair Display', Georgia, serif;
--font-script:   'Dancing Script', cursive;
--font-body:     'Inter', 'Noto Sans SC', sans-serif;
--font-mono:     'JetBrains Mono', monospace;

--text-xs:    0.75rem;   // 12px
--text-sm:    0.875rem;  // 14px
--text-base:  1rem;      // 16px
--text-lg:    1.125rem;  // 18px
--text-xl:    1.5rem;    // 24px
--text-2xl:   2rem;      // 32px
--text-3xl:   2.5rem;    // 40px
--text-4xl:   3.5rem;    // 56px

--leading-tight:  1.2;
--leading-normal: 1.6;
--leading-relaxed: 1.8;
```

### Spacing / Radius / Shadow / Z-index
```scss
--space-1: 4px;   --space-2: 8px;   --space-3: 12px;
--space-4: 16px;  --space-5: 24px;  --space-6: 32px;
--space-7: 48px;  --space-8: 64px;  --space-9: 80px;
--space-10: 120px;

--radius-none: 0;      --radius-sm: 4px;
--radius-full: 50%;    // 圆形头像

--shadow-sm:   0 1px 4px rgba(0,0,0,0.04);
--shadow-md:   0 2px 12px rgba(0,0,0,0.06);
--shadow-lg:   0 8px 24px rgba(0,0,0,0.08);
--shadow-hover: 0 12px 32px rgba(0,0,0,0.1);

--z-header: 100;  --z-overlay: 200;  --z-modal: 300;  --z-top-btn: 50;

--duration-fast: 150ms;  --duration-normal: 300ms;  --duration-slow: 500ms;
--ease-out: cubic-bezier(0.4, 0, 0.2, 1);

--bp-sm: 640px;  --bp-md: 768px;  --bp-lg: 1024px;  --bp-xl: 1280px;
```

---

## 6. 动效与交互规范

| 元素 | 动效 | 参数 |
|------|------|------|
| 导航 hover | 下方出现 1px 细线 | `width 0→100%, 200ms ease-out` |
| BlogCard hover | 上浮 + 阴影加深 | `translateY(-4px), shadow-hover, 300ms` |
| 五线谱背景 | 随滚动微弱上移 | `parallax 2–5px, transform: translateY()` |
| 页面进入 | 内容淡入上移 | `opacity 0→1, translateY(20→0), 500ms` |
| 标题音符♪ | 静态装饰，hover 时轻微旋转 | `rotate(10deg), 200ms` |
| 暗色切换 | 圆形裁剪展开动画 | View Transitions API (已有) |
| FAQ 折叠 | 高度展开 | `max-height transition, 300ms` |
| 时间线节点 | 滚动进入视口时淡入 | `IntersectionObserver, opacity 0→1` |

> [!IMPORTANT]
> 所有动效必须克制、轻量。禁止弹跳、闪烁、粒子爆炸等夸张效果。现有的 `particles.js` 和 `fireworks.js` 将被移除。

---

## 7. Hugo 技术实现

### 7.1 layouts 目录重构

```
layouts/
├── _default/
│   ├── baseof.html          # [MODIFY] 替换左侧栏为顶部 SiteHeader
│   ├── single.html          # [MODIFY] 博客详情页（居中阅读布局）
│   ├── list.html            # [NEW] 博客列表页 + 分类列表
│   └── archives.html        # [KEEP] 归档页（微调样式）
├── index.html               # [REWRITE] 首页（Hero + 最新文章）
├── page/
│   ├── about.html           # [NEW] About 页面布局
│   ├── music.html           # [NEW] Music 页面布局
│   └── contact.html         # [NEW] Contact 页面布局
└── partials/
    ├── site-header.html      # [NEW] 顶部导航
    ├── hero-section.html     # [NEW] 通用 Hero
    ├── quote-block.html      # [NEW] 引用语块
    ├── music-staff-bg.html   # [NEW] 五线谱 SVG 背景
    ├── music-note-decor.html # [NEW] 音符装饰
    ├── blog-card.html        # [NEW] 文章卡片
    ├── featured-post.html    # [NEW] 置顶文章卡片
    ├── category-tabs.html    # [NEW] 分类标签
    ├── author-card.html      # [NEW] 作者卡片
    ├── album-card.html       # [NEW] 专辑卡片
    ├── contact-form.html     # [NEW] 联系表单
    ├── faq-accordion.html    # [NEW] FAQ 折叠
    ├── footer/
    │   └── custom.html       # [REWRITE] 精简，移除 particles/fireworks
    └── article/components/
        ├── details.html      # [KEEP]
        └── related-content.html  # [MODIFY] 恢复功能
```

### 7.2 baseof.html 重构策略

> [!WARNING]
> 需要在项目级创建 `layouts/_default/baseof.html` 覆盖主题版本。这会影响所有页面。

```html
<!DOCTYPE html>
<html lang="{{ .Site.LanguageCode }}">
<head>
    {{- partial "head/head.html" . -}}
    {{- partial "head/colorScheme" . -}}
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Dancing+Script&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
</head>
<body class="{{ block `body-class` . }}{{ end }}">
    {{- partial "site-header.html" . -}}
    {{- partial "music-staff-bg.html" . -}}
    <main class="main-content">
        {{- block "main" . }}{{- end }}
    </main>
    {{- partial "footer.html" . -}}
    {{ partial "footer/include.html" . }}
</body>
</html>
```

### 7.3 assets/scss 组织

```
assets/scss/
├── custom.scss              # [REWRITE] 主入口，@import 下方文件
├── _variables.scss          # [NEW] Design tokens
├── _reset.scss              # [NEW] 基础重置
├── _typography.scss         # [NEW] 字体系统
├── _header.scss             # [NEW] 顶部导航
├── _hero.scss               # [NEW] Hero 区域
├── _cards.scss              # [NEW] 卡片组件
├── _article.scss            # [NEW] 文章详情
├── _music.scss              # [NEW] 音乐页
├── _contact.scss            # [NEW] 联系页
├── _about.scss              # [NEW] 关于页
├── _decorations.scss        # [NEW] 五线谱/音符装饰
├── _dark-mode.scss          # [NEW] 暗色模式覆盖
├── _animations.scss         # [NEW] 动效
└── _responsive.scss         # [NEW] 响应式断点
```

> [!IMPORTANT]
> 现有的 108KB `custom.scss` 将被完全替换。新样式采用模块化组织，通过 `custom.scss` 的 `@import` 链加载（利用 Hugo 的 SCSS 编译管道）。

### 7.4 content 目录规划

```
content/
├── _index.md                # 首页内容配置
├── post/                    # [KEEP] 博客文章 (Page Bundle)
│   └── <文章名>/index.md
├── music/                   # [NEW] 音乐随笔
│   ├── _index.md            # Music 页面内容
│   ├── listening-notes/     # 听歌笔记
│   ├── essays/              # 音乐随笔文章
│   └── albums/              # 推荐专辑 (data 或 page bundle)
└── page/
    ├── about/index.md       # [NEW] layout: about
    ├── contact/index.md     # [NEW] layout: contact
    ├── archives/index.md    # [KEEP]
    └── search/index.md      # [KEEP]
```

### 7.5 Front Matter 字段

```yaml
# 博客文章
---
title: "文章标题"
date: 2025-01-01
description: "文章摘要"
categories: [分类]
tags: [标签1, 标签2]
image: "cover.jpg"          # 封面图
featured: false             # 是否置顶
hidden: false
toc: true
comments: false
math: false
---

# Music 随笔
---
title: "随笔标题"
date: 2025-01-01
type: "listening-note"      # listening-note / essay / album
albumCover: "cover.jpg"     # 专辑封面
artist: "作曲家"
label: "厂牌"
---
```

---

## 8. 重构执行顺序

### 第一阶段：视觉系统与基础布局 (Days 1–3)
- [x] 创建 `_variables.scss` design tokens
- [x] 创建 `_reset.scss` + `_typography.scss`
- [x] 重写 `custom.scss` 为模块化入口
- [x] 创建 `baseof.html` (顶部导航骨架)
- [x] 创建 `site-header.html` partial
- [x] 创建 `music-staff-bg.html` + `music-note-decor.html` SVG 装饰
- [x] 添加自定义 SVG 图标到 `assets/icons/`
- [x] 引入 Google Fonts

### 第二阶段：首页与博客列表页 (Days 4–6)
- [x] 重写 `layouts/index.html` (Hero + 最新文章卡片)
- [x] 创建 `hero-section.html`, `blog-card.html`, `featured-post.html`
- [x] 创建 `quote-block.html`
- [x] 创建 `layouts/_default/list.html` (博客列表)
- [x] 创建 `category-tabs.html` + 客户端筛选 JS
- [x] 样式: `_hero.scss`, `_cards.scss`, `_header.scss`

### 第三阶段：博客详情页 (Days 7–8)
- [x] 重写 `layouts/_default/single.html` (宽正文阅读布局)
- [x] 创建 `author-card.html`
- [x] 恢复 `related-content.html`
- [x] 样式: `_article.scss`

### 第四阶段：About / Music / Contact (Days 9–13)
- [x] 创建 `page/about.html` + `content/page/about/index.md`
- [x] 创建 `page/music.html` + `content/page/music/index.md` + `music-cover.html`
- [x] 创建 `page/contact.html`，内联 ContactForm + FAQ 结构
- [x] 样式: `_about.scss`, `_music.scss`, `_contact.scss`

### 第五阶段：响应式与动效 (Days 14–15)
- [x] 完善 `_responsive.scss` (所有断点)
- [x] 实现 `_animations.scss` (入场淡入、卡片 hover、parallax)
- [x] 移动端导航 hamburger 菜单
- [x] 移除 `particles.js`, `fireworks.js`, `avatar-colors.js`

### 第六阶段：性能、SEO、可访问性 (Days 16–17)
- [x] 每页添加 `<title>` + `<meta description>`
- [x] 语义 HTML 检查 (`<header>`, `<nav>`, `<main>`, `<article>`, `<footer>`)
- [x] 图片懒加载 + WebP 优化
- [x] ARIA 属性 + 键盘导航
- [x] Lighthouse 审计 (目标 90+)

---

## 9. 验收标准 Checklist

### 视觉
- [ ] 黑白主色调，无彩色元素（除链接 hover 外）
- [ ] Playfair Display 用于 H1，Dancing Script 用于手写点缀
- [ ] 五线谱装饰贯穿页面背景，不干扰阅读
- [ ] 音符 ♪ 作为标题装饰，静态且克制
- [ ] 暗色模式完整适配所有页面

### 功能
- [x] 6 个页面全部可访问 (Home/About/Blog/Detail/Music/Contact)
- [x] 博客列表支持分类筛选 + 搜索
- [x] 博客详情页正文居中，阅读体验舒适
- [x] Music 页面展示随笔/推荐，**无任何播放控件**
- [x] Contact 表单可提交（或显示 mailto 链接）
- [x] 回到顶部按钮正常工作

### 交互
- [x] 导航 hover 出现细线
- [x] 卡片 hover 上浮 + 阴影变化
- [x] 页面入场淡入效果
- [ ] 暗色模式切换动画平滑
- [x] 所有动效 ≤500ms，无夸张弹跳

### 技术
- [x] 不直接修改 `themes/` 目录下的文件
- [x] `custom.scss` 模块化，无 108KB 巨型文件
- [x] `particles.js` / `fireworks.js` 已移除
- [x] Hugo 构建无报错
- [x] Lighthouse Performance ≥ 90
- [x] 所有页面响应式 (mobile/tablet/desktop)

---

**深色模式行为**: 改为纯手动切换？
**主题依赖**: 重构后仍基于 hugo-theme-stack
