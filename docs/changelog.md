# Changelog

This file keeps a compact record of meaningful user-visible or developer-visible changes. Detailed execution logs should stay in task notes or archived phase reports, not here.

## Current Snapshot - 2026-05-05

The Phase 0-6 blog refactor is complete. The site is a Hugo personal blog that still depends on `hugo-theme-stack`, while the visible shell is now controlled by project-level templates, partials, SCSS, and content instead of the original theme sidebar layout.

Current user-facing state:

- Home, Blog list, Blog detail, About, Music, and Contact have been implemented or refined against the black-and-white minimal editorial music direction.
- The global shell uses a top navigation, wider header rail, light-mode-first visual baseline, custom typography, a low-opacity Antfu-style plum canvas background on non-article surfaces, and manually toggleable dark mode.
- Blog list includes featured content, category filter buttons, search, responsive cards, accessible keyboard filtering, and restrained hover motion.
- Blog detail uses a wide no-right-sidebar reading layout, header quote, larger readable body text, line-number-free code blocks, improved table readability, and bottom related posts.
- About, Music, and Contact are standalone editorial pages with dedicated project-level layouts.
- Music uses a static album gallery backed by `[[albums]]` front matter and page-bundle album covers; each front face is cover artwork only, clicking a card flips it to an editorial details face, and the page intentionally has no audio, video, playback button, playlist, progress, sorting, filtering, or media-player UI.
- Project-level SEO metadata, responsive WebP image processing, focus states, semantic heading cleanup, and accessibility refinements are in place.
- Real images and portraits render in original color by default; grayscale is no longer applied globally to image surfaces.

Current technical state:

- Keep using `hugo-theme-stack` for the Hugo pipeline and theme scripts.
- Do not modify files under `themes/` unless explicitly requested.
- Use `params.primaryNav` in `hugo.yaml` as the navigation source.
- Prefer project-level overrides in `layouts/`, `assets/`, `content/`, and `static/`.
- `static/js/particles.js`, `static/js/fireworks.js`, `static/js/avatar-colors.js`, and the old Gemini background images have been removed.
- Optional future optimization: deeper CSS pruning could reduce unused CSS, but current Lighthouse desktop targets were met.

Latest verification snapshot:

- `hugo -D --cleanDestinationDir --printI18nWarnings --printPathWarnings` / previous Windows equivalent passed.
- Build generated 113 pages and processed 771 images in the latest recorded pass.
- Browser checks covered Home, Blog list, Blog detail, About, Music, and Contact across desktop, tablet, and mobile viewports.
- No horizontal overflow was detected on checked routes.
- Mobile navigation opened, locked body scroll, closed correctly, and restored `aria-expanded`.
- Music rendered no player, audio, video, progress, playlist, or playback-control UI.
- Blog filtering keyboard behavior and encoded Chinese category matching were verified.
- Lighthouse desktop audit reached:
  - Home: Performance 90, Accessibility 100, Best Practices 100, SEO 100.
  - Blog detail: Performance 97, Accessibility 100, Best Practices 100, SEO 100.

## Condensed History

### 2026-06-01 - API Types Post

- Imported the Obsidian `API 类型总结` note from the communication-protocol vault area as a Hugo page-bundle post.
- Converted Obsidian image width syntax to normal Markdown images and copied the local API type diagrams into the post bundle.

### 2026-05-31 - Redis Sentinel And Cluster Posts

- Imported the Redis Sentinel and Redis Cluster notes from the Obsidian vault as Hugo page-bundle posts.
- Converted Obsidian image embeds to local post assets and removed the opening related-note backlinks from the published bodies.

### 2026-05-31 - Music Album Flip Cards

