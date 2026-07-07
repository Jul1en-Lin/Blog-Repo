# AGENTS.md

## Repository Notes

- This is a standalone Hugo personal blog.
- The project no longer has a `themes/` directory or a `theme:` setting in `hugo.yaml`. Treat old theme references in older docs as historical unless `docs/project_status.md` says otherwise.
- Current source layout:
  - `hugo.yaml`: site config, languages, permalinks, `params.primaryNav`, social icons, Markdown/render settings, and feature params.
  - `layouts/`: project-owned Hugo templates. `_default/` owns base/list/single/RSS/archive and Markdown render hooks; `page/` owns Music and Search; `partials/` owns head metadata/resources, header, article pieces, media helpers, footer scripts, and shared page sections.
  - `assets/scss/`: SCSS modules. `site.scss` is the global entry; `_article.scss`, `_collections.scss`, `_music.scss`, `_utility-pages.scss`, `_route-transition.scss`, `_lightbox.scss`, and related partials split page and interaction styles.
  - `assets/ts/`: `site.ts` owns global browser behavior; `search.ts` is the Search page script.
  - `assets/icons/`: project SVG icons referenced by config/templates.
  - `content/post/`: blog articles. New published articles should use Hugo page bundles.
  - `content/page/`: standalone pages such as `archives`, `music`, and `search`; Music cover images live in the Music page bundle.
  - `content/categories/`: taxonomy landing content.
  - `static/`: passthrough files such as favicons.
  - `tests/`: shell regression checks for generated output and browser-facing behavior.
  - `docs/`: setup-light workflow notes. `docs/project_status.md` is the current snapshot; `docs/agent_workflow.md` is the process guide; `docs/archive/` keeps historical notes.
  - `public/` and `resources/`: generated output and Hugo caches; do not edit them by hand.
- Preserve the quiet, minimal, editorial music visual direction documented in `docs/archive/blog-refactor-plan.md` and the current notes in `docs/project_status.md`.
- For future design work, reference the mature existing project at `/Users/lien/GitRepo/hugo-antfustyle` first; adapt its proven patterns while preserving this blog's own content, colors, and editorial music direction.
- For navigation changes, use `params.primaryNav` in `hugo.yaml` as the source of truth.
- For local verification, prefer `hugo -D --cleanDestinationDir --printI18nWarnings --printPathWarnings` when Hugo is available.

## Blog Post Import Rules

- Published blog articles live under `content/post/<Post Title>/index.md` as Hugo page bundles.
- Article-local images and screenshots live under `content/post/<Post Title>/assets/`.
- Do not keep source-note `.md` backups inside post bundles unless the user asks to preserve them.
- When importing from Obsidian, start by inspecting existing folders under `content/post/` to match front matter, categories, tags, image paths, and article style.
- Convert Obsidian wikilinks such as `[[Spring Cloud|微服务 知识总结]]` to Hugo-compatible Markdown links or `relref` shortcodes.
- Convert Obsidian image embeds such as `![[image.png|500]]` to Markdown image links like `![description](assets/image.png)` and copy the referenced image into the article bundle.
- Remove opening Obsidian `相关笔记` backlink lines unless the user explicitly wants them preserved.
- Keep imported technical notes as `draft = false` only when the user asks to publish or push them to the blog.

<!-- BEGIN: setup-long-term-docs -->

## Lightweight agent workflow

This repository uses a setup-light workflow: enough continuity for future agents, without turning docs into a task log.

### Documentation sources of truth

- `AGENTS.md`: agent instructions and repo-specific rules.
- `docs/project_status.md`: current snapshot, open blocker, and handoff note.
- `docs/agent_workflow.md`: status, commit, and handoff workflow.
- `docs/archive/`: historical notes and older plans. Do not treat archived files as current unless the active docs point there.

### Required rules

- Read `docs/project_status.md` before making code, content, or workflow changes when it exists.
- Do not update `docs/project_status.md` for routine same-turn edits that are already explained in the final reply.
- Update `docs/project_status.md` only when the current goal, branch, blocker, next action, or handoff state changes in a way a future agent needs to know.
- Keep updates short. Do not add architecture, planning, spec, decision, changelog, or bug-report files unless the user asks.
- Before any git commit, decide whether `docs/project_status.md` actually needs an update; default to no for finished small edits.
- Commit only files related to the current work. Do not sweep unrelated files into commits.
- Do not push unless the user explicitly asks or the current task grants push/publish authorization.
- Summarize changed files, checks run, and remaining risks.

### Detailed workflows

For status, commit, and handoff details, read `docs/agent_workflow.md`.

<!-- END: setup-long-term-docs -->
