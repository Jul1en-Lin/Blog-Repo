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
assert_contains '@media(prefers-reduced-motion:reduce)' public/css \
    'Route transition styles must respect reduced motion'

printf 'PASS: route transition demo assets are present\n'
