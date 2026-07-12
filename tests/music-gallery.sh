#!/usr/bin/env bash
set -euo pipefail

hugo -D --cleanDestinationDir --printI18nWarnings --printPathWarnings >/tmp/hugo-music-gallery.log

music_html="public/music/index.html"

assert_contains() {
    local pattern="$1"
    local path="$2"
    local description="$3"

    if ! rg -Fq -- "$pattern" "$path"; then
        printf 'FAIL: %s\n' "$description" >&2
        exit 1
    fi
}

assert_not_contains() {
    local pattern="$1"
    local path="$2"
    local description="$3"

    if rg -Fq -- "$pattern" "$path"; then
        printf 'FAIL: %s\n' "$description" >&2
        exit 1
    fi
}

assert_matches() {
    local pattern="$1"
    local path="$2"
    local description="$3"

    if ! rg -Uq -- "$pattern" "$path"; then
        printf 'FAIL: %s\n' "$description" >&2
        exit 1
    fi
}

assert_contains 'data-music-experience' "$music_html" 'Music page exposes the gallery controller root'
assert_contains 'data-music-intro' "$music_html" 'Music page renders the exhibition prologue'
assert_contains 'Scroll to enter' "$music_html" 'The prologue explains how to enter the gallery'
assert_contains 'data-music-viewport' "$music_html" 'Music page renders a horizontal gallery viewport'
assert_contains 'data-music-track' "$music_html" 'Music page renders a transformable gallery track'
assert_contains 'data-music-groove' "$music_html" 'Music page renders the vinyl groove line'
assert_contains 'class="music-groove__base"' "$music_html" 'Music groove includes a quiet base line'
assert_contains 'class="music-groove__accent"' "$music_html" 'Music groove includes a scroll-driven accent segment'
assert_contains 'pathLength="1"' "$music_html" 'Music groove normalizes its path length for progress control'
assert_contains 'aria-hidden="true"' "$music_html" 'Music groove remains decorative for assistive technology'
assert_not_contains 'music-score' "$music_html" 'The old five-line score markup is removed'
assert_not_contains 'Use the wheel or arrow keys to move through the room.' "$music_html" 'Gallery omits the movement hint below the albums'
assert_not_contains 'Album artwork © respective rights holders. Personal, non-commercial exhibition demo.' "$music_html" 'Gallery omits the artwork notice below the albums'
assert_contains 'data-music-detail' "$music_html" 'Music page renders the fullscreen album detail layer'
assert_contains 'role="dialog"' "$music_html" 'Album details use dialog semantics'
assert_contains 'aria-modal="true"' "$music_html" 'Album details announce modal behavior'
assert_not_contains 'data-music-detail-close' "$music_html" 'Album details omit the visible Return control'
assert_not_contains 'data-music-detail-return' "$music_html" 'Album details omit the visible Return label'
assert_contains 'tabindex="-1"' "$music_html" 'The dialog itself receives keyboard focus without a visible close control'
assert_contains 'data-music-detail-tracks' "$music_html" 'Album details render a dedicated track list'
assert_not_contains 'data-music-detail-track-count' "$music_html" 'Track rows begin directly without a detached heading bar'
assert_not_contains '>Track list</span>' "$music_html" 'The reference-style lower-left table does not add a title above the rows'
assert_contains 'data-music-detail-meta' "$music_html" 'Album details render verified release metadata'
assert_not_contains 'data-music-detail-index' "$music_html" 'Detail view omits the redundant selected-album number'
assert_not_contains 'Selected work' "$music_html" 'Detail view omits the redundant Selected work label'
assert_contains 'data-music-detail-stage' "$music_html" 'Album details expose the centered FLIP destination'
assert_contains 'data-music-album-data' "$music_html" 'Each album ships its static detail payload with the page'
assert_contains 'loading="lazy"' "$music_html" 'Album covers remain lazy-loaded in the delivered HTML'
assert_not_contains 'loading="eager"' "$music_html" 'Album cover eager loading stays scoped to runtime warmup'
assert_contains 'class="site-header"' "$music_html" 'Music page keeps the shared site header visible in the document'
assert_contains 'aria-current="page"' "$music_html" 'Music is marked as the active primary navigation item'
assert_contains 'id="dark-mode-toggle"' "$music_html" 'Music page exposes the shared color-scheme toggle'
assert_contains 'class="plum-background"' "$music_html" 'Music page keeps the shared plum background layer'
assert_contains 'class="music-counter"' "$music_html" 'The album counter is rendered inside the exhibition content'
assert_contains 'Sweatshirt' "$music_html" 'The existing album title remains in the exhibition'
assert_contains 'Patrick Hizon / EJEAN' "$music_html" 'The existing album artist remains in the exhibition'
assert_not_contains 'class="music-paper-grain"' "$music_html" 'The standalone paper grain is removed'
assert_not_contains 'class="music-topline"' "$music_html" 'The duplicate full-width exhibition bar is removed'
assert_not_contains '>Listen</span>' "$music_html" 'Album hover captions no longer show the Listen label'

