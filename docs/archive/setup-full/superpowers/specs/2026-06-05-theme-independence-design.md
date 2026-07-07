# Hugo Theme Independence Design

## Goal

Remove `hugo-theme-stack` completely while preserving the current site routes,
visual direction, content rendering, search, RSS, SEO metadata, dark mode,
responsive images, code copy controls, and article image viewing.

## Architecture

The project becomes a standalone Hugo site. Root-level `layouts/`, `assets/`,
`content/`, and `static/` are the only runtime sources.

- `layouts/partials/head/` owns metadata, fonts, styles, scripts, and color
  initialization.
- `layouts/partials/media/` owns reusable icon and featured-image lookup.
- `layouts/partials/footer/site-tools.html` owns the back-to-top control.
- `assets/scss/site.scss` is the single stylesheet entry.
- `assets/ts/site.ts` is the single global script entry.
- `assets/ts/search.ts` is loaded only on search-capable pages.
- Project templates own search, 404, RSS, archives, and Markdown render hooks.

## Runtime Behavior

- Global CSS and JavaScript are each emitted once.
- Search reads a generated JSON index and renders escaped matching previews.
- Article images open in a small project-owned lightbox with keyboard close
  support. No CDN gallery dependency remains.
- Dark-mode storage uses the project key `ColorScheme`.
- Comments and math integrations are removed because both are disabled and no
  current content requires them.

## Cleanup

- Delete the entire `themes/` directory and remove `theme:` from `hugo.yaml`.
- Delete project files proven unused by template metrics and generated-output
  inspection.
- Keep `static/favicon.ico` as the conventional browser fallback.
- Keep focused SCSS modules that still serve generated pages; remove only
  modules or selectors proven obsolete during verification.

## Verification

- A dedicated shell regression test checks theme independence and key routes.
- Existing Music and scroll-reveal tests must continue to pass.
- Hugo builds with warnings enabled.
- The home page, post list, article detail, archives, search, 404, and Music
  page are inspected in a browser at desktop and mobile widths.