- Added click-to-flip Music album cards with restrained CSS 3D motion and a reduced-motion crossfade fallback.
- Simplified each card front to the album cover artwork only; title and artist now live on the details face.
- Kept one album open at a time, added `Escape` recovery, semantic toggle buttons, and accessible face visibility state.
- Added optional back-face support for year, genre, label, and listening note fields without inventing metadata for existing albums.
- Changed the Music title waveform to `#c46786` and added a one-time staggered `320ms` entry stretch without continuous looping.
- Added `140ms` `scale(0.97)` press feedback to primary navigation, button, card-link, and album-card interactions while leaving ordinary body links stable.
- Added per-album theme colors and a static gradient liquid-glass treatment to Music card backs.
- Refined the Music card back glass so it uses the album cover itself as a blurred background layer, making the original artwork faintly visible behind the details.
- Changed the Music album wall row offsets from accumulating left drift to a repeating left/right alternation so added albums keep the visual weight near center.
- Scoped scroll reveal so article reading stays stable: only editorial blocks and Music album cards fade in, while ordinary body paragraphs remain static.
- Added a generated-output regression check for the Music flip-card structure, script hooks, transform, and reduced-motion handling.

### 2026-05-30 - Codex Workflow Update Post

- Imported the `Codex 工作流更新-v2` article from the Obsidian vault as a Hugo post and converted its Obsidian wikilink into a Hugo article link.

### 2026-05-30 - Code Block CJK Font

- Added the article display font stack after the monospace fonts so Chinese text inside code blocks falls back to the same serif blog typography instead of a system monospace fallback.

### 2026-05-30 - Resource Cleanup

- Removed unused tracked backup files, `.DS_Store` files, stale icons/images, an unused bundled font, and orphaned post media that were no longer referenced by Hugo content, layouts, config, or styles.

### 2026-05-30 - Home Intro Copy

- Reworked and tightened the Chinese homepage description and opening copy toward a quieter literary blog tone, removing specific technology references.

### 2026-05-28 - Transparent Adaptive Favicon

- Removed the solid dark square from the signature favicon SVG so the browser tab background can show through.
- Updated the SVG favicon to switch between dark and bright white signature fills based on the browser color scheme.
- Regenerated the PNG and ICO favicon fallbacks from `assets/img/signature.png` as transparent, optically thicker white signature assets.

### 2026-05-25 - JL Signature Logo And Favicon

- Replaced the header brand with a single-path `JL` SVG signature designed for center-line stroke animation.
- Kept the restrained handwriting reveal with `stroke-dasharray`/`stroke-dashoffset`, including hover/focus replay.
- Tuned the `JL` path closer to the reference signature with a larger left `J` loop, a taller `L` loop, and a longer flatter exit stroke.
- Repositioned the `L` so the `J` upstroke hooks into a narrow upper loop before dropping into the lower loop and exit stroke.
- Redrew the `JL` signature against the reference image so the `L` upper loop sits above the `J` upstroke before descending into the small lower loop.
- Regenerated the browser favicon assets from the same `JL` signature, including SVG, PNG, `favicon-signature.ico`, and the default `favicon.ico`.

### 2026-05-23 - Article Header Controls

- Removed the duplicate mini brand from the article table-of-contents rail so only the global header signature remains.
- Added an inline theme-toggle initializer fallback so older article pages keep switching themes even when a stale fingerprinted custom script is referenced during local preview.

### 2026-05-23 - Header Signature Visibility

- Restored the header signature visibility after the transparent header change by removing the fragile blend-mode color treatment.

### 2026-05-23 - Header Single-Line Signature

