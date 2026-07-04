#!/usr/bin/env bash
set -euo pipefail

hugo -D --cleanDestinationDir --printI18nWarnings --printPathWarnings >/tmp/hugo-article-spacing.log

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

assert_contains '.article-detail__content p{margin-bottom:var(--space-5)}' public/css \
    'Article paragraphs should use the tighter 24px vertical rhythm'
assert_contains '.article-detail__content p:has(+ul),.article-detail__content p:has(+ol){margin-bottom:var(--space-4)}' public/css \
    'Paragraphs that introduce lists should sit closer to their list'
assert_contains '.article-detail__content h1,.article-detail__content h2{margin:40px 0 12px}' public/css \
    'Article h2 spacing should be tighter without changing its type scale'
assert_contains '.article-detail__content h2{font-size:clamp(25px,2vw,32px)}' public/css \
    'Article h2 type scale should stay unchanged'
assert_contains '.article-detail__content h3,.article-detail__content h4{margin:var(--space-6)0 10px}' public/css \
    'Article lower heading spacing should be tighter'
assert_contains '.article-detail__content ul,.article-detail__content ol{margin:0 0 var(--space-5);padding-left:var(--space-6)}' public/css \
    'Article lists should keep their indent while tightening bottom spacing'
assert_contains '.article-detail__content img{height:auto;margin:28px auto;border-radius:var(--radius-sm)' public/css \
    'Article images should only tighten their outer vertical margin'
assert_contains '.article-content.article-detail__content pre,.article-content.article-detail__content .highlight{' public/css \
    'Article code block styles should still be present'
assert_contains 'margin:28px 0;padding:0;border:1px solid var(--code-border)' public/css \
    'Article code blocks should only tighten their outer vertical margin'
assert_contains '.article-detail__content .mermaid-diagram{width:100%;max-width:100%;margin:28px 0;padding:clamp(16px,2.4vw,28px)' public/css \
    'Mermaid diagrams should keep their bounds while tightening vertical margin'
assert_contains '.article-detail__content .table-wrapper{overflow-x:auto;width:100%;max-width:100%;margin:40px 0;border:1px solid var(--color-border-light)' public/css \
    'Article tables should keep their bounds while tightening vertical margin'
assert_contains '@media(max-width:560px){.article-detail__summary{font-size:17.5px}' public/css \
    'Mobile article styles should still compile in the existing breakpoint'
assert_contains '.article-detail__content p,.article-detail__content ul,.article-detail__content ol{margin-bottom:22px}' public/css \
    'Mobile paragraphs and lists should use the tighter 22px vertical rhythm'
assert_contains '.article-detail__content h1,.article-detail__content h2{margin:var(--space-6)0 10px}' public/css \
    'Mobile h2 spacing should be tighter'
assert_contains '.article-detail__content h3,.article-detail__content h4{margin:28px 0 var(--space-2)}' public/css \
    'Mobile lower heading spacing should be tighter'

printf 'PASS: Article vertical spacing CSS is present\n'