album_count="$(rg -o 'data-title=' "$music_html" | wc -l | tr -d ' ')"
if [[ "$album_count" != "15" ]]; then
    printf 'FAIL: expected 15 albums, found %s\n' "$album_count" >&2
    exit 1
fi

groove_path_count="$(rg -o 'id="music-groove-path"' "$music_html" | wc -l | tr -d ' ')"
groove_use_count="$(rg -o 'href="#music-groove-path"' "$music_html" | wc -l | tr -d ' ')"
if [[ "$groove_path_count" != "1" || "$groove_use_count" != "2" ]]; then
    printf 'FAIL: Music groove must use one path definition with base and accent references\n' >&2
    exit 1
fi

assert_contains 'data-music-experience' 'public/js' 'The compiled script initializes the gallery'
assert_contains 'requestAnimationFrame' 'public/js' 'Gallery motion is driven by the browser animation frame'
assert_contains 'prefers-reduced-motion' 'public/js' 'Gallery motion respects reduced-motion preferences'
assert_contains 'ArrowRight' 'public/js' 'Keyboard navigation supports the right arrow'
assert_contains 'ArrowLeft' 'public/js' 'Keyboard navigation supports the left arrow'
assert_contains 'Enter' 'public/js' 'Keyboard navigation can open album details'
assert_contains 'Escape' 'public/js' 'Keyboard navigation can close album details'
assert_contains 'Tab' 'public/js' 'Keyboard focus remains inside the album dialog'
assert_contains 'detail.focus({ preventScroll: true });' 'assets/ts/site.ts' 'The buttonless detail dialog receives focus after opening'
assert_contains 'inert' 'public/js' 'Background gallery controls are disabled while details are open'
assert_contains 'navigationIndex' 'assets/ts/site.ts' 'Keyboard navigation is independent from the in-flight visual index'
assert_contains 'returnOffset' 'assets/ts/site.ts' 'Closing details restores the previous gallery position'
assert_contains 'MusicGalleryState' 'assets/ts/site.ts' 'Gallery detail motion uses an explicit state machine'
assert_contains "'gallery' | 'preparing' | 'opening' | 'detail' | 'closing'" 'assets/ts/site.ts' 'Gallery state includes a cancellable cover preparation phase'
assert_contains 'new WeakMap<HTMLImageElement, Promise<void>>()' 'assets/ts/site.ts' 'Decoded covers are cached per image element'
assert_contains 'const albumDecodeRadius = 2;' 'assets/ts/site.ts' 'Cover warmup is limited to the selected album and two neighbors per side'
assert_contains 'const detailDecodeWaitMs = 100;' 'assets/ts/site.ts' 'Opening waits no more than 100ms for cover decoding'
assert_contains "image.loading = 'eager';" 'assets/ts/site.ts' 'Only runtime warmup candidates opt into eager loading'
assert_contains 'image.decode().catch(() => undefined)' 'assets/ts/site.ts' 'Cover decode failures fall back without blocking the gallery'
assert_contains 'requestIdleCallback' 'assets/ts/site.ts' 'Background cover warmup waits for browser idle time when available'
assert_contains 'detailRequestId' 'assets/ts/site.ts' 'Stale asynchronous open requests cannot reveal an old album'
assert_contains "card.addEventListener('pointerenter'" 'assets/ts/site.ts' 'Hovering an album warms its nearby covers'
assert_contains 'createFlightCover' 'assets/ts/site.ts' 'Opening details creates a FLIP cover layer'
assert_contains 'playbackRate' 'assets/ts/site.ts' 'Opening motion can reverse from its current progress'
assert_contains 'const detailClosePlaybackRate = 1.1;' 'assets/ts/site.ts' 'Detail exit uses a slightly faster response than entry'
assert_contains 'animation.playbackRate = -detailClosePlaybackRate;' 'assets/ts/site.ts' 'Detail exit reverses the same timeline at the tuned rate'
assert_contains 'reduceDetailMotion' 'assets/ts/site.ts' 'Keyboard-opened details use the short non-spatial transition'
assert_contains 'openDetail(card, true)' 'assets/ts/site.ts' 'Enter avoids the long exhibition motion'
assert_contains 'getComputedStyle(galleryCard).opacity' 'assets/ts/site.ts' 'Cards leave from their actual corridor opacity without flashing'
assert_contains 'detailBackdropRevealOffset' 'assets/ts/site.ts' 'The detail background waits for corridor cards to leave the canvas'
assert_contains "closest('.music-detail__tracks, .music-detail__stage, .music-detail__artist, .music-detail__copy h2, .music-detail__meta')" 'assets/ts/site.ts' 'Only rendered detail content blocks clicks from reaching the blank backdrop'
assert_not_contains "closest('.music-detail__tracks, .music-detail__stage, .music-detail__copy')" 'assets/ts/site.ts' 'The full-height copy column does not swallow clicks on its blank lower area'
assert_contains 'scheduleMusicFrame' 'assets/ts/site.ts' 'Gallery animation wakes only when work is pending'
assert_contains "'[data-music-groove]'" 'assets/ts/site.ts' 'Gallery controller discovers the groove line'
assert_contains 'grooveParallaxRatio = 0.32' 'assets/ts/site.ts' 'Groove line uses the planned restrained parallax ratio'
assert_contains 'strokeDashoffset' 'assets/ts/site.ts' 'Gallery progress drives the groove accent segment'
assert_not_contains 'music-score' 'assets/ts/site.ts' 'Gallery controller removes the old score hooks'
assert_contains 'pageshow' 'assets/ts/site.ts' 'Gallery animation resumes after browser back-forward cache restoration'
assert_contains "'.site-header, .music-intro, .music-gallery'" 'assets/ts/site.ts' 'The shared header becomes inert while album details are open'

