# Architecture

Current architecture notes for this standalone Hugo blog.

## Source Of Truth

- `hugo.yaml` owns site config, languages, permalinks, feature params, social icons, and `params.primaryNav`.
- Use `params.primaryNav` for navigation changes.

## Templates

- `layouts/` owns project templates.
- `layouts/_default/` owns generic pages, Markdown render hooks, RSS, list, single, archive, and base templates.
- `layouts/page/` owns Music and Search page templates.
- `layouts/partials/` owns head, header, media helpers, footer scripts, article pieces, and shared page sections.

## Resources

- Active Hugo resource entries are `assets/scss/site.scss`, `assets/ts/site.ts`, and `assets/ts/search.ts`.
- Project icons live in `assets/icons/`.

## Content

- Blog posts use Hugo page bundles: `content/post/<Post Title>/index.md` plus local files under `content/post/<Post Title>/assets/`.
- Some older post bundles still contain source-note `.md` files or nested Obsidian-style folders. Do not copy that pattern for new imports.
- `content/page/` drives Archives, Search, and Music.
- Music data and cover images live in the Music page bundle.
- `content/categories/` owns taxonomy landing content.

## Static And Generated Files

- `static/` is only for passthrough favicons.
- `tests/` contains shell regression checks for generated output and browser-facing behavior.
- `public/` and `resources/` are generated or cached output. Do not edit them by hand.
