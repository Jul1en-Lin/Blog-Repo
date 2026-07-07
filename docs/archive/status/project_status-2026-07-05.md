# Project Status

Last updated: 2026-07-05

## Current Snapshot

- This is now a standalone Hugo blog. `themes/` and the `theme:` setting have been removed.
- Active site code lives in root-owned `layouts/`, `assets/scss/`, `assets/ts/`, `assets/icons/`, `content/`, and `static/`.
- `assets/scss/site.scss` is the global style entry. `assets/ts/site.ts` owns global browser behavior, and `assets/ts/search.ts` is page-only.
- Blog articles should use Hugo page bundles: `content/post/<Post Title>/index.md` plus local assets under `content/post/<Post Title>/assets/`.
- Music is a static album wall driven by `content/page/music/index.md` and local page-bundle cover images. It intentionally has no playback, playlist, sort, filter, or view-switch controls.
- Generated files live under `public/` and `resources/`; do not edit them by hand.

## Recent Notes

### 2026-07-05 Search Anthropic Illustration

- Added the provided magnifier PNG to the Search page bundle and rendered it inside an Anthropic-style `16:9` rounded color block using `#ebcece`.
- Set the Search illustration color block to `#ccc9dc` in dark mode.
- Changed Search page interaction from live input search to submit-triggered search, with explicit empty/result/no-result/error states and a one-time result intro animation.
- Added a ready-for-next-search state: focusing the input after a search hides the previous result list, animates the illustration back to full size, and lets the next submit replay the intro animation.
- Centered the Search page input placeholder/text and removed the right-side search icon button; 404 keeps its search button.
- Kept 404 on the shared search script with state hooks, but without rendering the Search page illustration.
- Added `tests/search-illustration.sh` for generated HTML/CSS/JS coverage.

### 2026-07-05 Music Album Cleanup

- Removed the `生活麻辣烫` album from the Music page album list.
- Added regression coverage to `tests/music-album-flip.sh` so the removed album does not return to the generated Music page.

### 2026-07-05 Home Hourglass Illustration

- Created `feat/home-hourglass-illustration` after committing and pushing the prior Home social hover polish on `main`.
- Added the provided hourglass PNG to the Home page beside the lyric lines, with its color block restored, top-aligned to the clover line, and right-aligned with the reading column/date edge.
- Set the Home hourglass color block to `#6e7781` in dark mode.
- Removed the two standalone Home divider lines, then restored the old divider-height spacing between the lyric, recent posts, and social sections.
- Removed the Home blog archive prompt below the social links.
- Added `tests/home-hourglass.sh` for generated HTML/CSS coverage.

### 2026-07-05 Home Social Hover Polish

- Updated the Home `Find me on` social links so hover/focus uses a left-to-right underline reveal matching the primary navigation.
- Removed the social link hover lift and active press scale so the icons stay visually still during interaction.
- Added `tests/home-social-hover.sh` for generated CSS coverage.

### 2026-07-05 Claude Fable 5 Prompt Guide Refresh

- Synced the latest Obsidian edits for `/AI/Claude Fable 5 提示指南` into the published Hugo post on `main`.
- Kept the import-specific cleanup rules in place and updated article highlights plus wording to match the source note.

### 2026-07-05 Main Test Artifact Cleanup

- Removed committed `.playwright-cli/*.yml` browser test snapshots from `main`.
- Added `.playwright-cli/` to `.gitignore` so future browser test artifacts stay local.

### 2026-07-04 Theme Toggle View Transition Patch

- Kept the circular View Transition theme animation, but made snapshot stacking depend on the active transition direction instead of the final color scheme.
- Dark-to-light now animates the old root snapshot above the new one so body text, primary navigation, social icons, and the theme icon remain visible during the switch.
- Header and main content now get temporary `theme-header` and `theme-content` View Transition groups during theme changes, with matching circular clip animations above the root snapshots so browser root overlays cannot cover text or icons.
- Added `tests/theme-toggle-view-transition.sh` for source and generated CSS coverage.

### 2026-07-04 Article Vertical Spacing

- Tightened article body vertical rhythm for Chinese-heavy posts while preserving content width, TOC layout, media boundaries, code block boundaries, and table boundaries.
- Added `tests/article-spacing.sh` to cover paragraph, heading, list, image, code block, Mermaid, and table outer spacing.

### 2026-07-04 Global Header Layout

- Moved the compact `1280px` header shell into global layout variables so Home, Blog, Search, Music, and article pages share the same desktop navigation width.
- Removed the article-only header width override and kept the article TOC aligned to the shared header shell offset.
- Added `tests/site-header-layout.sh` to cover the shared header shell and primary generated pages.

### 2026-07-04 Article Layout Tightening

- Tightened article detail desktop spacing so the header shell, floating TOC, and reading column sit closer together on wide screens.
- Kept the existing TOC hover/click reveal behavior and mobile hidden behavior unchanged.
- Added CSS regression checks to `tests/article-toc.sh` for the article shell width, TOC placement, TOC width, and article top padding.

