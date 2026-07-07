# Project Status

Last updated: 2026-07-07

## Current Snapshot

- This is a standalone Hugo personal blog. `themes/` and the `theme:` setting are gone.
- Active site code lives in root-owned `layouts/`, `assets/scss/`, `assets/ts/`, `assets/icons/`, `content/`, and `static/`.
- Blog posts use Hugo page bundles: `content/post/<Post Title>/index.md` plus article assets under `content/post/<Post Title>/assets/`.
- Music is a static editorial album wall from `content/page/music/index.md` and local cover images. Do not add playback, playlist, sort, filter, or view-switch UI unless asked.
- Generated output lives under `public/` and `resources/`; do not edit those by hand.

## Active Docs

- `AGENTS.md`: repo rules and agent instructions.
- `docs/project_status.md`: current snapshot, blocker, and handoff note only.
- `docs/agent_workflow.md`: when to update status, commit checks, and handoff rules.
- `docs/archive/`: historical plans, prior status history, and older full-doc notes. Treat archived files as reference, not current truth.

## Current Rules

- Use `params.primaryNav` in `hugo.yaml` for navigation changes.
- Keep shared head, media, footer tools, list behavior, and article helpers in project partials.
- Keep Blog detail pages as wide reading pages without a right sidebar.
- For Obsidian imports, convert wikilinks and image embeds to Hugo-compatible Markdown, copy required assets into the post bundle, and remove opening `相关笔记` backlink lines unless asked to keep them.
- Do not update this file for ordinary same-turn edits. Update it only when the current goal, branch, blocker, next action, or handoff state changes in a way the next agent needs to know.

## Checks

- Preferred local verification: `hugo -D --cleanDestinationDir --printI18nWarnings --printPathWarnings`.
- Use focused regression scripts from `tests/` for touched surfaces.
- For docs-only edits, `git diff --check` is usually enough.

## Open Blockers

- None.

## Next Actions

1. For normal blog/content/style tasks, read `AGENTS.md` and this file, then inspect only the relevant source area.
2. Update this file only if the work leaves useful state for a future session.
