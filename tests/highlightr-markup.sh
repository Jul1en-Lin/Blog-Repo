#!/usr/bin/env bash
set -euo pipefail

fail() {
    printf 'FAIL: %s\n' "$1" >&2
    exit 1
}

assert_contains() {
    rg -Fq -- "$1" "$2" || fail "$3"
}

violations=''

while IFS= read -r -d '' markdown_file; do
    file_violations="$(
        awk '
            /^[[:space:]]*<mark[[:space:]]+class="hltr-[^"]+">.*<\/mark>[[:space:]]*$/ {
                if (NR > 1 && previous_line !~ /^[[:space:]]*$/) {
                    printf "%s:%d\n", FILENAME, NR
                }
            }
            {
                previous_line = $0
            }
        ' "$markdown_file"
    )"

    if [[ -n "$file_violations" ]]; then
        violations+="${file_violations}"$'\n'
    fi
done < <(find content -type f -name '*.md' -print0)

if [[ -n "$violations" ]]; then
    printf '%s' "$violations" >&2
    fail 'standalone Highlightr labels must be preceded by a blank line'
fi

article_styles='assets/scss/_article.scss'

assert_contains '.article-detail__content mark[class^="hltr-"]' "$article_styles" \
    'article Highlightr styles must be scoped to hltr-* marks'
assert_contains '.article-detail__content .hltr-green-light' "$article_styles" \
    'Green-light Highlightr color is missing'
assert_contains '.article-detail__content .hltr-pink' "$article_styles" \
    'Pink Highlightr color is missing'
assert_contains '.article-detail__content .hltr-orange' "$article_styles" \
    'Orange Highlightr color is missing'
assert_contains '.article-detail__content .hltr-cyan' "$article_styles" \
    'Cyan Highlightr color is missing'
assert_contains '.article-detail__content .hltr-blue' "$article_styles" \
    'Blue Highlightr color is missing'
assert_contains '.article-detail__content .hltr-purple' "$article_styles" \
    'Purple Highlightr color is missing'
assert_contains '.article-detail__content .hltr-grey' "$article_styles" \
    'Grey Highlightr color is missing'

printf 'PASS: Highlightr Markdown and article styles are valid\n'
