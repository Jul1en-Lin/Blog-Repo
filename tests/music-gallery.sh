#!/usr/bin/env bash
set -euo pipefail

hugo -D --cleanDestinationDir --printI18nWarnings --printPathWarnings >/tmp/hugo-music-gallery.log

music_html="public/music/index.html"

assert_contains() {
    local pattern="$1"
    local path="$2"
    local description="$3"

    if ! rg -Fq -- "$pattern" "$path"; then
        printf 'FAIL: %s\n' "$description" >&2
        exit 1
    fi
}

assert_not_contains() {
    local pattern="$1"
    local path="$2"
    local description="$3"

    if rg -Fq -- "$pattern" "$path"; then
        printf 'FAIL: %s\n' "$description" >&2
        exit 1
    fi
}

assert_contains 'data-music-experience' "$music_html" 'Music page exposes the gallery controller root'
assert_contains 'data-music-intro' "$music_html" 'Music page renders the exhibition prologue'
assert_contains 'Scroll to enter' "$music_html" 'The prologue explains how to enter the gallery'
assert_contains 'data-music-viewport' "$music_html" 'Music page renders a horizontal gallery viewport'
assert_contains 'data-music-track' "$music_html" 'Music page renders a transformable gallery track'
assert_contains 'data-music-detail' "$music_html" 'Music page renders the fullscreen album detail layer'
assert_contains 'role="dialog"' "$music_html" 'Album details use dialog semantics'
assert_contains 'aria-modal="true"' "$music_html" 'Album details announce modal behavior'
assert_contains 'data-music-detail-close' "$music_html" 'Album details provide a close control'
assert_contains 'Sweatshirt' "$music_html" 'The existing album title remains in the exhibition'
assert_contains 'Patrick Hizon / EJEAN' "$music_html" 'The existing album artist remains in the exhibition'

album_count="$(rg -o 'data-music-album' "$music_html" | wc -l | tr -d ' ')"
if [[ "$album_count" != "15" ]]; then
    printf 'FAIL: expected 15 albums, found %s\n' "$album_count" >&2
    exit 1
fi

assert_contains 'data-music-experience' 'public/js' 'The compiled script initializes the gallery'
assert_contains 'requestAnimationFrame' 'public/js' 'Gallery motion is driven by the browser animation frame'
assert_contains 'prefers-reduced-motion' 'public/js' 'Gallery motion respects reduced-motion preferences'
assert_contains 'ArrowRight' 'public/js' 'Keyboard navigation supports the right arrow'
assert_contains 'ArrowLeft' 'public/js' 'Keyboard navigation supports the left arrow'
assert_contains 'Enter' 'public/js' 'Keyboard navigation can open album details'
assert_contains 'Escape' 'public/js' 'Keyboard navigation can close album details'
assert_contains 'Tab' 'public/js' 'Keyboard focus remains inside the album dialog'
assert_contains 'inert' 'public/js' 'Background gallery controls are disabled while details are open'
assert_contains 'navigationIndex' 'assets/ts/site.ts' 'Keyboard navigation is independent from the in-flight visual index'
assert_contains 'returnOffset' 'assets/ts/site.ts' 'Closing details restores the previous gallery position'
assert_contains 'scheduleMusicFrame' 'assets/ts/site.ts' 'Gallery animation wakes only when work is pending'
assert_contains 'pageshow' 'assets/ts/site.ts' 'Gallery animation resumes after browser back-forward cache restoration'

assert_contains 'translate3d' 'public/css' 'The compiled gallery uses GPU-friendly transforms'
assert_contains 'perspective' 'public/css' 'Album covers have restrained dimensional depth'
assert_contains '--gallery-progress' 'public/css' 'The gallery exposes progress to the visual layer'
assert_contains 'prefers-reduced-motion:reduce' 'public/css' 'Reduced-motion styling is preserved'
assert_contains '#f4ebdd' 'public/css' 'The exhibition uses the warm paper background'
assert_contains '#3b332c' 'public/css' 'The exhibition uses the deep brown foreground'
assert_contains 'max-width:1023px' 'public/css' 'Small screens receive the desktop-only notice'

assert_not_contains 'data-album-toggle' "$music_html" 'The old flip-card toggle is removed'
assert_not_contains 'music-album-card__face--back' "$music_html" 'The old card back is removed'
assert_not_contains 'aria-pressed="false"' "$music_html" 'The old flip state is removed'
assert_not_contains '--album-accent' "$music_html" 'Per-album theme colors are removed from markup'
assert_not_contains 'rotateY(180deg)' 'public/css' 'The old card flip is removed from CSS'
assert_not_contains '[data-album-toggle]' 'public/js' 'The old flip controller is removed from JavaScript'
assert_not_contains 'themeColor' 'content/page/music/index.md' 'Per-album theme colors are removed from content'
assert_not_contains 'layout = "standard"' 'content/page/music/index.md' 'Legacy album layout fields are removed from content'

printf 'PASS: Music exhibition structure and behavior are present\n'
