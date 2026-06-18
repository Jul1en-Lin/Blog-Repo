# Project Status

Last updated: 2026-06-18

## 2026-06-17 Route Transition Demo

- Added a global route-transition demo overlay for internal link navigation.
- The demo uses a click-origin circular cover, subtle line texture, and centered `LOADING...` text before normal multi-page navigation.
- The loading label uses the blog body font without the old white pill backdrop.
- The original demo timing and click-origin geometry have been restored.
- External links, modifier-key opens, downloads, and same-page anchors are skipped; reduced-motion users get near-instant transitions.
- Local Hugo build, route-transition regression script, and browser preview passed.

## 2026-06-15 SkyWalking Article Import

- Imported the Obsidian note `/Spring Cloud/SkyWalking` as a published Hugo post.
- Converted Obsidian wikilinks and image embeds to Hugo-compatible Markdown and copied the two referenced PNG assets into the page bundle.
- Kept the article in the microservices category with Spring Cloud and SkyWalking tags.

## 2026-06-15 Search Page Title Removal

- Removed the large `Search` hero title from the Search page so only the search field is shown.
- Replaced the removed heading reference with a section `aria-label` and tightened the page's top spacing.
- Local Hugo build and browser verification passed.

## 2026-06-15 Mermaid Rendering

- Added a project-level Hugo code-block hook so fenced `mermaid` blocks render as diagrams instead of highlighted source.
- Mermaid 11.15.0 loads from jsDelivr only on pages that contain diagrams and re-renders when the site color scheme changes.
- Diagram frames match the article image and table boundaries; mobile diagrams keep a readable intrinsic width inside a horizontally scrollable container.
- Added generated-site regression checks for the render hook, intrinsic sizing, and page-level script loading.

## 2026-06-15 Obsidian Highlightr Compatibility

- Fixed the Seata XA drawbacks label being parsed into the previous list item by restoring the missing Markdown boundary.
- Restored the Redis cache-avalanche inline Highlightr label and fixed another emphasis span whose Chinese punctuation caused Goldmark to emit literal `**`.
- Added article-scoped realistic Highlightr styling and the seven colors currently configured in Obsidian without importing plugin JavaScript or Obsidian-only selectors.
- Added `tests/highlightr-markup.sh` to reject standalone `hltr-*` labels without a preceding blank line; GitHub Actions runs it before deployment.
- Extended the generated-site regression check to verify the Seata label remains a standalone paragraph, recent articles contain no unparsed emphasis markers, source and rendered Highlightr counts match, and the compiled article styles include Highlightr support.

## 2026-06-13 Music Album Update

- Removed `Black Cab`, `すずめの戸締まり`, `劇場映画「秒速5センチメートル」-Soundtracks`, `Humble Swag GT Mixtape`, `乐透人生GT：即刻入戏`, `旷野`, `CHARLIE`, `THE PROTÉGÉ`, and `Starboy` from the Music page gallery.
- Added `Live Today` and `NANA I` by Nana Ou-Yang with local cover images.
- Added `네가 좋아 (Feat. 박원)` by Hello Ga-Young with its local cover image.
- The Music page now renders 16 album cards; removed cover files remain in the page bundle.

## 2026-06-13 Search Page Nav Entry and Redesign

- Added `Search` as a visible `primaryNav` entry in `hugo.yaml` between Blog and Music.
- Redesigned the search page template (`layouts/page/search.html`) with a centered editorial hero using the same large Playfair Display serif title pattern as Music.
- Search input is a compact underline-style field with editorial font; the underline animates left-to-right via `scaleX(0)→scaleX(1)` on focus, matching the Home page recently-written hover effect.
- Removed browser focus outline/box-shadow on the search input and WebKit search decoration chrome.
- Results use thin separator lines, serif titles at `1rem` that animate a smooth left-to-right underline on hover, and muted preview text (without horizontal page layout translation).
- Restored standalone `.back-to-top` and `.not-found-card` base styles that were previously in shared selectors with the old search form.
- Search index correctly filters to `mainSections: post` only; emoji-prefixed posts and code-heavy articles that match search keywords are expected behavior.
- Build passes (131 pages), `theme-independence.sh` passes.

