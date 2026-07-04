#!/usr/bin/env bash
set -euo pipefail

hugo -D --cleanDestinationDir --printI18nWarnings --printPathWarnings >/tmp/hugo-site-header-layout.log

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
assert_file public/post/index.html 'Blog output is missing'
assert_file public/search/index.html 'Search output is missing'
assert_file public/music/index.html 'Music output is missing'
assert_file public/p/seata/index.html 'Article output is missing'

assert_contains '/css/site.' public/index.html 'Home must load the shared site stylesheet'
assert_contains '/css/site.' public/post/index.html 'Blog must load the shared site stylesheet'
assert_contains '/css/site.' public/search/index.html 'Search must load the shared site stylesheet'
assert_contains '/css/site.' public/music/index.html 'Music must load the shared site stylesheet'

assert_contains '--layout-header-width:min(1280px, calc(100vw - clamp(48px, 6vw, 104px)))' public/css \
    'Global CSS should define the compact header shell width'
assert_contains '--layout-header-left:calc((100vw - var(--layout-header-width)) / 2)' public/css \
    'Global CSS should define the compact header shell offset'
assert_contains '.site-header__inner{display:flex;align-items:center;justify-content:space-between;gap:clamp(var(--space-5),4vw,var(--space-8));width:var(--layout-header-width)' public/css \
    'Site header should use the compact global shell width'
assert_not_contains 'body.template-article-detail .site-header__inner' public/css \
    'Article page should not keep a page-specific header width override'
assert_contains '--article-toc-left:max(clamp(28px, 3.25vw, 58px), var(--layout-header-left));' public/css \
    'Article TOC should align with the compact global header shell'

printf 'PASS: global header shell is shared across primary pages\n'
