#!/usr/bin/env bash
set -euo pipefail

hugo -D --cleanDestinationDir --printI18nWarnings --printPathWarnings >/tmp/hugo-scroll-reveal.log

assert_contains() {
    local pattern="$1"
    local path="$2"
    local description="$3"

    if ! rg -Fq -- "$pattern" "$path"; then
        printf 'FAIL: %s\n' "$description" >&2
        exit 1
    fi
}

assert_contains '.article-detail__content > blockquote' 'public' 'Article reveal targets blockquotes instead of every body child'
assert_contains '.article-detail__content > .table-wrapper' 'public' 'Article reveal targets table wrappers as stable content blocks'
assert_contains '.article-detail__content > .highlight' 'public' 'Article reveal targets code blocks'
assert_contains '.music-album-card' 'public' 'Music album cards remain scroll-reveal targets'
assert_contains 'IntersectionObserver' 'public' 'Scroll reveal uses intersection observation'
assert_contains 'article-detail__content .reveal-on-scroll' 'public/css' 'Article content reveal has a quieter motion treatment'

if rg -Fq -- '.article-detail__content > *' 'public'; then
    printf 'FAIL: Article body text must not reveal every direct child while reading\n' >&2
    exit 1
fi

printf 'PASS: Scroll reveal stays scoped to stable blocks\n'