## 2026-06-12 Course Report

- Completed the `网页开发技术` course report from the current standalone Hugo implementation.
- Replaced obsolete About/Contact and Blog-filter claims with the active Home, Blog, article, search, archive, and Music surfaces.
- Added current desktop/mobile screenshots, real code excerpts, development problems and fixes, and build/regression evidence.

## Current State

Phase 6 and the 2026-06-05 dependency cleanup are complete. The site is now a standalone Hugo project: all active templates, metadata, search, RSS, Markdown render hooks, styles, scripts, icons, and image helpers live in the root project. `themes/` and the `theme:` configuration have been removed.

The current header brand and browser favicon now use the same `JL` signature path, with the header rendering as a theme-colored stroke-dash handwriting animation. The browser SVG favicon is transparent, optically thickened for small tab sizes, and adapts its signature fill to the browser color scheme; PNG and ICO fallbacks use a transparent bright white signature without a black square.

The current Blog timeline preview keeps titles and metadata on the blog typography system. Blog detail openings use a cleaner title-and-body structure, and the project script owns theme switching, menu behavior, code copy, TOC behavior, scroll reveal, Music interactions, the plum canvas, back-to-top, and the image lightbox.

The current Music page is a static responsive album wall rather than a four-column editorial collection. It follows the site theme in both light and dark modes, avoids sorting/filtering/view-switch/player controls, renders the visible NetEase Cloud Music collected albums from local page-bundle covers, preserves complete cover artwork by using fitted image derivatives plus `object-fit: contain`, uses fixed-size square cards with subtle repeating left/right row offsets to avoid masonry gaps while keeping the gallery weight centered as albums are added, and lifts the title/subtitle group with a small `#c46786` waveform accent that stretches once on entry. Each card front now shows cover artwork only and flips on click to an editorial details face with per-album theme-color gradient liquid glass; the back face also uses the album cover itself as a blurred background layer so the artwork remains faintly visible. Only one card stays open at a time, `Escape` restores the cover wall, and optional year, genre, label, and listening-note fields appear when they exist. Primary interactive controls use a brief `scale(0.97)` press response without applying movement to ordinary article links.

The active frontend surface is organized under `layouts/`, `assets/scss/`, and `assets/ts/`. Search and utility-page styles have dedicated modules, while Blog collection styles are isolated from article and Music styles.

## Progress

- [x] Phase 0: Execution preflight review
- [x] Phase 1: Visual system and global shell
- [x] Phase 2: Home and Blog list
- [x] Phase 3: Blog detail
- [x] Phase 4: About, Music, Contact
- [x] Phase 5: Responsive refinements and motion
- [x] Phase 6: Performance, SEO, accessibility

## 2026-06-05 Theme Independence Migration

- Removed `themes/hugo-theme-stack`, the `theme:` setting, theme-only configuration, obsolete project overrides, unused partials, old images, and unused icons.
- Added project-owned head/SEO partials, search and JSON templates, RSS, 404, Markdown hooks, compact archive rows, media helpers, and image lightbox behavior.
- `assets/scss/site.scss` and `assets/ts/site.ts` are the only global asset entries. Search keeps a separate page-only script.
- Split collection styles and utility-page styles into `_collections.scss` and `_utility-pages.scss`; removed the old cards and compatibility modules.
- The warning-enabled Hugo build and all three regression scripts pass without an external theme.

## 2026-06-08 Blog Timeline Adjustment

- Blog year watermarks now use `Noto Serif` and a smaller desktop/mobile size range so the background year stays closer to the published Blog page rhythm.
- Dark mode page background remains `#090909`; the dark browser `theme-color` metadata matches it.
- Blog timeline post titles now keep the 18px size while using a stronger 600 title weight.
- Site CSS and JavaScript are always referenced with Hugo fingerprinted asset URLs so article routes do not fall back to unstyled pages when served from `public/`.

## 2026-06-08 Article Control Fixes

- Article TOC scrollbars now use the active text color with transparent tracks, including WebKit scrollbar styling for dark mode.
- Global site controls now tolerate legacy `matchMedia` listeners and isolate initializer failures so one widget cannot prevent article TOC hover or theme toggling from binding.
- `tests/theme-independence.sh` now checks the generated JS/CSS for these regressions.

