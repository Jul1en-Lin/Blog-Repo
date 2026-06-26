# Hugo Theme Independence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the blog into a standalone Hugo project and remove all Stack theme runtime and repository files.

**Architecture:** Replace the theme's shared head, media helpers, asset entry points, search, RSS, 404, archive rows, and image gallery with focused project-owned files. Keep one global stylesheet and one global script, with search code loaded only where needed.

**Tech Stack:** Hugo templates, Hugo Pipes, SCSS, TypeScript, Bash regression tests

---

### Task 1: Add the independence regression test

**Files:**
- Create: `tests/theme-independence.sh`

- [ ] Assert that `hugo.yaml` has no `theme:` key and `themes/` is absent.
- [ ] Build with Hugo warnings enabled.
- [ ] Assert that home, post, archive, search, 404, RSS, and article output exist.
- [ ] Assert that global CSS and JavaScript are loaded once and no Stack assets or CDN gallery scripts remain.
- [ ] Assert that search JSON and the project image lightbox remain present.
- [ ] Run the test and confirm it fails against the current Stack-dependent tree.

### Task 2: Own the global template and asset pipeline

**Files:**
- Create: `layouts/partials/head/head.html`
- Create: `layouts/partials/head/meta.html`
- Create: `layouts/partials/head/opengraph.html`
- Create: `layouts/partials/head/resources.html`
- Create: `layouts/partials/footer/site-tools.html`
- Create: `layouts/partials/media/icon.html`
- Create: `layouts/partials/media/featured-image.html`
- Create: `assets/scss/site.scss`
- Create: `assets/ts/site.ts`
- Modify: `layouts/_default/baseof.html`
- Modify: callers of `helper/icon` and `helper/image`
- Delete: superseded head/footer partials and duplicate script entry files

- [ ] Point `baseof.html` only at project-owned partials.
- [ ] Compile `site.scss` to `/css/site.css` and `site.ts` to `/js/site.js`.
- [ ] Merge menu, back-to-top, TOC, reveal, theme, copy, Music, plum, and lightbox behavior into `site.ts`.
- [ ] Run the independence test and fix global-pipeline failures.

### Task 3: Own standalone page formats

**Files:**
- Create: `layouts/page/search.html`
- Create: `layouts/page/search.json`
- Create: `layouts/404.html`
- Create: `layouts/_default/rss.xml`
- Create: `layouts/_default/_markup/render-heading.html`
- Create: `layouts/_default/_markup/render-link.html`
- Create: `layouts/partials/article-list/compact.html`
- Create: `assets/ts/search.ts`
- Modify: `layouts/_default/archives.html`
- Modify: `layouts/_default/single.html`

- [ ] Implement search HTML, JSON generation, and escaped client rendering.
- [ ] Implement standalone 404 and RSS output.
- [ ] Keep archive compact rows and Markdown link behavior.
- [ ] Remove comment, math, and PhotoSwipe partial calls.
- [ ] Run the independence and existing tests.

### Task 4: Remove Stack and dead project files

**Files:**
- Modify: `hugo.yaml`
- Delete: `themes/`
- Delete: `assets/jsconfig.json`
- Delete: confirmed unused images, icons, SCSS, and partials

- [ ] Remove Stack configuration and obsolete theme-specific parameters.
- [ ] Delete the theme directory in one operation.
- [ ] Delete only files proven unused by generated output and template metrics.
- [ ] Run all tests and the warning-enabled Hugo build.

### Task 5: Browser and final verification

**Files:**
- Modify: `docs/project_status.md`
- Modify: `docs/changelog.md`

- [ ] Start `hugo server` and inspect home, post list, article, archives, search, 404, and Music.
- [ ] Check desktop and mobile navigation, dark mode, search, code copy control, image lightbox, and album flip behavior.
- [ ] Record the new standalone structure and verification commands.
- [ ] Run `git diff --check` and review the final diff for unrelated changes.

