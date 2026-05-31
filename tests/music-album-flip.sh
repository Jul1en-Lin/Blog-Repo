#!/usr/bin/env bash
set -euo pipefail

hugo -D --cleanDestinationDir --printI18nWarnings --printPathWarnings >/tmp/hugo-music-album-flip.log

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

assert_contains 'data-album-card' "$music_html" 'Music cards expose flip-card state hooks'
assert_contains 'data-album-toggle' "$music_html" 'Music cards render semantic flip controls'
assert_contains 'aria-pressed="false"' "$music_html" 'Music flip controls expose their initial state'
assert_contains 'music-album-card__inner' "$music_html" 'Music cards render a 3D inner wrapper'
assert_contains 'music-album-card__face--back' "$music_html" 'Music cards render a details back face'
assert_contains '<h2>Sweatshirt</h2>' "$music_html" 'The album title remains available on the details face'
assert_contains '<p class="music-album-card__artist">Patrick Hizon / EJEAN</p>' "$music_html" 'The album artist remains available on the details face'
assert_contains '[data-album-card]' 'public/js' 'The custom script initializes album flipping'
assert_contains 'aria-pressed' 'public/js' 'The custom script updates accessible flip state'
assert_contains 'rotateY(180deg)' 'public/scss' 'The compiled stylesheet contains the 3D flip transform'
assert_contains 'prefers-reduced-motion:reduce' 'public/scss' 'The compiled stylesheet preserves reduced-motion handling'
assert_contains 'transform:none;opacity:0' 'public/scss' 'Reduced-motion mode removes the hidden back-face rotation'
assert_contains '#c46786' 'public/scss' 'The Music waveform uses the requested rose color'
assert_contains '@keyframes music-wave-enter' 'public/scss' 'The Music waveform has a one-time entry animation'
assert_contains 'music-wave-enter 320ms' 'public/scss' 'The Music waveform entry animation lasts about 320ms'
assert_contains 'scale(.97)' 'public/scss' 'Primary interactive controls provide press feedback'
assert_contains 'transition-duration:140ms' 'public/scss' 'Press feedback uses an approximately 140ms response'
assert_contains '--album-accent:' "$music_html" 'Music cards expose per-album accent variables'
assert_contains '--album-accent: #cc9297' "$music_html" 'Sweatshirt uses its album-specific accent color'
assert_contains '--album-accent: #b95f12' "$music_html" 'Saturn uses a different album-specific accent color'
assert_contains 'backdrop-filter' 'public/scss' 'Music card backs use glass blur'
assert_contains 'radial-gradient' 'public/scss' 'Music card backs use layered liquid gradients'
assert_contains 'color-mix' 'public/scss' 'Music card backs mix each album accent into the glass surface'

if rg -Fq -- '.music-album-card__face--back{position:relative' 'public/scss'; then
    printf 'FAIL: Music card backs must stay full-size instead of shrinking to content height\n' >&2
    exit 1
fi

if rg -Fq 'music-album-card__overlay' "$music_html" 'public/scss'; then
    printf 'FAIL: Music card fronts must render cover artwork without metadata overlays\n' >&2
    exit 1
fi

printf 'PASS: Music album flip structure is present\n'