## 2026-06-08 Light Background Adjustment

- Light mode page background and light browser `theme-color` now use `#fdfdf7`.
- Header signature hover no longer applies a surrounding glow, keeping the light mode brand mark quiet against the warm page background.
- Header signature drawing animation no longer restarts on hover or focus, avoiding partial stroke gaps when the pointer leaves.

## 2026-06-08 Deploy Build Timeout

- GitHub Actions deploy timed out while rendering image-heavy posts such as `content/post/Map & Set/index.md` and `content/post/Git命令/index.md`.
- Deploy now pins Hugo to `0.161.1`, runs the repository warning-enabled build command, and raises Hugo's page render timeout to `300s` for CI image processing.

## Phase 1 Files

Added:

- `docs/pre-refactor-review.md`
- `docs/changelog.md`
- `docs/project_status.md`
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
- `assets/scss/_legacy-bridge.scss`
- `assets/scss/_responsive.scss`
- `assets/icons/music-note.svg`
- `assets/icons/arrow-right.svg`
- `assets/icons/search-line.svg`

Modified:

- `hugo.yaml`
- `assets/scss/custom.scss`
- `layouts/partials/footer/custom.html`

## Phase 2 Files

Added:

- `layouts/partials/hero-section.html`
- `layouts/partials/blog-card.html`
- `layouts/partials/featured-post.html`
- `layouts/partials/quote-block.html`
- `layouts/partials/category-tabs.html`
- `layouts/_default/list.html`
- `assets/scss/_hero.scss`
- `assets/scss/_cards.scss`
- `assets/ts/custom.ts`

Modified:

- `layouts/index.html`
- `assets/scss/custom.scss`
- `layouts/partials/site-header.html`
- `docs/changelog.md`
- `docs/project_status.md`

## Phase 3 Files

Added:

- `layouts/partials/author-card.html`
- `assets/scss/_article.scss`
- `assets/icons/arrow-left.svg`
- `assets/icons/brand-facebook.svg`
- `assets/icons/brand-instagram.svg`
- `assets/icons/mail.svg`

Modified:

- `layouts/_default/single.html`
- `layouts/partials/article/components/related-content.html`
- `assets/scss/custom.scss`
- `assets/scss/_decorations.scss`
- `docs/changelog.md`
- `docs/project_status.md`

## Phase 4 Files

Added:

- `content/page/about/index.md`
- `content/page/music/index.md`
- `content/page/contact/index.md`
- `layouts/page/about.html`
- `layouts/page/music.html`
- `layouts/page/contact.html`
- `layouts/partials/page-cover.html`
- `layouts/partials/music-cover.html`
- `assets/scss/_about.scss`
- `assets/scss/_music.scss`
- `assets/scss/_contact.scss`
- `assets/icons/leaf.svg`
- `assets/icons/heart.svg`
- `assets/icons/map-pin.svg`
- `assets/icons/plus.svg`
- `content/page/music/netease-*.jpg`

Modified:

- `assets/scss/custom.scss`
- `docs/changelog.md`
- `docs/project_status.md`

## Phase 5 Files

Added:

- `assets/scss/_animations.scss`

Modified:

- `assets/scss/custom.scss`
- `assets/scss/_responsive.scss`
- `layouts/partials/footer/custom.html`
- `docs/changelog.md`
- `docs/project_status.md`

Deleted:

- `static/js/avatar-colors.js`
- `static/js/fireworks.js`
- `static/js/particles.js`

## Phase 6 Files

Added:

- `content/post/_index.md`
- `layouts/_default/_markup/render-image.html`
- `layouts/partials/data/title.html`
- `layouts/partials/data/description.html`

Modified:

- `hugo.yaml`
- `content/_index.md`
- `assets/scss/_animations.scss`
- `assets/scss/_reset.scss`
- `assets/scss/_variables.scss`
- `assets/ts/custom.ts`
- `layouts/_default/list.html`
- `layouts/_default/single.html`
- `layouts/page/about.html`
- `layouts/page/contact.html`
- `layouts/page/music.html`
- `layouts/partials/article/components/related-content.html`
- `layouts/partials/author-card.html`
- `layouts/partials/blog-card.html`
- `layouts/partials/category-tabs.html`
- `layouts/partials/featured-post.html`
- `layouts/partials/footer/custom.html`
- `layouts/partials/head/custom.html`
- `layouts/partials/hero-section.html`
- `layouts/partials/music-cover.html`
- `layouts/partials/page-cover.html`
- `layouts/partials/site-header.html`
- `docs/changelog.md`
- `docs/project_status.md`
- `docs/blog-refactor-plan.md`

## 2026-06-14 Content Import Files

Added:

- `content/post/Seata/index.md`
- `content/post/Seata/assets/seata-global-transaction.png`
- `content/post/Seata/assets/seata-2pc.png`
- `content/post/Seata/assets/seata-xa-mode.png`
- `content/post/Seata/assets/seata-at-mode.png`
- `content/post/Seata/assets/seata-at-write-isolation.png`
- `content/post/Seata/assets/seata-at-read-isolation.png`
- `content/post/Seata/assets/seata-tcc-flow.png`
- `content/post/Seata/assets/seata-saga-recovery.png`

Modified:

- `docs/changelog.md`
- `docs/project_status.md`

## 2026-05-31 Content Import Files

Added:

- `content/post/Redis 哨兵/index.md`
- `content/post/Redis 哨兵/assets/sentinel-overview.png`
- `content/post/Redis 哨兵/assets/sentinel-folders.png`
- `content/post/Redis 哨兵/assets/sentinel-logs.png`
- `content/post/Redis 哨兵/assets/redis-data-logs.png`
- `content/post/Redis 集群/index.md`
- `content/post/Redis 集群/assets/redis-cluster-hash-mod.png`
- `content/post/Redis 集群/assets/redis-cluster-consistent-hash.png`
- `content/post/Redis 集群/assets/redis-cluster-hash-slot.png`

Modified:

- `docs/changelog.md`
- `docs/project_status.md`

## 2026-06-01 Content Import Files

Added:

- `content/post/API 类型总结/index.md`
- `content/post/API 类型总结/assets/api-types/0000-rest-api.jpg`
- `content/post/API 类型总结/assets/api-types/0091-soap-api.jpg`
- `content/post/API 类型总结/assets/api-types/0171-grpc-api.jpg`
- `content/post/API 类型总结/assets/api-types/0280-graphql-api.jpg`
- `content/post/API 类型总结/assets/api-types/0373-webhooks-api.jpg`
- `content/post/API 类型总结/assets/api-types/0451-websockets-api.jpg`
- `content/post/API 类型总结/assets/api-types/0511-webrtc-api.jpg`
- `content/post/API 类型总结/assets/api-types/0594-mcp-server.jpg`
- `content/post/API 类型总结/assets/api-types/0676-rpc.jpg`
- `content/post/API 类型总结/assets/api-types/0743-sse.jpg`
- `content/post/API 类型总结/assets/api-types/0811-mqtt.jpg`
- `content/post/API 类型总结/assets/api-types/0869-amqp.jpg`
- `content/post/API 类型总结/assets/api-types/0932-event-driven-api.jpg`
- `content/post/API 类型总结/assets/api-types/0999-apache-kafka.jpg`
- `content/post/API 类型总结/assets/api-types/1038-asyncapi.jpg`
- `content/post/API 类型总结/assets/api-types/api-relationship-map.jpg`

Modified:

- `docs/changelog.md`
- `docs/project_status.md`

## 2026-06-02 Content Import Files

Added:

- `content/post/Docker 部署 Redis 集群/index.md`
- `content/post/Docker 部署 Redis 集群/assets/docker-cluster-layout.png`
- `content/post/Docker 部署 Redis 集群/assets/docker-cluster-folders.png`
- `content/post/Docker 部署 Redis 集群/assets/docker-cluster-create.png`
- `content/post/Redis 集群/assets/cluster-nodes.png`
- `content/post/Redis 集群/assets/cluster-set-without-c.png`
- `content/post/Redis 集群/assets/cluster-set-with-c.png`
- `content/post/Redis 集群/assets/cluster-stop-redis1.png`
- `content/post/Redis 集群/assets/cluster-failover-promote.png`
- `content/post/Redis 集群/assets/cluster-redis1-restart.png`

