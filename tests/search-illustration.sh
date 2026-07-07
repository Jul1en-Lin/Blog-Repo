#!/usr/bin/env bash
set -euo pipefail

hugo -D --cleanDestinationDir --printI18nWarnings --printPathWarnings >/tmp/hugo-search-illustration.log

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

assert_file public/search/index.html 'Search output is missing'
assert_file public/404.html '404 output is missing'

assert_contains 'data-search-root' public/search/index.html \
    'Search page should expose a root state container'
assert_contains 'data-search-empty-art' public/search/index.html \
    'Search page should render the illustration container'
assert_contains 'class="search-illustration"' public/search/index.html \
    'Search page should render the Anthropic-style illustration shell'
assert_contains 'class="search-illustration__frame"' public/search/index.html \
    'Search page should render the rounded color block'
assert_contains 'search-illustration.png' public/search/index.html \
    'Search page should reference the provided search illustration PNG'
assert_contains 'data-search-state="empty"' public/search/index.html \
    'Search result region should start in the empty state'
assert_contains 'aria-controls="search-results"' public/search/index.html \
    'Search input should point to the result list'
assert_contains 'aria-describedby="search-status"' public/search/index.html \
    'Search input should point to the live status text'
assert_contains 'id="search-status"' public/search/index.html \
    'Search status should have a stable id'
assert_contains 'id="search-results"' public/search/index.html \
    'Search results should have a stable id'
assert_not_contains 'title="搜索" aria-label="搜索"' public/search/index.html \
    'Search page should not render the right-side search icon button'
assert_not_contains 'as="fetch"' public/search/index.html \
    'Search page should not preload the JSON index when search runs on submit'

assert_contains 'aspect-ratio:16/9' public/css \
    'Search illustration frame should keep the Anthropic 16:9 ratio'
assert_contains 'border-radius:24px' public/css \
    'Search illustration frame should use the Anthropic rounded corners'
assert_contains 'background:#ebcece' public/css \
    'Search illustration frame should use the requested Anthropic color'
assert_contains ':root[data-scheme=dark] .search-illustration__frame{background:#b8607e' public/css \
    'Search illustration frame should use the requested dark-mode color'
assert_contains '.template-search .search-form input{text-align:center}' public/css \
    'Search page input placeholder should be centered'
assert_contains '.template-search .search-result.is-search-has-results' public/css \
    'Search result animation should be scoped to the Search page'
assert_contains '@media(prefers-reduced-motion:reduce)' public/css \
    'Search illustration should respect reduced-motion users'

assert_contains 'is-search-empty' public/js \
    'Search script should include the empty state class'
assert_contains 'is-search-has-results' public/js \
    'Search script should include the result state class'
assert_contains 'is-search-no-results' public/js \
    'Search script should include the no-results state class'
assert_contains 'is-search-error' public/js \
    'Search script should include the error state class'
assert_contains 'is-search-ready' public/js \
    'Search script should restore the illustration when the input receives focus after a search'
assert_contains 'addEventListener("focus"' public/js \
    'Search script should reset the result intro before the next submitted search'
assert_contains 'is-search-intro' public/js \
    'Search script should expose a one-time result intro class'
assert_contains '--search-result-delay' public/js \
    'Search script should stagger the first result intro'
assert_contains '.search-page.is-search-ready .search-illustration' public/css \
    'Search page should animate the illustration back to its original size before a new search'

assert_contains 'data-prefill-path' public/404.html \
    '404 should keep path-based search prefill'
assert_contains 'data-search-form' public/404.html \
    '404 should keep the search form'
assert_contains 'data-search-results' public/404.html \
    '404 should keep the shared search result container'
assert_contains '/js/search.' public/404.html \
    '404 should still load the shared search script'
assert_not_contains 'data-search-empty-art' public/404.html \
    '404 should not render the Search page illustration'

printf 'PASS: search page renders the Anthropic illustration and keeps 404 search intact\n'
