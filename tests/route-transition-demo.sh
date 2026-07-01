#!/usr/bin/env bash
set -euo pipefail

fail() {
    printf 'FAIL: %s\n' "$1" >&2
    exit 1
}

assert_contains() {
    rg -Fq -- "$1" "$2" || fail "$3"
}

rm -rf public
hugo -D --cleanDestinationDir --printI18nWarnings --printPathWarnings >/tmp/hugo-route-transition-demo.log

[[ -f public/index.html ]] || fail 'Home output is missing'

assert_contains 'id="route-transition-mask"' public/index.html \
    'Route transition mask must be rendered globally'
assert_contains 'route-transition__loading' public/index.html \
    'Route transition loading label must be rendered globally'
assert_contains 'route-transition-mask' public/js \
    'Global project script must bind the route transition mask'
assert_contains 'RouteTransitionPreviewState' public/js \
    'Route transition script must persist the transition origin across pages'
assert_contains 'routeTransitioning' public/js \
    'Route transition script must mark active transitions'
assert_contains '.route-transition-mask' public/css \
    'Route transition styles must be compiled'
assert_contains 'font-family:var(--font-body)' public/css \
    'Route transition loading must use the blog body font'
assert_contains '@media(prefers-reduced-motion:reduce)' public/css \
    'Route transition styles must respect reduced motion'

if rg -q '\.route-transition__loading\{[^}]*font-family:var\(--font-mono\)' public/css; then
    fail 'Route transition loading must not use the mono font'
fi

if rg -Fq '.route-transition__loading{position:absolute;top:50%;left:50%;display:inline-flex;align-items:center;justify-content:center;min-width:' public/css; then
    fail 'Route transition loading must not keep the old pill backdrop sizing'
fi

if rg -Fq 'background:color-mix(in srgb,var(--color-surface)' public/css; then
    fail 'Route transition loading must not render a white surface backdrop'
fi

if rg -Fq 'box-shadow:0 8px 22px' public/css; then
    fail 'Route transition loading must not render a shadowed pill backdrop'
fi

if rg -Fq 'border:1px solid color-mix(in srgb,var(--color-text) 7%,transparent)' public/css; then
    fail 'Route transition loading must not render a pill border'
fi

printf 'PASS: route transition demo assets are present\n'
