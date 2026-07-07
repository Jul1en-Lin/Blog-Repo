# Theme Toggle Contrast Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the header theme-toggle icon read as bright as the neighboring social icons in both site schemes.

**Architecture:** Keep the change at the project stylesheet boundary. Add a narrowly scoped default color override for the existing theme-toggle button, then verify the rendered header rather than changing templates or SVG assets.

**Tech Stack:** Hugo, SCSS, project-level header partials, browser verification.

---

## File Structure

- Modify `assets/scss/_header.scss` to tune the theme-toggle button default color.
- Modify `docs/changelog.md` because the header appearance changes for users.
- Modify `docs/project_status.md` to record the current header polish and verification.

### Task 1: Theme Toggle Color

**Files:**
- Modify: `assets/scss/_header.scss`

- [ ] **Step 1: Capture the current mismatch**

Run the local preview and inspect the header in light and dark schemes. Expected: the sun and moon icon strokes look lighter than the GitHub and Instagram icons before the stylesheet override.

- [ ] **Step 2: Add the scoped default color override**

In `assets/scss/_header.scss`, extend the existing theme-toggle rule while keeping the shared hover/focus rule untouched:

```scss
#dark-mode-toggle.theme-toggle {
  gap: 0;
  color: color-mix(in srgb, var(--color-text) 78%, transparent);
}
```

- [ ] **Step 3: Verify the visual behavior**

Inspect light and dark schemes in the browser. Expected: the sun and moon icons carry more visual weight at rest, the social icons remain unchanged, and hover/focus still brighten and lift the control.

### Task 2: Documentation And Verification

**Files:**
- Modify: `docs/changelog.md`
- Modify: `docs/project_status.md`

- [ ] **Step 1: Record the user-visible polish**

Add a short changelog entry and status note that the header theme toggle default contrast was aligned with the social icon group.

- [ ] **Step 2: Run repository verification**

Run:

```bash
hugo -D --cleanDestinationDir --printI18nWarnings --printPathWarnings
git diff --check
```

Expected: Hugo builds with only existing project warnings and the diff whitespace check passes.

- [ ] **Step 3: Review the final diff**

Run:

```bash
git diff -- assets/scss/_header.scss docs/changelog.md docs/project_status.md
```

Expected: the diff is limited to the scoped header color change and its documentation.