Modified:

- `content/post/Redis 集群/index.md`
- `docs/changelog.md`
- `docs/project_status.md`

## Decisions

- Keep the project independent from external Hugo themes unless a future migration is explicitly approved.
- Use `params.primaryNav` in `hugo.yaml` as the navigation source for the new top header.
- Keep shared head, media, footer tools, and list-row behavior in project partials.
- Treat `docs/blog-refactor-plan.md` as the accepted design specification for staged implementation.
- Keep homepage and Blog list free of music playback controls; music remains visual language only.
- Keep the Music page editorial and recommendation-oriented; do not add playback controls, progress UI, or media-player modules.
- Use `[[albums]]` in `content/page/music/index.md` as the Music page gallery data source; future albums should be added there with title, artist, year, genre, label, page-bundle cover image, alt text, and the retained layout label.
- Preserve full album artwork on Music cards by fitting images rather than cropping the primary cover.
- Render the current Music album wall as fixed-size square cards; existing `layout` values are kept for data compatibility but do not change visual card size in the current concept-aligned layout.
- Keep Music album details inside click-to-flip cards. Only one card stays flipped at a time; `Escape` restores the gallery, and missing optional metadata stays absent instead of being invented.
- Do not apply global grayscale filters to real images or portraits; decorative music shapes and code-native panels can remain monochrome.
- Use light mode as the default visual baseline so the Home page matches the current concept direction; dark mode remains manually toggleable.
- Keep Phase 5 motion below 500ms and respect `prefers-reduced-motion`.
- Keep global browser behavior in `assets/ts/site.ts`; page-only behavior belongs in a dedicated entry such as `assets/ts/search.ts`.
- Keep Blog detail code blocks line-number-free, larger, and visually quiet.
- Use a restrained technical-doc syntax palette for Blog detail code blocks so code remains readable and token types are clearly differentiated in both light and dark modes.
- Keep generated Blog detail summaries short enough to support the concept composition and avoid repeating the article title.
- Keep Blog detail tables at the same readable scale as the enlarged article body, including table inline code.
- Keep Blog detail pages as a wide no-right-sidebar reading layout; place the quote in the header area and related posts after the article body.
- Use project-level title and description partials for metadata behavior.
- Prefer WebP derivatives for project-level generated images and Markdown content images while preserving original colors.
- Keep article body Markdown `h1` headings demoted under the article title so detail pages have a single primary `h1`.
- Keep above-the-fold Blog detail content out of reveal animations to protect LCP.
- Keep the global header rail wider than the main content rail so the logo and theme toggle match the concept-image edge spacing.
- Keep hero portraits smaller and lighter across Home, About, Music, Contact, and article author surfaces.
- Use one shell-level plum canvas background on main non-article surfaces; keep Blog article detail pages free of that background layer for reading.

## Known Gaps

- Home has been rewritten and refined against the current concept direction.
- Blog list has been rewritten and refined against the current concept direction; client-side filtering currently operates on the rendered post set.
- Blog detail has been rewritten and refined against the current concept direction.
- About, Music, and Contact have been implemented as static editorial pages using current site content/media resources.
- Music has been refined into a static album gallery that uses `[[albums]]` front matter instead of the previous lyric/songwriter/record/inspiration columns.
- Music album entries support real page-bundle cover images through `layouts/partials/music-cover.html`; uploaded covers preserve their original colors, primary artwork renders fully with a fitted non-cropping image, fixed-size square card slots avoid side bands on square covers, and the front face stays cover-only.
- Music album cards now expose an editorial back face with current title and artist data plus optional year, genre, label, and listening-note fields.
- Project-level real image styles have been reset so newly added images and portraits are not forced to grayscale.
- Phase 5 responsive and motion refinements are complete.
- Phase 6 performance, SEO, and accessibility review is complete.
- Home, Contact, and About received a post-Phase-6 concept-alignment pass for header edge spacing, portrait scale, theme-toggle centering, and first-viewport rhythm.
- Legacy visual scripts `static/js/particles.js`, `static/js/fireworks.js`, and `static/js/avatar-colors.js` have been deleted.
- Main non-article pages now share the fixed AntfuStyle plum canvas background layer; the previous global staff/note partials, ambient music partial, Blog-local staff doodle, and old Gemini background images have been retired.
- Remaining optional optimization: deeper CSS pruning could reduce unused CSS reported by Lighthouse, but the current desktop Lighthouse targets are met.