- Replaced the clipped header signature reveal with a true single center-line SVG path using `currentColor`, thin round strokes, left-to-right dash drawing, and restrained hover/focus replay.
- Refined the single-line path for better static readability by shortening the `J` entry stroke, reducing the lower loop, spacing `u/l/1/e/n`, clarifying the `e` loop, and shortening the `n` tail.
- Rebalanced the signature skeleton against the reference image with a broader `J` sweep, clearer low `u`, rounded `l` loop, simpler `1` downstroke, cleaner `e` loop, and shorter `n` exit tail.
- Reworked the `u` stroke order so it falls into a clearer rounded bottom and rises into the next letter instead of collapsing into a tight backtracking knot at logo size.
- Removed the remaining `u` backtracking loop so the `J` now flows into an open low `u` stroke before rising toward `l`.
- Lowered the `u` entry and reduced the signature stroke width slightly so the `u` remains readable instead of closing into a knot at header scale.
- Narrowed the `u` cup and brought its rising exit leftward so it reads as a compact handwritten `u` instead of a wide wave.
- Retuned the header signature toward the latest concept image by shortening the `J` top sweep, widening the navigation mark slightly, and keeping the single-path handwriting reveal intact.

### 2026-05-23 - Transparent Header

- Removed the header background and blur layer so the plum canvas background remains visible behind the top navigation.

### 2026-05-23 - Blog Timeline Spacing

- Adjusted the Blog timeline column position and spacing to better match the AntfuStyle reference list rhythm.
- Simplified Blog timeline hover feedback to a title-width underline reveal instead of a full-row highlight bar.

### 2026-05-23 - Article Title Alignment

- Removed the inherited article-content side padding on Blog detail pages so article titles and body text share the same left edge.

### 2026-05-23 - Mobile Menu Button

- Restyled the mobile navigation toggle to match the neighboring header action icons, removing the circular button frame.
- Matched the hamburger stroke color to the header action icons in both light and dark modes.
- Matched the mobile menu toggle spacing to the adjacent header action icon spacing.

### 2026-05-23 - Music Typography

- Updated the Music page heading and album titles to use the Blog heading font, with album titles staying white in light mode.
- Corrected the Music page album metadata for `在雨后醒来` by Asen.

### 2026-05-23 - Music Album Collection

- Replaced the Music gallery data with the visible NetEase Cloud Music collected albums and added local page-bundle covers for each card.
- Removed the `Re:member` fallback card from the rendered Music gallery.
- Removed the old unused `album-1.jpg` to `album-5.jpg` page-bundle cover files after switching the gallery to `netease-*` covers.

### 2026-05-23 - Page Removal

- Removed the discontinued page, navigation entry, content file, page layout, SCSS module, reveal selector, and responsive overrides.
- Updated current project documentation so the removed surface is no longer part of the active site.

### 2026-05-23 - Antfu Plum Background

- Replaced the shell-level ambient music background with the AntfuStyle `plum` canvas animation on non-article surfaces.
- Added a project-level plum background partial and script hook while keeping Blog article detail pages free of the background layer.
- Removed the old Gemini background image assets from both `static/background/` and `assets/background/`.

### 2026-05-23 - Ambient Music Background

- Replaced the older global staff/note decoration partials and Blog-local staff doodle with one shell-level ambient music background layer.
- Added watermark-level staff curves, a waveform line, spectrum dots, and sparse breathing particles for main site surfaces in both light and dark modes.
- Fixed the ambient layer to the viewport, simplified SVG note shapes, and aligned the upper-right staff geometry between light and dark modes.
- Refined the ambient note stems with continuous flagged paths and uniform group opacity so line joins no longer brighten at overlaps.
- Kept the layer inert below page content with article detail pages left free of the ambient background.

### 2026-05-22 - Music Album Gallery

- Reworked the Music page from a four-column editorial collection into a static responsive album gallery.
- Added `[[albums]]` as the Music page front matter source for title, artist, year, genre, label, cover image, alt text, and the retained layout label.
- Changed Music cover rendering to preserve full album artwork with `.Fit` derivatives and `object-fit: contain`, with the image itself as the card surface.
- Moved visible card metadata into a bottom in-image overlay and reduced it to album title plus artist.
- Adjusted the album gallery to use fixed-size square card slots with subtle alternating row offsets, so fitted square covers no longer show side bands or masonry gaps.
- Kept existing `layout` values in content for compatibility, but the current visual wall intentionally renders album cards at the same size.
- Lifted and tightened the Music hero title group to match the concept direction, and added the small waveform accent beside the title.
- Removed Music page category tools, sorting, view switching, fake playback, and player-style controls from the planned surface.