assert_contains 'translate3d' 'public/css' 'The compiled gallery uses GPU-friendly transforms'
assert_contains 'perspective' 'public/css' 'Album covers have restrained dimensional depth'
assert_contains '--gallery-progress' 'public/css' 'The gallery exposes progress to the visual layer'
assert_contains 'prefers-reduced-motion:reduce' 'public/css' 'Reduced-motion styling is preserved'
assert_contains 'max-width:1023px' 'public/css' 'Small screens receive the desktop-only notice'
assert_contains 'background:var(--color-bg)' 'public/css' 'Music uses the shared site background color'
assert_contains 'font-family:var(--font-body)' 'public/css' 'Music utility copy uses the shared body font'
assert_contains 'font-family:var(--font-display)' 'public/css' 'Music display copy uses the shared display font'
assert_contains ':root[data-scheme=dark] body.template-music' 'public/css' 'Music provides a color-scheme-specific dark treatment'
assert_contains 'background:var(--music-detail-bg)' 'public/css' 'Album details use the theme-aware shared site background'
assert_contains 'music-flight-cover' 'public/css' 'Compiled styles include the temporary FLIP cover layer'
assert_contains 'music-detail__tracks' 'public/css' 'Compiled styles include the bounded track list column'
assert_contains 'align-self:end' 'public/css' 'The track table is anchored to the lower-left of the detail canvas'
assert_contains '.music-groove' 'public/css' 'Compiled styles include the vinyl groove line'
assert_contains '.music-groove__accent' 'public/css' 'Compiled styles include the groove progress segment'
assert_contains 'pointer-events:none' 'public/css' 'The decorative groove cannot intercept gallery interaction'
assert_matches '\.music-groove \{[^}]*max-width: none;' 'assets/scss/_music.scss' 'The groove line can extend beyond the global responsive SVG width cap'
assert_not_contains '.music-score' 'assets/scss/_music.scss' 'The old five-line score styles are removed'

assert_not_contains 'body.template-music .site-header,' 'assets/scss/_music.scss' 'Music no longer hides the shared site header'
assert_not_contains 'body.template-music .plum-background,' 'assets/scss/_music.scss' 'Music no longer hides the shared plum background'
assert_not_contains 'border-top: 1px solid transparent;' 'assets/scss/_music.scss' 'Album hover captions no longer reserve a separator line'
assert_not_contains 'border-color: var(--music-line);' 'assets/scss/_music.scss' 'Album hover captions no longer reveal a separator line'
assert_not_contains '.music-detail__kicker' 'assets/scss/_music.scss' 'Detail view omits the upper-right kicker separator'
assert_not_contains '.music-detail__return' 'assets/scss/_music.scss' 'Detail view omits the upper-left Return control styles'
assert_not_contains 'family=Manrope' 'layouts/partials/head/resources.html' 'The removed Music body font is no longer downloaded'
assert_not_contains 'family=Newsreader' 'layouts/partials/head/resources.html' 'The removed Music display font is no longer downloaded'

assert_not_contains 'data-album-toggle' "$music_html" 'The old flip-card toggle is removed'
assert_not_contains 'music-album-card__face--back' "$music_html" 'The old card back is removed'
assert_not_contains 'aria-pressed="false"' "$music_html" 'The old flip state is removed'
assert_not_contains '--album-accent' "$music_html" 'Per-album theme colors are removed from markup'
assert_not_contains 'rotateY(180deg)' 'public/css' 'The old card flip is removed from CSS'
assert_not_contains '[data-album-toggle]' 'public/js' 'The old flip controller is removed from JavaScript'
assert_not_contains 'themeColor' 'content/page/music/index.md' 'Per-album theme colors are removed from content'
assert_not_contains 'layout = "standard"' 'content/page/music/index.md' 'Legacy album layout fields are removed from content'

release_count="$(rg -c '^releaseDate = ' content/page/music/index.md)"
type_count="$(rg -c '^releaseType = ' content/page/music/index.md)"
genre_count="$(rg -c '^genres = ' content/page/music/index.md)"
track_count="$(rg -c '^\[\[albums\.tracks\]\]' content/page/music/index.md)"
if [[ "$release_count" != "15" || "$type_count" != "15" || "$genre_count" != "15" ]]; then
    printf 'FAIL: every Music entry must include releaseDate, releaseType, and genres\n' >&2
    exit 1
fi
if (( track_count < 15 )); then
    printf 'FAIL: every Music entry must include at least one verified track\n' >&2
    exit 1
fi

printf 'PASS: Music exhibition structure and behavior are present\n'
