#!/usr/bin/env bash
set -euo pipefail

hugo -D --cleanDestinationDir --printI18nWarnings --printPathWarnings >/tmp/hugo-article-toc.log

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

article_html="public/p/seata/index.html"

assert_file "$article_html" 'Seata article output is missing'
assert_contains 'data-article-toc' "$article_html" 'Article TOC rail is missing'
assert_contains 'data-article-toc-toggle' "$article_html" 'Article TOC toggle is missing'
assert_not_contains 'article-detail__toc-staff' "$article_html" 'Article TOC should not render the old music staff decoration'

assert_contains 'is-article-toc-active' public/js 'Article TOC script should track the active section'
assert_contains 'is-article-toc-current' public/js 'Article TOC script should mark the current section'
assert_contains 'aria-current' public/js 'Article TOC script should mark the current link for assistive tech'
assert_contains 'data-article-toc-link' public/js 'Article TOC script should normalize TOC links'
assert_contains 'is-article-toc-auto-revealing' public/js \
    'Article TOC should auto reveal when scrolling reaches a new heading'
assert_not_contains '2600' public/js \
    'Article TOC auto reveal should stay visible instead of closing on a timer'

assert_contains '.article-detail__toc-rail.is-article-toc-active .article-detail__toc-panel' public/css \
    'Article TOC should reveal from its own active class'
assert_contains '.article-detail__toc-nav #TableOfContents>ol>li>ol' public/css \
    'Article TOC should keep first article heading group readable'
assert_contains '.article-detail__toc-nav #TableOfContents li.is-article-toc-current>a' public/css \
    'Article TOC should style the current section'
assert_contains '.article-detail__toc-nav #TableOfContents a[aria-current=location]' public/css \
    'Article TOC should style aria-current links'
assert_contains '.article-detail__toc-nav #TableOfContents a{position:relative;display:block;width:100%;padding:12px 0;border-bottom:1px solid var(--article-toc-rule);color:var(--article-toc-muted);font-family:var(--font-display),noto sans sc,serif' public/css \
    'Article TOC should use the article reading font stack'
assert_not_contains '.article-detail__toc-nav #TableOfContents a:hover,.article-detail__toc-nav #TableOfContents a:focus-visible{transform:translateX(2px)}' public/css \
    'Article TOC hover should highlight without shifting text'

printf 'PASS: Article TOC keeps the Anthropic-style reveal behavior\n'
