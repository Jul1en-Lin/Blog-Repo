#!/usr/bin/env bash
set -euo pipefail

hugo -D --cleanDestinationDir --printI18nWarnings --printPathWarnings >/tmp/hugo-home-hourglass.log

fail() {
    printf 'FAIL: %s\n' "$1" >&2
    exit 1
}

assert_file() {
    [[ -f "$1" ]] || fail "$2"
}

assert_contains() {
    local pattern="$1"
    local path="$2"
    local description="$3"

    if ! rg -Fq -- "$pattern" "$path"; then
        fail "$description"
    fi
}

assert_not_contains() {
    local pattern="$1"
    local path="$2"
    local description="$3"

    if rg -Fq -- "$pattern" "$path"; then
        fail "$description"
    fi
}

assert_file public/index.html 'Home output is missing'

assert_contains 'class="home-hourglass"' public/index.html \
    'Home should render the hourglass illustration container'
assert_contains 'home-hourglass.png' public/index.html \
    'Home should reference the provided hourglass image'
assert_not_contains 'home-profile__divider' public/index.html \
    'Home should not render standalone divider lines between sections'
assert_not_contains 'Or keep reading through the blog archive.' public/index.html \
    'Home should not render the old blog archive prompt'
assert_contains 'body.template-home .home-profile__recent,body.template-home .home-profile__find{margin-top:calc(var(--space-7) * 2 + 1px)}' public/css \
    'Home sections should keep the old divider spacing without rendering divider lines'
assert_contains '.home-profile__prose{position:relative;width:100%;margin-top:var(--space-6)}' public/css \
    'Home prose should span the reading column so the hourglass can align with the post dates'
assert_contains '.home-hourglass{--home-hourglass-image-size:clamp(118px, 9vw, 158px);position:absolute;top:-61px;right:0;display:grid;width:calc(var(--home-hourglass-image-size) + 36px);padding:18px;place-items:center;border-radius:16px;background:#cbcadb;pointer-events:none' public/css \
    'Hourglass color block should align to the reading column edge without reserving a right column'
assert_contains '.home-hourglass__image{width:var(--home-hourglass-image-size);height:auto;object-fit:contain' public/css \
    'Hourglass image should keep its display size and natural proportions'
assert_not_contains '.home-profile-shell' public/css \
    'Home should not reserve a separate right-side illustration column'
assert_contains '.home-hourglass{display:none}' public/css \
    'Hourglass should be hidden on narrow screens'

printf 'PASS: home hourglass illustration keeps its position with the color block restored\n'