## Latest Verification

- `hugo -D --cleanDestinationDir --printI18nWarnings --printPathWarnings`: passed, 131 pages generated.
- `bash tests/theme-independence.sh`: passed.
- `bash tests/music-album-flip.sh`: passed.
- `bash tests/scroll-reveal.sh`: passed.
- `git diff --check`: passed.
- Generated global CSS is about 65 KB; global JavaScript is about 11 KB. Search JavaScript is page-only and about 3.5 KB.
- Browser checks covered Home, Blog, an article, Music, Search, Archives, and 404 in desktop and mobile viewports.

## Verification History

Command:

```bash
hugo -D --cleanDestinationDir --printI18nWarnings --printPathWarnings
```

Result:

- Build passed with existing Hugo deprecation warnings.
- Generated 122 pages.
- Processed 814 images.

Local preview:

- For the latest plum-background check, Hugo server was run at `http://127.0.0.1:1314/` because `1313` was already occupied.
- Browser DOM checks confirmed Home, Blog list, About, Music, and Contact render the `data-plum-background` layer and a full-viewport canvas.
- Browser checks confirmed the Blog article detail route `/p/sentinel/` does not render the plum background layer.
- Mobile Chrome checks at `390x844` confirmed Home and Blog list render the plum layer without horizontal overflow, while `/p/sentinel/` remains background-free.
- Theme-toggle checks confirmed the plum canvas color variable redraw path switches from the light value to the dark value.
- Hugo server is normally expected at `http://127.0.0.1:1313/` when the port is free.
- `/`, `/about/`, `/music/`, and `/contact/` returned HTTP 200; the removed route returns 404.
- New global header and plum background partials are present in rendered HTML.
- Old `particles.js` and `fireworks.js` references are absent from rendered HTML.
- Browser automation checked Home, Blog list, Blog detail, About, Music, and Contact across desktop, tablet, and mobile viewports.
- Checked routes showed no horizontal overflow.
- Plum background checks covered Home, Blog list, About, Music, and Contact; Blog article detail pages stayed free of the layer.
- Mobile navigation opens with `aria-expanded="true"`, locks body scroll, closes on outside click, and restores `aria-expanded="false"`.
- Scroll reveal initializes in the browser and respects the reduced-motion CSS fallback.
- Deleted legacy visual scripts are absent from `static/js/` and rendered HTML.
- `/post/` renders one featured post, category tabs, search input, and 21 filterable cards.
- `/` renders the new hero and 3 latest post cards; the old Welcome jump-text block is absent.
- Home desktop screenshot was checked at `1920x1080` with no horizontal overflow.
- Home mobile smoke was checked at `390x844` with no horizontal overflow.
- Blog desktop screenshot was checked at `1920x1080` with no horizontal overflow.
- Blog mobile smoke was checked at `390x844` with no horizontal overflow.
- Blog detail desktop screenshot was checked at `1920x1080` with no horizontal overflow.
- Blog detail mobile smoke was checked at `390x844` with no horizontal overflow.
- Blog detail rendered the back link, share rail, article header, cover image, bottom related posts, and article content.
- About, Music, and Contact desktop screenshots were checked at `1920x1080` with no horizontal overflow.
- About, Music, and Contact mobile smoke screenshots were checked at `390x844` with no horizontal overflow.
- About, Music, and Contact active navigation states render correctly.
- Contact renders one form and three FAQ rows.
- Playwright fallback screenshots checked Home, Contact, and About at `1670x950` against the provided concept images; theme-toggle icon centering, smaller portrait dimensions, first-viewport positions, and no horizontal overflow were verified.
- Music now renders 16 static collected album cards from `[[albums]]`, all backed by local page-bundle cover images and no no-image fallback card.
- Music hero browser checks at desktop `1440x900`, tablet `820x1180`, and mobile `390x844` confirmed the lifted title/subtitle rhythm, no remaining `Album gallery` eyebrow, and the five-bar waveform beside `Music`.
- Music scheme checks on a fresh Hugo preview confirmed the theme toggle renders the gallery readably in both light and dark modes with no horizontal overflow.
- Music cover images compute `object-fit: contain`, appear inside the card front face without the previous cover frame/backdrop/body/meta wrappers, and stay visible at desktop `1440x900`, tablet `820x1180`, and mobile `390x844`.
- Music album cards measured at a 1:1 rendered ratio on desktop `1440x900`, tablet `820x1180`, and mobile `390x844`; rendered square cover images matched the square card slots without the previous left/right side bands, and desktop rows use fixed-size cards with subtle alternating offsets instead of varied masonry sizing.
- Music card fronts render cover artwork only; title and artist appear on the details face after flipping.
- Music flip-card browser checks confirmed click-to-flip behavior, one-card-at-a-time state, `Escape` recovery, `aria-pressed` updates, front/back `aria-hidden` updates, the 3D transform, and zero horizontal overflow.
- Music mobile flip-card checks at `390x844` confirmed `362x362` square cards, successful flipping, and zero horizontal overflow.
- Music dark-mode flip-card checks confirmed the details face remains readable after theme switching with zero horizontal overflow.
- Music waveform browser checks confirmed the `#c46786` accent runs one staggered `320ms` entry stretch per bar, then stays still in desktop and mobile layouts.
- Primary press-feedback styles load with `scale(0.97)` and a `140ms` response on scoped interactive controls while ordinary article links stay stable.
- Music card backs use per-album `themeColor` accents, layered radial gradients, glass blur, and static highlight surfaces instead of a shared flat background.
- Music card backs expose the current cover image as `--album-image`, rendering it as a blurred, enlarged backdrop below the glass overlay so the album artwork remains recognizable.
- Music album wall row offsets alternate left and right by row instead of accumulating leftward drift, so future albums continue the same rhythm without special last-row handling.
- Scroll-reveal checks confirm article pages no longer target every direct content child; only stable editorial blocks and Music album cards are reveal targets.
- Music responsive checks showed no horizontal overflow at desktop, tablet, or mobile widths.
- Music renders no `audio`, `video`, `progress`, sorting, filtering, view-switching, playlist, or playback-control UI.
- Header theme-toggle checks confirmed the sun and moon default contrast now aligns with the GitHub and Instagram action group while keeping the existing hover/focus motion.
- Home, Blog, Blog detail, About, Music, and Contact rendered images all compute `filter: none` in browser verification.
- Blog and featured card hover checks confirmed transform, image movement, arrow movement, and bottom hairline reveal while keeping image filters disabled.
- Blog detail code-block verification confirmed line numbers are disabled, old Chroma line-number elements are hidden as a fallback, code text is larger, and the copy bubble is hidden.
- Blog detail code palette verification confirmed differentiated token colors for comments, keywords, strings, numbers, functions, types, attributes, punctuation, and diff tokens.
- Blog detail proportion tune brought the title, summary, cover image, share rail, and sidebar rhythm closer to the provided concept while retaining larger body/code text.
- Blog detail table verification confirmed the `执行时间` table uses larger text, larger inline code tags, roomier cells, and no horizontal page overflow.
- Blog detail wide-layout verification confirmed the right sidebar is removed, the quote appears in the header, related posts render below the article body, and the `执行时间` table stays inside the widened reading column with no horizontal page overflow.
- Phase 6 browser audit checked Home, Blog, Blog detail, About, Music, and Contact for stable titles, meta descriptions, semantic landmarks, a single page `h1`, image alt/loading/decoding attributes, WebP output, labeled buttons, duplicate IDs, no horizontal overflow, and no audio/video/progress controls.
- Blog category keyboard audit confirmed ArrowRight focus movement, `aria-pressed` state updates, visible focus outlines, and encoded Chinese category matching with visible filtered cards.
- Lighthouse desktop audit:
  - Home: Performance 90, Accessibility 100, Best Practices 100, SEO 100.
  - Blog detail: Performance 97, Accessibility 100, Best Practices 100, SEO 100.
