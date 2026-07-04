#!/usr/bin/env bash
set -euo pipefail

fail() {
  echo "FAIL: $*" >&2
  exit 1
}

SITE_TS="assets/ts/site.ts"
DARK_MODE_SCSS="assets/scss/_dark-mode.scss"

[[ -f "$SITE_TS" ]] || fail "$SITE_TS is missing"
[[ -f "$DARK_MODE_SCSS" ]] || fail "$DARK_MODE_SCSS is missing"

rg -q 'startViewTransition' "$SITE_TS" \
  || fail "Theme toggle should keep the View Transitions API animation"
rg -q 'const currentScheme = getCurrentScheme\(\);' "$SITE_TS" \
  || fail "Theme toggle should base animation direction on the scheme before toggling"
rg -q 'const nextScheme: ColorScheme = currentScheme === '\''dark'\'' \? '\''light'\'' : '\''dark'\'';' "$SITE_TS" \
  || fail "Theme toggle should derive the next scheme from the current scheme"
rg -q 'dataset\.themeTransitionDirection' "$SITE_TS" \
  || fail "Theme toggle should expose the transition direction to CSS"
rg -q 'dark-to-light' "$SITE_TS" \
  || fail "Theme toggle should label dark-to-light transitions"
rg -q 'light-to-dark' "$SITE_TS" \
  || fail "Theme toggle should label light-to-dark transitions"
rg -Fq "'::view-transition-old(root)'" "$SITE_TS" \
  || fail "Theme toggle should animate the old root snapshot when leaving dark mode"
rg -Fq "'::view-transition-new(root)'" "$SITE_TS" \
  || fail "Theme toggle should animate the new root snapshot when entering dark mode"
rg -Fq "'::view-transition-old(theme-header)'" "$SITE_TS" \
  || fail "Theme toggle should animate the old header snapshot"
rg -Fq "'::view-transition-new(theme-header)'" "$SITE_TS" \
  || fail "Theme toggle should animate the new header snapshot"
rg -Fq "'::view-transition-old(theme-content)'" "$SITE_TS" \
  || fail "Theme toggle should animate the old content snapshot"
rg -Fq "'::view-transition-new(theme-content)'" "$SITE_TS" \
  || fail "Theme toggle should animate the new content snapshot"
rg -q 'getSnapshotClipPath' "$SITE_TS" \
  || fail "Theme toggle should calculate clip paths per snapshot bounds"

rg -q 'data-theme-transition-direction="dark-to-light".*::view-transition-old\(root\)' "$DARK_MODE_SCSS" \
  || fail "Dark-to-light transitions should put the old root snapshot above"
rg -q 'data-theme-transition-direction="light-to-dark".*::view-transition-new\(root\)' "$DARK_MODE_SCSS" \
  || fail "Light-to-dark transitions should put the new root snapshot above"
rg -q 'data-theme-transition-direction.*\.site-header' "$DARK_MODE_SCSS" \
  || fail "Theme transitions should give the header its own snapshot group"
rg -q 'view-transition-name: theme-header' "$DARK_MODE_SCSS" \
  || fail "Header snapshot group should be named theme-header"
rg -q 'data-theme-transition-direction.*\.main-content' "$DARK_MODE_SCSS" \
  || fail "Theme transitions should give page content its own snapshot group"
rg -q 'view-transition-name: theme-content' "$DARK_MODE_SCSS" \
  || fail "Main content snapshot group should be named theme-content"
rg -q '::view-transition-group\(theme-header\)' "$DARK_MODE_SCSS" \
  || fail "Header snapshot group should be styled above the root snapshots"
rg -q '::view-transition-group\(theme-content\)' "$DARK_MODE_SCSS" \
  || fail "Content snapshot group should be styled above the root snapshots"
perl -0ne 'exit(/::view-transition-group\(theme-content\)\s*\{[^}]*animation:\s*none/s ? 0 : 1)' "$DARK_MODE_SCSS" \
  || fail "Content snapshot group should not run the default group animation"
perl -0ne 'exit(/::view-transition-group\(theme-header\)\s*\{[^}]*animation:\s*none/s ? 0 : 1)' "$DARK_MODE_SCSS" \
  || fail "Header snapshot group should not run the default group animation"
rg -q '::view-transition-old\(theme-header\)' "$DARK_MODE_SCSS" \
  || fail "Header snapshots should opt out of default snapshot blending"
rg -q '::view-transition-old\(theme-content\)' "$DARK_MODE_SCSS" \
  || fail "Content snapshots should opt out of default snapshot blending"

if rg -q 'data-scheme="dark".*::view-transition-(old|new)\(root\)' "$DARK_MODE_SCSS"; then
  fail "View transition snapshot stacking should not depend on the final color scheme"
fi

hugo -D --cleanDestinationDir --printI18nWarnings --printPathWarnings >/tmp/hugo-theme-toggle-view-transition.log

[[ -d public/css ]] || fail "public/css was not generated"
rg -q 'data-theme-transition-direction=dark-to-light.*::view-transition-old\(root\)' public/css \
  || fail "Generated CSS should keep dark-to-light old-root stacking"
rg -q 'data-theme-transition-direction=light-to-dark.*::view-transition-new\(root\)' public/css \
  || fail "Generated CSS should keep light-to-dark new-root stacking"
rg -q 'view-transition-name:theme-header' public/css \
  || fail "Generated CSS should keep the header snapshot group"
rg -q 'view-transition-name:theme-content' public/css \
  || fail "Generated CSS should keep the content snapshot group"
rg -q '::view-transition-group\(theme-header\)' public/css \
  || fail "Generated CSS should style the header snapshot group"
rg -q '::view-transition-group\(theme-content\)' public/css \
  || fail "Generated CSS should style the content snapshot group"
rg -q 'view-transition-old\(theme-header\)' public/js \
  || fail "Generated JS should animate the header snapshots"
rg -q 'view-transition-old\(theme-content\)' public/js \
  || fail "Generated JS should animate the content snapshots"

echo "PASS: Theme toggle view transition stacking is direction-aware"