### 2026-05-22 - Header Theme Toggle Contrast

- Aligned the header theme toggle's default icon contrast with the neighboring GitHub and Instagram actions in both site schemes.

### 2026-05-22 - Article Theme Toggle Bugfix

- Fixed the theme toggle on Blog detail pages by binding the project-level toggle earlier while preserving Stack's circular View Transition animation.

### 2026-05-22 - Dark Mode Article Images

- Added a restrained dark-mode filter for Blog article content images so bright images sit more comfortably on dark reading pages.
- Scoped the treatment to article body images and left site portraits, covers, list thumbnails, and Music artwork unchanged.

### 2026-05-22 - Signature Favicon

- Replaced the browser tab icon with a transparent `Jul1en` signature favicon.
- Added an adaptive SVG favicon for light/dark browser chrome and a transparent ICO fallback.

### 2026-05-22 - Blog Detail Opening Layout

- Simplified Blog detail openings to title metadata followed by the article body, removing the summary preview, header quote, cover image, and title underline while keeping the music divider.

### 2026-05-22 - Blog List Hover Motion

- Added restrained hover and keyboard-focus motion to the current Blog article list.
- Kept the effect visible in both light and dark modes with subtle row background, hairline reveal, title movement, and brighter metadata.
- Preserved the compact list layout, reduced-motion fallback, and project-level override boundary.

### 2026-05-22 - Blog Preview Typography

- Updated Blog timeline preview titles and metadata to use the blog typography system instead of body/mono overrides.

### 2026-05-22 - Path Signature Logo

- Replaced the header signature reveal with hand-drawn SVG paths using thin round strokes.
- Added stroke-dashoffset load animation and hover/focus redraw behavior with reduced-motion and print fallbacks.
- Restored the six-stroke handwritten `Jul1en` mark and removed the visible Blog timeline masthead tabs.
- Verified Hugo build, all generated routes at desktop/mobile widths, article detail persistence, and hover redraw behavior.

### 2026-05-21 - Header Signature Motion

- Replaced the header text brand with a CSS-only inline SVG `Jul1en` signature reveal.
- Added a 10-second left-to-right write, hold, and reset loop with reduced-motion and print fallbacks.
- Tuned desktop, 920px, and 390px sizing so header actions and the mobile menu remain visible.
- Verified Hugo build passed with only existing deprecation warnings; browser checks covered `/`, `/post/`, `/music/`, plus currently missing `/about/` and `/contact/`, with no horizontal overflow.

### 2026-05-21 - Blog Timeline Index

- Reworked the Blog listing from the large hero/featured/card layout into a compact year-grouped article index.
- Removed the Blog category filter/search controls and tuned the index closer to the reference year-overlay rhythm.
- Kept the current color system, dark-mode variables, header signature, and a subtle music-staff decoration.
- Extended verification to generated routes, Blog timeline layout, article detail signature persistence, and desktop/tablet/mobile Blog screenshots.

### 2026-05-05 - Concept Alignment And Phase 6 Finish

- Completed the performance, SEO, and accessibility pass.
- Added project-level title and description partials, site metadata, Markdown image render hooks, WebP derivatives, and deferred custom script loading.
- Improved Blog category filtering semantics and keyboard behavior.
- Added global `:focus-visible` treatment and stronger muted-text contrast.
- Protected Blog detail LCP by removing above-the-fold reveal animation.
- Tuned Home, Contact, and About closer to provided concept screenshots, including header rail width, theme-toggle centering, portrait/avatar sizing, and first-viewport rhythm.

### 2026-05-05 - Blog Detail Reading Refinements

