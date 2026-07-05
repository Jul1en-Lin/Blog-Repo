#!/usr/bin/env bash
set -euo pipefail

hugo -D --cleanDestinationDir --printI18nWarnings --printPathWarnings >/tmp/hugo-home-social-hover.log

fail() {
    printf 'FAIL: %s\n' "$1" >&2
    exit 1
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

assert_contains '.home-profile__social-link::after{position:absolute;right:0;bottom:0;left:0;height:1px;content:"";background:currentColor;transform:scaleX(0);transform-origin:left;transition:transform var(--duration-normal)var(--ease-out)}' public/css \
    'Home social links should render an animated underline pseudo-element'
assert_contains '.home-profile__social-link:hover::after,.home-profile__social-link:focus-visible::after{transform:scaleX(1)}' public/css \
    'Home social underline should expand from left to right on hover and keyboard focus'
assert_not_contains '.home-profile__social-link:hover,' assets/scss/_home.scss \
    'Home social links should not use a moving hover block'
assert_not_contains 'border-bottom: 1px solid color-mix(in srgb, var(--color-text) 22%, transparent);' assets/scss/_home.scss \
    'Home social links should not use a static border underline'
assert_not_contains '.home-profile__social-link,' assets/scss/_animations.scss \
    'Home social links should not use the shared active press scale'

printf 'PASS: home social hover interaction matches primary navigation underline behavior\n'
