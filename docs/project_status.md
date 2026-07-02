# Project Status

Last updated: 2026-06-26

## Current Snapshot

- This is now a standalone Hugo blog. `themes/` and the `theme:` setting have been removed.
- Active site code lives in root-owned `layouts/`, `assets/scss/`, `assets/ts/`, `assets/icons/`, `content/`, and `static/`.
- `assets/scss/site.scss` is the global style entry. `assets/ts/site.ts` owns global browser behavior, and `assets/ts/search.ts` is page-only.
- Blog articles should use Hugo page bundles: `content/post/<Post Title>/index.md` plus local assets under `content/post/<Post Title>/assets/`.
- Music is a static album wall driven by `content/page/music/index.md` and local page-bundle cover images. It intentionally has no playback, playlist, sort, filter, or view-switch controls.
- Generated files live under `public/` and `resources/`; do not edit them by hand.

## Recent Notes

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
- Recent passing checks included the Hugo command above, `tests/theme-independence.sh`, `tests/music-album-flip.sh`, `tests/scroll-reveal.sh`, and `git diff --check`.
- Recent browser checks covered Home, Blog, article detail, Music, Search, Archives, and 404 on desktop and mobile.
