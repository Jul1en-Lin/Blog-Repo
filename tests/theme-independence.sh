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
assert_file public/p/seata/index.html 'Seata article output is missing'
assert_file public/p/redis-缓存/index.html 'Redis cache article output is missing'

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
assert_contains '.article-detail__content mark[class^=hltr-]' public/css 'Article Highlightr styles are missing'
assert_contains '<p><mark class="hltr-pink">缺点</mark></p>' public/p/seata/index.html \
    'Seata XA drawbacks label must render as a standalone paragraph'
assert_not_contains '<mark class="hltr-pink">缺点</mark></li>' public/p/seata/index.html \
    'Seata XA drawbacks label must not be merged into a list item'
assert_contains '<mark class="hltr-green-light">不是很多 key 同时失效，而是针对热点 key 失效</mark>' \
    public/p/redis-缓存/index.html 'Redis cache breakdown explanation must keep its Highlightr markup'
assert_contains '<figure class="mermaid-diagram">' public/p/seata/index.html \
    'Mermaid code blocks must render as diagram containers'
assert_contains 'class="mermaid"' public/p/seata/index.html \
    'Mermaid diagram source container is missing'
assert_contains 'mermaid@11.15.0/dist/mermaid.esm.min.mjs' public/p/seata/index.html \
    'Mermaid articles must load the pinned Mermaid module'
assert_contains 'svg.viewBox.baseVal.width' public/p/seata/index.html \
    'Mermaid diagrams must preserve their readable intrinsic width on narrow screens'
assert_contains '.article-detail__content .mermaid-diagram{width:100%;max-width:100%;margin:28px 0' public/css \
    'Mermaid diagram boundaries must match article images and tables'
assert_contains '--mermaid-intrinsic-width' public/css \
    'Narrow Mermaid diagrams must scroll inside their container instead of overflowing the page'
assert_not_contains 'mermaid@11.15.0/dist/mermaid.esm.min.mjs' public/index.html \
    'Home must not load Mermaid'
assert_not_contains 'mermaid@11.15.0/dist/mermaid.esm.min.mjs' public/p/redis-缓存/index.html \
    'Articles without Mermaid diagrams must not load Mermaid'

recent_article_html=(
    public/p/seata/index.html
    public/p/redis-缓存/index.html
    public/p/redis-集群/index.html
    public/p/docker-部署-redis-集群/index.html
    public/p/api-类型总结/index.html
    public/p/redis-哨兵/index.html
    public/p/codex-工作流更新-v2/index.html
    public/p/sentinel/index.html
)

for recent_article in "${recent_article_html[@]}"; do
    assert_file "$recent_article" "Recent article output is missing: $recent_article"
    assert_not_contains '**' "$recent_article" "Recent article contains unparsed emphasis markers: $recent_article"
done

source_highlightr_count="$(rg -o 'class="hltr-[^"]+"' content/post --glob '*.md' | wc -l | tr -d ' ')"
rendered_highlightr_count="$(rg -o 'class="hltr-[^"]+"' public/p --glob 'index.html' | wc -l | tr -d ' ')"
[[ "$rendered_highlightr_count" == "$source_highlightr_count" ]] || \
    fail "Rendered Highlightr count ($rendered_highlightr_count) does not match Markdown source ($source_highlightr_count)"

assert_contains 'addListener' public/js 'Global controls must support legacy matchMedia listeners'
assert_contains 'Site initializer failed' public/js 'Global controls must isolate initializer failures'
assert_contains 'scrollbar-color:var(--article-toc-scrollbar-thumb)' public/css 'Article TOC scrollbar must follow the active color scheme'
assert_not_contains 'drop-shadow(0 0 3px var(--signature-glow))' public/css 'Header signature hover must not show a glow'
assert_not_contains '.site-brand:hover .site-signature__guide' public/css 'Header signature hover must not restart the drawing animation'

printf 'PASS: project builds without Hugo Theme Stack\n'
