#!/usr/bin/env bash
set -euo pipefail

fail() {
    printf 'FAIL: %s\n' "$1" >&2
    exit 1
}

assert_file() {
    [[ -f "$1" ]] || fail "$2"
}

assert_contains() {
    rg -Fq -- "$1" "$2" || fail "$3"
}

assert_not_contains() {
    if rg -Fq -- "$1" "$2"; then
        fail "$3"
    fi
}

if rg -q '^[[:space:]]*theme:' hugo.yaml; then
    fail 'hugo.yaml must not enable an external theme'
fi

if [[ -d themes ]]; then
    fail 'themes/ must be removed after project-owned templates are complete'
fi

rm -rf public
hugo -D --cleanDestinationDir --printI18nWarnings --printPathWarnings >/tmp/hugo-theme-independence.log

assert_file public/index.html 'Home output is missing'
assert_file public/post/index.html 'Post list output is missing'
assert_file public/archives/index.html 'Archives output is missing'
assert_file public/search/index.html 'Search output is missing'
assert_file public/search/index.json 'Search JSON output is missing'
assert_file public/404.html '404 output is missing'
assert_file public/index.xml 'RSS output is missing'

assert_contains '/css/site.' public/index.html 'Home must load the project stylesheet'
assert_contains '/js/site.' public/index.html 'Home must load the project script'

site_script_count="$(rg -o '/js/site\.[^" ]+\.js' public/index.html | wc -l | tr -d ' ')"
[[ "$site_script_count" == '1' ]] || fail 'Home must load the global project script exactly once'

assert_not_contains '/ts/main.' public/index.html 'Stack main script must not be emitted'
assert_not_contains '/ts/custom.' public/index.html 'Duplicate custom script must not be emitted'
assert_not_contains 'node-vibrant' public/index.html 'Vibrant must not load globally'
assert_not_contains 'photoswipe' public/index.html 'PhotoSwipe CDN assets must be removed'

assert_contains 'class="search-form"' public/search/index.html 'Search page form is missing'
assert_contains '/js/search.' public/search/index.html 'Search page must load its project script'
assert_contains '"title":' public/search/index.json 'Search JSON does not contain page data'
assert_contains '<rss version="2.0"' public/index.xml 'RSS output is invalid'
assert_contains 'class="archives-group"' public/archives/index.html 'Archive groups are missing'

article_html="$(rg -l 'class="gallery-image"' public/p --glob 'index.html' | head -1)"
[[ -n "$article_html" ]] || fail 'No generated article contains a gallery image'
assert_contains 'class="gallery-image"' "$article_html" 'Responsive article images are missing'
assert_contains 'image-lightbox' public/js 'Project image lightbox code is missing'
assert_contains '.image-lightbox' public/css 'Project image lightbox styles are missing'
assert_contains 'addListener' public/js 'Global controls must support legacy matchMedia listeners'
assert_contains 'Site initializer failed' public/js 'Global controls must isolate initializer failures'
assert_contains 'scrollbar-color:var(--article-toc-scrollbar-thumb)' public/css 'Article TOC scrollbar must follow the active color scheme'
assert_not_contains 'drop-shadow(0 0 3px var(--signature-glow))' public/css 'Header signature hover must not show a glow'
assert_not_contains '.site-brand:hover .site-signature__guide' public/css 'Header signature hover must not restart the drawing animation'

printf 'PASS: project builds without Hugo Theme Stack\n'