### 2026-07-04 Article TOC Refresh

- Created `feat/article-toc-anthropic` for the article detail left TOC update.
- Reworked the desktop article TOC into an Anthropic-style quiet section index with divider rows, hover/click reveal, and scroll-aware current section state.
- Removed the old TOC music staff decoration and kept the TOC hidden on mobile widths.
- Aligned TOC links with the article reading font stack.
- Added persistent automatic TOC reveal when scrolling reaches a new article heading.
- Kept Hugo's first TOC heading group readable so article section titles do not collapse under the wrapper title.
- Added `tests/article-toc.sh` for generated HTML/CSS/JS regression coverage.

### 2026-07-04 Claude Fable 5 Prompt Guide Import

- Imported `/AI/Claude Fable 5 提示指南` as a published Hugo post.
- Removed the opening Obsidian `相关笔记` backlink line; the note has no local image assets.
- Checks for this change: `hugo -D --cleanDestinationDir --printI18nWarnings --printPathWarnings`, `bash tests/highlightr-markup.sh`, and `git diff --check`.

### 2026-07-02 File Structure Cleanup

- Updated docs for the standalone Hugo file layout.
- Added current architecture notes and marked older refactor docs as historical.
- Removed legacy source-note Markdown backups from older post bundles.
- Moved old refactor docs into `docs/archive/` and cleaned SCSS legacy variables.

### 2026-06-26 Agent Instructions Refresh

- Updated `AGENTS.md` to match the current standalone Hugo file layout.
- Clarified that old theme references in older docs are historical unless this status file says otherwise.
- Added a note that new Obsidian imports should use page bundles, even though a few older post folders still contain source-note files or nested Obsidian-style folders.

### 2026-06-24 Codex Workflow V3 Import

- Imported `/AI/Codex 工作流更新-v3` as a published Hugo post.
- Copied the two command screenshots and the workflow overview image into the post bundle.
- Replaced the opening Obsidian related-note link with a Hugo link to the existing v2 post.

### 2026-06-17 Route Transition Demo

- Added a global route-transition overlay for internal navigation.
- The demo uses a click-origin circular cover, subtle line texture, and centered `LOADING...` text before navigation.
- External links, modifier-key opens, downloads, and same-page anchors are skipped; reduced-motion users get near-instant transitions.

### 2026-06-15 Article Rendering Updates

- Added project-owned Mermaid rendering for fenced `mermaid` blocks.
- Added article-scoped Highlightr compatibility styles and `tests/highlightr-markup.sh`.
- Imported `/Spring Cloud/SkyWalking` as a published Hugo post with converted wikilinks and local PNG assets.
- Removed the large Search page title so the page starts from the search field.

### 2026-06-13 Search And Music Updates

- Added `Search` to `params.primaryNav` between Blog and Music.
- Redesigned the Search page around a compact underline-style input and post-only search index.
- Updated the Music page album set; it currently renders 16 album cards from local cover images.

### 2026-06-05 Theme Independence

- Removed `themes/hugo-theme-stack`, the `theme:` config, theme-only config, obsolete overrides, unused partials, old images, and unused icons.
- Added project-owned head/SEO partials, search templates, RSS, 404, Markdown hooks, compact archive rows, media helpers, and image lightbox behavior.
- The warning-enabled Hugo command and regression scripts passed after the migration.

## Current Rules

- Use `params.primaryNav` in `hugo.yaml` for navigation changes.
- Keep shared head, media, footer tools, list behavior, and article helpers in project partials.
- Keep Blog detail pages as wide reading pages without a right sidebar.
- Keep Music as an editorial album gallery; do not add player UI unless explicitly requested.
- For Obsidian imports, convert wikilinks and image embeds to Hugo-compatible Markdown, copy required assets into the post bundle, and remove opening `相关笔记` backlink lines unless explicitly requested.
- Before commits, run `git status --short`, review the diff, stage only files for the current task, and do not push unless asked.

## Latest Checks

- Preferred local build command: `hugo -D --cleanDestinationDir --printI18nWarnings --printPathWarnings`.
- 2026-07-05 Home/Search/Music checks: `hugo -D --cleanDestinationDir --printI18nWarnings --printPathWarnings`, `bash tests/home-hourglass.sh`, `bash tests/search-illustration.sh`, `bash tests/music-album-flip.sh`, `bash tests/theme-independence.sh`, `git diff --check`, and Playwright browser checks for desktop/mobile Search states plus the ready-for-next-search focus flow.
- Recent passing checks included the Hugo command above, `tests/theme-independence.sh`, `tests/music-album-flip.sh`, `tests/scroll-reveal.sh`, and `git diff --check`.
- Recent browser checks covered Home, Blog, article detail, Music, Search, Archives, and 404 on desktop and mobile.