- Removed the Blog detail right sidebar and widened the reading layout.
- Moved the article quote into the header and related posts below the article body.
- Improved Blog detail table scale, spacing, inline code readability, and overflow behavior.
- Tuned Blog detail proportions closer to the provided concept while keeping the larger body/code reading experience.

### 2026-05-04 - Blog Detail Code And Card Refinements

- Reworked Blog detail code blocks into a quieter technical-doc style.
- Disabled visible line numbers and hid the Stack-generated copy bubble on detail pages.
- Added a differentiated syntax palette for comments, keywords, strings, numbers, functions, types, attributes, punctuation, and diff tokens.
- Refined Blog and featured card hover motion with restrained lift, image movement, arrow response, and hairline reveal while preserving original image colors.

### 2026-05-04 - Phase 5 Responsive And Motion

- Added `assets/scss/_animations.scss` and wired it into `assets/scss/custom.scss`.
- Added lightweight page entry, scroll reveal, title note hover, timeline node reveal, card/link hover, FAQ content, and staff-line parallax motion.
- Kept motion below the Phase 5 500ms cap and respected `prefers-reduced-motion`.
- Strengthened responsive behavior across page widths, post media, Music album grids, forms, and lists.
- Expanded mobile navigation behavior in `layouts/partials/footer/custom.html`.
- Deleted legacy visual scripts from `static/js/`.

### 2026-05-04 - Image And Music Page Refinements

- Removed project-level grayscale filters from real image surfaces across cards, covers, author/page portraits, related posts, and Music image slots.
- Updated the image styling baseline so newly added real images render in their original colors by default.
- Refined Music to use Music-specific front matter data instead of Blog post content.
- Added page-bundle album and record cover support through `layouts/partials/music-cover.html`.
- Adjusted Favorite Albums to square crops and kept uploaded cover colors intact.
- Preserved the rule that Music remains editorial and recommendation-oriented, without playback controls.

### 2026-05-04 - Phase 4 Pages

- Added content entries and project-level layouts for About, Music, and Contact.
- Added `layouts/partials/page-cover.html` and Phase 4 SCSS modules for About, Music, and Contact.
- Added small line icons for page accents.
- Matched the provided concept directions with editorial hero layouts, circular author image treatment, multi-column Music sections, and Contact form/FAQ content.

### 2026-05-03 - Phase 3 Blog Detail

- Rewrote `layouts/_default/single.html` for the Blog detail page.
- Added author, related content, article SCSS, back/share/action icons, centered article header, large cover image, left share rail, and related post support.
- Removed duplicate first body heading when it matched the article title.

### 2026-05-03 - Phase 2 Home And Blog List

- Rewrote the homepage with hero, quote block, and latest posts.
- Added reusable partials for hero, cards, featured post, quote block, and category filters.
- Added Blog list/taxonomy list handling and client-side post filtering/search in `assets/ts/custom.ts`.
- Tuned Home and Blog list against provided concept images, including the `Melody` brand display, editorial compositions, category/search row, card proportions, and theme-toggle icon.

### 2026-05-03 - Phase 1 Visual System And Global Shell

- Added a project-level base layout and top navigation shell.
- Added reusable music staff/note decoration partials.
- Added Google Fonts and overrode Stack's dynamic Lato loader.
- Replaced the monolithic custom stylesheet with modular SCSS foundations for variables, reset, typography, header, decorations, dark mode, legacy bridge, and responsive behavior.
- Added `params.primaryNav` to `hugo.yaml`.
- Stopped loading old particles/fireworks/avatar color scripts.
- Added custom SVG icons for the refactor shell and article actions.

## Maintenance Notes

- Add new entries only for meaningful behavior, UX, architecture, configuration, or verification changes.
- Keep entries concise; avoid copying full command output or screenshot narratives.
- Store large investigation details under `docs/bugs/` or task-specific notes.
- Use `docs/project_status.md` for current milestone/progress and `docs/decisions.md` for durable technical decisions.
