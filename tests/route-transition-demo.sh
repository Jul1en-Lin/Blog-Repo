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
[[ -f public/image/transition-bg2.png ]] || fail 'Route transition background image is missing'

assert_contains 'id="route-transition-mask"' public/index.html \
    'Route transition mask must be rendered globally'
assert_contains 'route-transition__loading' public/index.html \
    'Route transition loading label must be rendered globally'
assert_contains 'Loading...' public/index.html \
    'Route transition loading label must match the reference capitalization'
assert_contains 'route-transition__sparkle' public/index.html \
    'Route transition loading label must include the small sparkle ornament'
assert_contains 'route-transition__rule' public/index.html \
    'Route transition loading label must include the short divider rule'
assert_contains 'route-transition__dots' public/index.html \
    'Route transition loading label must include trailing dots'
assert_contains 'route-transition-mask' public/js \
    'Global project script must bind the route transition mask'
assert_contains 'RouteTransitionDirectionState' public/js \
    'Route transition script must persist left-to-right reveal state across pages'
assert_contains 'routeTransitioning' public/js \
    'Route transition script must mark active transitions'
assert_contains '.route-transition-mask' public/css \
    'Route transition styles must be compiled'
assert_contains '/image/transition-bg2.png' public/css \
    'Route transition styles must use the second provided background image'
assert_contains 'left:36%' public/css \
    'Route transition loading must sit left of center'
assert_contains 'font-family:var(--font-display)' public/css \
    'Route transition loading must use the blog display font'
assert_contains 'clip-path:inset(0 100% 0 0)' public/css \
    'Route transition must start from the left edge'
assert_contains 'clip-path:inset(0 0 0 0)' public/css \
    'Route transition must sweep left to right'
assert_contains '960ms' public/css \
    'Route transition cover animation must be slower for review'
assert_contains 'transition:clip-path 960ms linear' public/css \
    'Route transition must reveal at a steady left-to-right pace'
assert_contains '@media(prefers-reduced-motion:reduce)' public/css \
    'Route transition styles must respect reduced motion'

if rg -Fq 'route-transition-x' public/js public/css; then
    fail 'Route transition must not use click-origin geometry in the fixed left-to-right demo'
fi

if rg -Fq 'route-transition__staff' public/index.html public/css; then
    fail 'Route transition loading must not render staff lines beside the label'
fi

if rg -Fq 'route-transition__note' public/index.html public/css; then
    fail 'Route transition loading must not render the old music note elements'
fi

if rg -Fq 'LOADING...' public/index.html public/css; then
    fail 'Route transition loading must not use the old uppercase text'
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

if rg -Fq 'route-transition-mask__texture' public/index.html public/css; then
    fail 'Route transition background must not add a synthetic texture overlay'
fi

if rg -Fq 'transparent 15px,color-mix(in srgb,var(--color-text) 2.5%,transparent) 16px' public/css; then
    fail 'Route transition background must not add synthetic line texture'
fi

if rg -Fq 'var(--route-transition-line)' public/css; then
    fail 'Route transition background must not add vertical grid lines'
fi

if rg -Fq '520' public/js; then
    fail 'Route transition loading must not wait until the background is nearly complete'
fi

printf 'PASS: route transition demo assets are present\n'
