function addMediaQueryChangeListener(
    query: MediaQueryList,
    listener: (event: MediaQueryListEvent | MediaQueryList) => void
) {
    if (typeof query.addEventListener === 'function') {
        query.addEventListener('change', listener as EventListener);
        return;
    }

    if (typeof query.addListener === 'function') {
        query.addListener(listener);
    }
}

function initThemeToggle() {
    const toggle = document.getElementById('dark-mode-toggle') as HTMLButtonElement | null;
    if (!toggle || toggle.dataset.projectThemeToggleReady === 'true') return;

    toggle.dataset.projectThemeToggleReady = 'true';

    type ColorScheme = 'light' | 'dark';
    type ThemeSnapshotName = 'root' | 'theme-header' | 'theme-content';
    type ThemeSnapshotTarget = {
        name: ThemeSnapshotName;
        element: Element | null;
    };

    let activeThemeAnimations: Animation[] = [];

    function getCurrentScheme() {
        return document.documentElement.dataset.scheme === 'dark' ? 'dark' : 'light';
    }

    function getSystemScheme(): ColorScheme {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function saveScheme(scheme: ColorScheme) {
        try {
            window.localStorage.setItem('ColorScheme', scheme);
        } catch {
            // Theme switching should still work when storage is unavailable.
        }
    }

    function applyScheme(scheme: ColorScheme) {
        document.documentElement.dataset.scheme = scheme;
        saveScheme(scheme);
        window.dispatchEvent(new CustomEvent('onColorSchemeChange', { detail: scheme }));
    }

    function getSnapshotClipPath(target: ThemeSnapshotTarget, x: number, y: number) {
        const rect = target.element?.getBoundingClientRect() || {
            left: 0,
            top: 0,
            width: window.innerWidth,
            height: window.innerHeight
        };
        const localX = x - rect.left;
        const localY = y - rect.top;
        const radius = Math.hypot(
            Math.max(localX, rect.width - localX),
            Math.max(localY, rect.height - localY)
        );

        return [
            `circle(0px at ${localX}px ${localY}px)`,
            `circle(${radius}px at ${localX}px ${localY}px)`
        ];
    }

    function getThemeSnapshotTargets(): ThemeSnapshotTarget[] {
        return [
            { name: 'root', element: null },
            { name: 'theme-header', element: document.querySelector('.site-header') },
            { name: 'theme-content', element: document.querySelector('.main-content') }
        ].filter((target) => target.name === 'root' || target.element);
    }

    function stopActiveThemeAnimations() {
        activeThemeAnimations.forEach((animation) => animation.cancel());
        activeThemeAnimations = [];
    }

    toggle.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();

        const rect = toggle.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        const currentScheme = getCurrentScheme();
        const isLeavingDark = currentScheme === 'dark';
        const nextScheme: ColorScheme = currentScheme === 'dark' ? 'light' : 'dark';
        const transitionDirection = isLeavingDark ? 'dark-to-light' : 'light-to-dark';

        if (!('startViewTransition' in document)) {
            applyScheme(nextScheme);
            return;
        }

        const root = document.documentElement;
        root.dataset.themeTransitionDirection = transitionDirection;

        const clearThemeTransitionDirection = () => {
            if (root.dataset.themeTransitionDirection === transitionDirection) {
                delete root.dataset.themeTransitionDirection;
            }
        };

        stopActiveThemeAnimations();

        const transition = (document as Document & {
            startViewTransition: (callback: () => void) => {
                ready: Promise<void>;
                finished: Promise<void>;
            };
        }).startViewTransition(() => {
            applyScheme(nextScheme);
        });

        transition.ready.then(() => {
            activeThemeAnimations = getThemeSnapshotTargets().flatMap((target) => {
                const revealClipPath = getSnapshotClipPath(target, x, y);
                const clipPath = isLeavingDark ? [...revealClipPath].reverse() : revealClipPath;
                const pseudoElement = isLeavingDark
                    ? ({
                        root: '::view-transition-old(root)',
                        'theme-header': '::view-transition-old(theme-header)',
                        'theme-content': '::view-transition-old(theme-content)'
                    } satisfies Record<ThemeSnapshotName, string>)[target.name]
                    : ({
                        root: '::view-transition-new(root)',
                        'theme-header': '::view-transition-new(theme-header)',
                        'theme-content': '::view-transition-new(theme-content)'
                    } satisfies Record<ThemeSnapshotName, string>)[target.name];

                try {
                    return [root.animate(
                        { clipPath },
                        {
                            duration: 500,
                            easing: 'ease-in-out',
                            fill: 'forwards',
                            pseudoElement
                        }
                    )];
                } catch {
                    return [];
                }
            });

            Promise.allSettled([
                transition.finished,
                ...activeThemeAnimations.map((animation) => animation.finished)
            ]).then(() => {
                stopActiveThemeAnimations();
                clearThemeTransitionDirection();
            });
        }).catch(clearThemeTransitionDirection);
    }, { capture: true });
}

function initCodeCopyButtons() {
    const content = document.querySelector<HTMLElement>('.article-detail__content');
    if (!content) return;

    const blocks = Array.from(content.querySelectorAll<HTMLElement>('.highlight, pre')).filter((block) => {
        if (block.tagName === 'PRE' && block.closest('.highlight')) return false;
        if (block.querySelector('.code-copy-button')) return false;

        return Boolean(block.querySelector('code') || block.textContent?.trim());
    });

    function getCodeText(block: HTMLElement) {
        const code = block.querySelector<HTMLElement>('code');
        const pre = block.querySelector<HTMLElement>('pre');
        return (code || pre || block).innerText.replace(/\n$/, '');
    }

    function copyWithFallback(text: string) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.top = '-999px';
        textarea.style.left = '-999px';
        document.body.appendChild(textarea);
        textarea.select();

        const copied = document.execCommand('copy');
        textarea.remove();

        if (!copied) throw new Error('Copy command failed');
    }

    async function copyText(text: string) {
        if (navigator.clipboard?.writeText && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return;
        }

        copyWithFallback(text);
    }

    blocks.forEach((block) => {
        block.classList.add('code-copy-host');

        const button = document.createElement('button');
        button.className = 'code-copy-button';
        button.type = 'button';
        button.textContent = 'Copy';
        button.setAttribute('aria-label', 'Copy code block');

        let resetTimer: number | undefined;

        button.addEventListener('click', async (event) => {
            event.preventDefault();
            event.stopPropagation();

            try {
                await copyText(getCodeText(block));
                button.textContent = 'Copied';
                button.classList.add('is-copied');
            } catch {
                button.textContent = 'Failed';
                button.classList.add('is-error');
            }

            window.clearTimeout(resetTimer);
            resetTimer = window.setTimeout(() => {
                button.textContent = 'Copy';
                button.classList.remove('is-copied', 'is-error');
            }, 1500);
        });

        block.appendChild(button);
    });
}

function initMusicGallery() {
    const root = document.querySelector<HTMLElement>('[data-music-experience]');
    if (!root || root.dataset.musicGalleryReady === 'true') return;

    const viewport = root.querySelector<HTMLElement>('[data-music-viewport]');
    const track = root.querySelector<HTMLElement>('[data-music-track]');
    const detail = root.querySelector<HTMLElement>('[data-music-detail]');
    const detailPanel = root.querySelector<HTMLElement>('[data-music-detail-panel]');
    const detailStage = root.querySelector<HTMLElement>('[data-music-detail-stage]');
    const detailTracks = root.querySelector<HTMLElement>('[data-music-detail-tracks]');
    const detailMeta = root.querySelector<HTMLElement>('[data-music-detail-meta]');
    const detailTrackList = root.querySelector<HTMLOListElement>('[data-music-detail-track-list]');
    const detailTrackTotal = root.querySelector<HTMLElement>('[data-music-detail-track-total]');
    const detailReleaseDate = root.querySelector<HTMLElement>('[data-music-detail-release-date]');
    const detailReleaseType = root.querySelector<HTMLElement>('[data-music-detail-release-type]');
    const detailGenres = root.querySelector<HTMLElement>('[data-music-detail-genres]');
    const counter = root.querySelector<HTMLElement>('[data-music-counter]');
    const detailArtist = root.querySelector<HTMLElement>('[data-music-detail-artist]');
    const detailTitle = root.querySelector<HTMLElement>('[data-music-detail-title]');
    const detailImage = root.querySelector<HTMLImageElement>('[data-music-detail-image]');
    const detailFallback = root.querySelector<HTMLElement>('[data-music-detail-fallback]');
    const detailFallbackArtist = root.querySelector<HTMLElement>('[data-music-detail-fallback-artist]');
    const detailFallbackTitle = root.querySelector<HTMLElement>('[data-music-detail-fallback-title]');
    const groove = root.querySelector<SVGSVGElement>('[data-music-groove]');
    const grooveAccent = root.querySelector<SVGUseElement>('[data-music-groove-accent]');
    const cards = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-music-album]'));
    const albumData = Array.from(root.querySelectorAll<HTMLTemplateElement>('[data-music-album-data]'));
    const backgroundRegions = Array.from(document.querySelectorAll<HTMLElement>('.site-header, .music-intro, .music-gallery'));
    const galleryChrome = Array.from(document.querySelectorAll<HTMLElement>('.site-header, .music-counter, .music-gallery__footer, .music-groove'));

    if (
        !viewport || !track || !detail || !detailPanel || !detailStage
        || !detailTracks || !detailMeta || !detailTrackList || !cards.length
    ) return;
    root.dataset.musicGalleryReady = 'true';

    type MusicGalleryState = 'gallery' | 'preparing' | 'opening' | 'detail' | 'closing';
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const clamp = (value: number, minimum: number, maximum: number) =>
        Math.min(Math.max(value, minimum), maximum);
    const detailClosePlaybackRate = 1.1;
    const grooveParallaxRatio = 0.32;
    const grooveAccentLength = 0.18;
    const grooveMaxDrift = 6;
    const albumDecodeRadius = 2;
    const detailDecodeWaitMs = 100;
    const decodedCovers = new WeakMap<HTMLImageElement, Promise<void>>();
    const idleWindow = window as typeof window & {
        requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
        cancelIdleCallback?: (handle: number) => void;
    };

    let targetOffset = 0;
    let currentOffset = 0;
    let limit = 0;
    let activeIndex = 0;
    let navigationIndex = 0;
    let entered = false;
    let detailState: MusicGalleryState = 'gallery';
    let selectedCard: HTMLButtonElement | null = null;
    let returnOffset: { offset: number; activeIndex: number; navigationIndex: number } | null = null;
    let suppressFocusNavigation = false;
    let animationFrame: number | undefined;
    let detailAnimations: Animation[] = [];
    let flightCover: HTMLElement | null = null;
    let flightAnimation: Animation | null = null;
    let selectedCoverFrame: HTMLElement | null = null;
    let reduceDetailMotion = false;
    let detailRequestId = 0;
    let albumWarmupHandle: number | undefined;
    let albumWarmupUsesIdleCallback = false;

    function decodeAlbumCover(image: HTMLImageElement) {
        const cachedDecode = decodedCovers.get(image);
        if (cachedDecode) return cachedDecode;

        image.loading = 'eager';
        const decodePromise = image.decode().catch(() => undefined);
        decodedCovers.set(image, decodePromise);
        return decodePromise;
    }

    function predecodeAlbumWindow(index: number) {
        const start = Math.max(0, index - albumDecodeRadius);
        const end = Math.min(cards.length - 1, index + albumDecodeRadius);
        const decodePromises = cards.slice(start, end + 1).flatMap((card) => {
            const image = card.querySelector<HTMLImageElement>('.music-cover-image');
            return image && !image.hidden ? [decodeAlbumCover(image)] : [];
        });

        return Promise.all(decodePromises).then(() => undefined);
    }

    function cancelQueuedAlbumWarmup() {
        if (albumWarmupHandle === undefined) return;
        if (albumWarmupUsesIdleCallback) idleWindow.cancelIdleCallback?.(albumWarmupHandle);
        else window.clearTimeout(albumWarmupHandle);
        albumWarmupHandle = undefined;
    }

    function queueAlbumWindowDecode(index: number) {
        cancelQueuedAlbumWarmup();
        const warm = () => {
            albumWarmupHandle = undefined;
            void predecodeAlbumWindow(index);
        };

        if (idleWindow.requestIdleCallback) {
            albumWarmupUsesIdleCallback = true;
            albumWarmupHandle = idleWindow.requestIdleCallback(warm, { timeout: 400 });
        } else {
            albumWarmupUsesIdleCallback = false;
            albumWarmupHandle = window.setTimeout(warm, 0);
        }
    }

    function waitForAlbumWindowDecode(index: number) {
        const decodePromise = predecodeAlbumWindow(index);
        let waitTimer: number | undefined;
        const waitLimit = new Promise<void>((resolve) => {
            waitTimer = window.setTimeout(resolve, detailDecodeWaitMs);
        });

        return Promise.race([decodePromise, waitLimit]).finally(() => {
            if (waitTimer !== undefined) window.clearTimeout(waitTimer);
        });
    }

    function getCardTarget(index: number) {
        const card = cards[clamp(index, 0, cards.length - 1)];
        const centeredOffset = card.offsetLeft + card.offsetWidth / 2 - viewport.clientWidth / 2;
        return clamp(centeredOffset, 0, limit);
    }

    function measure() {
        limit = Math.max(0, track.scrollWidth - viewport.clientWidth);
        targetOffset = clamp(targetOffset, 0, limit);
        currentOffset = clamp(currentOffset, 0, limit);
        if (groove) groove.style.width = `${viewport.clientWidth + limit * grooveParallaxRatio}px`;
        if (flightCover && flightAnimation && selectedCoverFrame && detailState !== 'gallery') {
            updateFlightGeometry();
        }
        scheduleMusicFrame();
    }

    function enterGallery() {
        if (entered) return;
        entered = true;
        root.classList.remove('is-intro');
        root.classList.add('is-entered');
        root.querySelector<HTMLElement>('[data-music-intro]')?.setAttribute('aria-hidden', 'true');
    }

    function setActiveIndex(index: number) {
        const nextIndex = clamp(index, 0, cards.length - 1);
        if (nextIndex === activeIndex && cards[nextIndex].classList.contains('is-active')) return;

        activeIndex = nextIndex;
        cards.forEach((card, cardIndex) => card.classList.toggle('is-active', cardIndex === activeIndex));
        if (counter) counter.textContent = String(activeIndex + 1).padStart(2, '0');
        queueAlbumWindowDecode(activeIndex);
    }

    function findNearestCard(offset = currentOffset) {
        let nearestIndex = 0;
        let nearestDistance = Number.POSITIVE_INFINITY;

        cards.forEach((_card, index) => {
            const distance = Math.abs(getCardTarget(index) - offset);
            if (distance < nearestDistance) {
                nearestIndex = index;
                nearestDistance = distance;
            }
        });

        return nearestIndex;
    }

    function moveToIndex(index: number) {
        const nextIndex = clamp(index, 0, cards.length - 1);
        navigationIndex = nextIndex;
        setActiveIndex(nextIndex);
        targetOffset = getCardTarget(nextIndex);
        scheduleMusicFrame();
    }

    function getAlbumData(index: number) {
        return albumData.find((entry) => Number(entry.dataset.index) === index) || null;
    }

    function populateDetail(card: HTMLButtonElement) {
        const index = Number(card.dataset.index || 0);
        const title = card.dataset.title || '';
        const artist = card.dataset.artist || '';
        const cardImage = card.querySelector<HTMLImageElement>('.music-cover-image');
        const data = getAlbumData(index);
        const tracks = data ? Array.from(data.content.querySelectorAll('li')) : [];

        if (detailArtist) detailArtist.textContent = artist;
        if (detailTitle) detailTitle.textContent = title;
        if (detailFallbackArtist) detailFallbackArtist.textContent = artist;
        if (detailFallbackTitle) detailFallbackTitle.textContent = title;
        if (detailReleaseDate) detailReleaseDate.textContent = data?.dataset.releaseDate || '—';
        if (detailReleaseType) detailReleaseType.textContent = data?.dataset.releaseType || '—';
        if (detailGenres) detailGenres.textContent = data?.dataset.genres || '—';
        if (detailTrackTotal) detailTrackTotal.textContent = String(tracks.length).padStart(2, '0');

        detailTrackList.replaceChildren(...tracks.map((trackItem) => trackItem.cloneNode(true)));
        detailTrackList.scrollTop = 0;

        if (detailImage && cardImage?.src && !cardImage.hidden) {
            detailImage.src = cardImage.src;
            detailImage.alt = cardImage.alt;
            detailImage.hidden = false;
            detailFallback?.setAttribute('aria-hidden', 'true');
        } else if (detailImage) {
            detailImage.hidden = true;
            detailImage.removeAttribute('src');
            detailFallback?.removeAttribute('aria-hidden');
        }
        if (detailFallback) detailFallback.hidden = false;
        detail.setAttribute('aria-label', `${title} by ${artist}`);
    }

    function createFlightCover(card: HTMLButtonElement) {
        const coverFrame = card.querySelector<HTMLElement>('.music-album__cover-frame');
        if (!coverFrame) return null;

        const layer = document.createElement('div');
        layer.className = 'music-flight-cover';
        layer.setAttribute('aria-hidden', 'true');
        layer.appendChild(coverFrame.cloneNode(true));
        document.body.appendChild(layer);
        coverFrame.style.visibility = 'hidden';
        selectedCoverFrame = coverFrame;
        return layer;
    }

    function getFlightKeyframes() {
        if (!selectedCoverFrame || !flightCover) return [];
        const source = selectedCoverFrame.getBoundingClientRect();
        const target = detailStage.getBoundingClientRect();
        const scaleX = target.width / Math.max(source.width, 1);
        const scaleY = target.height / Math.max(source.height, 1);

        flightCover.style.top = `${source.top}px`;
        flightCover.style.left = `${source.left}px`;
        flightCover.style.width = `${source.width}px`;
        flightCover.style.height = `${source.height}px`;

        if (reduceDetailMotion) {
            const endTransform = `translate3d(${target.left - source.left}px, ${target.top - source.top}px, 0) scale(${scaleX}, ${scaleY})`;
            return [
                { opacity: 0, transform: endTransform },
                { opacity: 1, transform: endTransform }
            ];
        }

        return [
            { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' },
            {
                opacity: 1,
                transform: `translate3d(${target.left - source.left}px, ${target.top - source.top}px, 0) scale(${scaleX}, ${scaleY})`
            }
        ];
    }

    function updateFlightGeometry() {
        const effect = flightAnimation?.effect as KeyframeEffect | null;
        const keyframes = getFlightKeyframes();
        if (effect && keyframes.length) effect.setKeyframes(keyframes);
    }

    function animateDetail(card: HTMLButtonElement) {
        const duration = reduceDetailMotion ? 180 : 1550;
        const motionOptions: KeyframeAnimationOptions = {
            duration,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            fill: 'both'
        };
        const fadeOptions: KeyframeAnimationOptions = { duration, fill: 'both', easing: 'linear' };
        const cardRect = card.getBoundingClientRect();
        const detailBackdropRevealOffset = reduceDetailMotion ? 1 : 0.72;
        const backdropKeyframes = reduceDetailMotion
            ? [{ opacity: 0 }, { opacity: 1 }]
            : [
                { opacity: 0, offset: 0 },
                { opacity: 0, offset: 0.18 },
                { opacity: 1, offset: detailBackdropRevealOffset },
                { opacity: 1, offset: 1 }
            ];

        flightCover = createFlightCover(card);
        if (!flightCover) return false;

        flightAnimation = flightCover.animate(getFlightKeyframes(), motionOptions);
        detailAnimations = [flightAnimation];
        detailAnimations.push(detail.animate(backdropKeyframes, fadeOptions));
        detailAnimations.push(detail.querySelector<HTMLElement>('.music-detail__wash')!.animate([
            { opacity: 0 },
            { opacity: 0.07 }
        ], motionOptions));

        cards.forEach((galleryCard) => {
            if (galleryCard === card) {
                galleryCard.querySelectorAll<HTMLElement>('.music-album__number, .music-album__caption').forEach((part) => {
                    detailAnimations.push(part.animate([
                        { opacity: getComputedStyle(part).opacity },
                        { opacity: 0 }
                    ], motionOptions));
                });
                return;
            }
            const rect = galleryCard.getBoundingClientRect();
            const startOpacity = getComputedStyle(galleryCard).opacity;
            const direction = rect.left + rect.width / 2 < cardRect.left + cardRect.width / 2 ? -1 : 1;
            const exitX = reduceDetailMotion ? 0 : direction * Math.max(window.innerWidth * 0.68, 760);
            const exitY = reduceDetailMotion ? 0 : (rect.top - cardRect.top) * 0.22;
            detailAnimations.push(galleryCard.animate([
                { opacity: startOpacity, translate: '0 0' },
                { opacity: 0, translate: `${exitX}px ${exitY}px` }
            ], motionOptions));
        });

        galleryChrome.forEach((element) => {
            const startOpacity = getComputedStyle(element).opacity;
            detailAnimations.push(element.animate([
                { opacity: startOpacity, translate: '0 0' },
                { opacity: 0, translate: reduceDetailMotion ? '0 0' : '0 -12px' }
            ], motionOptions));
        });

        [detailTracks, detailMeta].forEach((element, index) => {
            detailAnimations.push(element.animate([
                { opacity: 0, translate: reduceDetailMotion ? '0 0' : '0 24px', offset: 0 },
                { opacity: 0, translate: reduceDetailMotion ? '0 0' : '0 24px', offset: reduceDetailMotion ? 0 : 0.48 + index * 0.07 },
                { opacity: 1, translate: '0 0', offset: 1 }
            ], motionOptions));
        });

        flightAnimation.onfinish = finishDetailMotion;
        return true;
    }

    function finishDetailMotion() {
        if (detailState === 'opening') {
            detailState = 'detail';
            detail.focus({ preventScroll: true });
            return;
        }
        if (detailState !== 'closing') return;

        const cardToRestore = selectedCard;
        const galleryStateToRestore = returnOffset;
        detailState = 'gallery';
        detail.classList.remove('is-open');
        detail.hidden = true;
        document.body.classList.remove('music-detail-open');
        backgroundRegions.forEach((region) => region.removeAttribute('inert'));
        detailAnimations.forEach((animation) => animation.cancel());
        detailAnimations = [];
        flightCover?.remove();
        flightCover = null;
        flightAnimation = null;
        if (selectedCoverFrame) selectedCoverFrame.style.removeProperty('visibility');
        selectedCoverFrame = null;

        if (detailImage) {
            detailImage.hidden = true;
            detailImage.removeAttribute('src');
        }
        if (galleryStateToRestore) {
            targetOffset = galleryStateToRestore.offset;
            currentOffset = galleryStateToRestore.offset;
            navigationIndex = galleryStateToRestore.navigationIndex;
            setActiveIndex(galleryStateToRestore.activeIndex);
            renderMusicFrame();
        }
        selectedCard = null;
        returnOffset = null;
        reduceDetailMotion = false;
        if (cardToRestore) {
            suppressFocusNavigation = true;
            cardToRestore.focus({ preventScroll: true });
        }
    }

    async function openDetail(card: HTMLButtonElement, keyboardInitiated = false) {
        if (detailState === 'closing' && selectedCard === card) {
            detailState = 'opening';
            detailAnimations.forEach((animation) => {
                animation.playbackRate = 1;
                animation.play();
            });
            return;
        }
        if (detailState !== 'gallery') return;

        enterGallery();
        detailState = 'preparing';
        const requestId = ++detailRequestId;
        reduceDetailMotion = reducedMotion.matches || keyboardInitiated;
        selectedCard = card;
        returnOffset = { offset: currentOffset, activeIndex, navigationIndex };
        targetOffset = currentOffset;
        const index = Number(card.dataset.index || 0);
        await waitForAlbumWindowDecode(index);
        if (detailState !== 'preparing' || detailRequestId !== requestId || selectedCard !== card) return;

        populateDetail(card);
        detail.hidden = false;
        detail.classList.add('is-open');
        backgroundRegions.forEach((region) => region.setAttribute('inert', ''));
        document.body.classList.add('music-detail-open');
        detailState = 'opening';

        if (!animateDetail(card)) {
            detailState = 'gallery';
            detail.classList.remove('is-open');
            detail.hidden = true;
            backgroundRegions.forEach((region) => region.removeAttribute('inert'));
            document.body.classList.remove('music-detail-open');
            selectedCard = null;
            returnOffset = null;
            reduceDetailMotion = false;
        }
    }

    function closeDetail() {
        if (detailState === 'gallery' || detailState === 'closing') return;
        if (detailState === 'preparing') {
            detailRequestId += 1;
            detailState = 'gallery';
            selectedCard = null;
            returnOffset = null;
            reduceDetailMotion = false;
            return;
        }
        detailState = 'closing';
        detailAnimations.forEach((animation) => {
            animation.playbackRate = -detailClosePlaybackRate;
            animation.play();
        });
    }

    function updatePointer(event: PointerEvent) {
        if (reducedMotion.matches || window.innerWidth < 1024 || detailState !== 'gallery') return;

        const normalizedX = clamp((event.clientX / window.innerWidth - 0.5) * 2, -1, 1);
        const normalizedY = clamp((event.clientY / window.innerHeight - 0.5) * 2, -1, 1);
        root.style.setProperty('--pointer-x', `${event.clientX}px`);
        root.style.setProperty('--pointer-y', `${event.clientY}px`);

        cards.forEach((card) => {
            const rect = card.getBoundingClientRect();
            const distance = Math.hypot(
                event.clientX - (rect.left + rect.width / 2),
                event.clientY - (rect.top + rect.height / 2)
            );
            const influence = clamp(1 - distance / Math.max(window.innerWidth * 0.48, 520), 0.08, 1);
            const localX = clamp((event.clientX - (rect.left + rect.width / 2)) / rect.width, -1, 1);
            const localY = clamp((event.clientY - (rect.top + rect.height / 2)) / rect.height, -1, 1);
            card.style.setProperty('--pointer-influence', influence.toFixed(3));
            card.style.setProperty('--card-z', `${(influence * 18).toFixed(1)}px`);
            card.style.setProperty('--local-tilt-x', `${(-normalizedY * influence * 5).toFixed(2)}deg`);
            card.style.setProperty('--local-tilt-y', `${(normalizedX * influence * 5).toFixed(2)}deg`);
            card.style.setProperty('--caption-x', `${(localX * influence * 5).toFixed(1)}px`);
            card.style.setProperty('--caption-y', `${(localY * influence * 4).toFixed(1)}px`);
            card.style.setProperty('--shadow-x', `${(-localX * influence * 10).toFixed(1)}px`);
            card.style.setProperty('--shadow-shift-y', `${(-localY * influence * 8).toFixed(1)}px`);
        });
    }

    function resetPointerEffects() {
        root.style.setProperty('--pointer-x', '50vw');
        root.style.setProperty('--pointer-y', '50vh');
        cards.forEach((card) => {
            card.style.setProperty('--pointer-influence', '0');
            card.style.setProperty('--card-z', '0px');
            card.style.setProperty('--local-tilt-x', '0deg');
            card.style.setProperty('--local-tilt-y', '0deg');
            card.style.setProperty('--caption-x', '0px');
            card.style.setProperty('--caption-y', '0px');
            card.style.setProperty('--shadow-x', '0px');
            card.style.setProperty('--shadow-shift-y', '0px');
        });
    }

    function renderMusicFrame() {
        track.style.transform = `translate3d(${-currentOffset}px, 0, 0)`;
        setActiveIndex(findNearestCard());
        const galleryProgress = limit ? currentOffset / limit : 0;
        root.style.setProperty('--gallery-progress', String(galleryProgress));

        if (groove) {
            if (reducedMotion.matches) {
                groove.style.removeProperty('transform');
                grooveAccent?.style.removeProperty('stroke-dashoffset');
            } else {
                const drift = clamp((targetOffset - currentOffset) * 0.015, -grooveMaxDrift, grooveMaxDrift);
                groove.style.transform = `translate3d(${-currentOffset * grooveParallaxRatio}px, ${drift}px, 0)`;
                if (grooveAccent) {
                    grooveAccent.style.strokeDashoffset = String(-galleryProgress * (1 - grooveAccentLength));
                }
            }
        }
    }

    function scheduleMusicFrame() {
        if (animationFrame !== undefined || window.innerWidth < 1024) return;
        animationFrame = window.requestAnimationFrame(tick);
    }

    function tick() {
        animationFrame = undefined;
        const difference = targetOffset - currentOffset;
        currentOffset = reducedMotion.matches
            ? targetOffset
            : currentOffset + difference * 0.075;
        if (Math.abs(difference) < 0.08) currentOffset = targetOffset;

        renderMusicFrame();
        if (!reducedMotion.matches && currentOffset !== targetOffset) scheduleMusicFrame();
    }

    cards.forEach((card, index) => {
        card.addEventListener('click', () => void openDetail(card));
        card.addEventListener('pointerenter', () => queueAlbumWindowDecode(index));
        card.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter') return;
            event.preventDefault();
            event.stopPropagation();
            void openDetail(card, true);
        });
        card.addEventListener('focus', () => {
            queueAlbumWindowDecode(index);
            if (suppressFocusNavigation) {
                suppressFocusNavigation = false;
                return;
            }
            if (!card.matches(':focus-visible')) return;
            enterGallery();
            moveToIndex(index);
        });
        card.querySelector<HTMLImageElement>('.music-cover-image')?.addEventListener('error', (event) => {
            const image = event.currentTarget as HTMLImageElement;
            const fallback = image.previousElementSibling as HTMLElement | null;
            image.hidden = true;
            if (fallback?.classList.contains('music-cover-fallback')) {
                fallback.removeAttribute('aria-hidden');
                fallback.setAttribute('role', 'img');
                fallback.setAttribute('aria-label', image.alt);
            }
        });
    });

    detailImage?.addEventListener('error', () => {
        detailImage.hidden = true;
        detailFallback?.removeAttribute('aria-hidden');
        detailFallback?.setAttribute('role', 'img');
        detailFallback?.setAttribute('aria-label', detailImage.alt);
    });

    window.addEventListener('wheel', (event) => {
        if (window.innerWidth < 1024 || detailState !== 'gallery') return;
        event.preventDefault();
        if (!entered) {
            enterGallery();
            return;
        }
        targetOffset = clamp(targetOffset + event.deltaY * 1.15 + event.deltaX, 0, limit);
        navigationIndex = findNearestCard(targetOffset);
        scheduleMusicFrame();
    }, { passive: false });

    window.addEventListener('pointermove', updatePointer, { passive: true });
    addMediaQueryChangeListener(reducedMotion, () => {
        if (reducedMotion.matches) resetPointerEffects();
        renderMusicFrame();
    });
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Tab' && detailState !== 'gallery') {
            event.preventDefault();
            if (detailState === 'preparing') selectedCard?.focus({ preventScroll: true });
            else detail.focus({ preventScroll: true });
            return;
        }
        if (event.key === 'Escape' && detailState !== 'gallery') {
            event.preventDefault();
            closeDetail();
            return;
        }
        if (detailState !== 'gallery') return;
        if (window.innerWidth < 1024) return;

        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault();
            enterGallery();
            const nextIndex = clamp(navigationIndex + (event.key === 'ArrowRight' ? 1 : -1), 0, cards.length - 1);
            moveToIndex(nextIndex);
            cards[nextIndex].focus({ preventScroll: true });
        }
        if (event.key === 'Enter') {
            if (event.target instanceof HTMLElement && event.target.closest('[data-music-album]')) return;
            event.preventDefault();
            void openDetail(cards[navigationIndex], true);
        }
    });

    detail.addEventListener('click', closeDetail);
    detailPanel.addEventListener('click', (event) => {
        if (
            event.target instanceof HTMLElement
            && event.target.closest('.music-detail__tracks, .music-detail__stage, .music-detail__artist, .music-detail__copy h2, .music-detail__meta')
        ) event.stopPropagation();
    });

    measure();
    queueAlbumWindowDecode(activeIndex);
    if ('ResizeObserver' in window) {
        const resizeObserver = new ResizeObserver(measure);
        resizeObserver.observe(viewport);
        resizeObserver.observe(track);
    }
    window.addEventListener('resize', measure);
    scheduleMusicFrame();

    window.addEventListener('pagehide', () => {
        if (animationFrame !== undefined) window.cancelAnimationFrame(animationFrame);
        animationFrame = undefined;
        cancelQueuedAlbumWarmup();
        if (detailState === 'preparing') closeDetail();
        detailAnimations.forEach((animation) => animation.pause());
    });
    window.addEventListener('pageshow', () => {
        measure();
        scheduleMusicFrame();
        queueAlbumWindowDecode(activeIndex);
        if (detailState === 'opening' || detailState === 'closing') {
            detailAnimations.forEach((animation) => animation.play());
        }
    });
}

function initPlumBackground() {
    const root = document.querySelector<HTMLElement>('[data-plum-background]');
    if (!root || root.dataset.plumBackgroundReady === 'true') return;

    const canvas = root.querySelector<HTMLCanvasElement>('canvas');
    if (!canvas) return;

    root.dataset.plumBackgroundReady = 'true';

    type DrawStep = () => void;

    const R180 = Math.PI;
    const R90 = Math.PI / 2;
    const R15 = Math.PI / 12;
    const THRESHOLD = 30;
    const LEN = 6;
    const INTERVAL = 1000 / 40;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    let rafId: number | undefined;
    let resizeTimer: number | undefined;
    let pendingSteps: DrawStep[] = [];
    let lastTime = performance.now();
    let width = 0;
    let height = 0;
    let ctx: CanvasRenderingContext2D | null = null;

    function getStrokeStyle() {
        return getComputedStyle(root).getPropertyValue('--plum-line-color').trim() || 'rgba(136, 136, 136, 0.145)';
    }

    function initCanvas() {
        const context = canvas.getContext('2d');
        if (!context) return null;

        const dpr = window.devicePixelRatio || 1;
        width = Math.ceil(window.innerWidth);
        height = Math.ceil(window.innerHeight);

        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        canvas.width = Math.ceil(width * dpr);
        canvas.height = Math.ceil(height * dpr);

        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        context.lineWidth = 1;
        context.lineCap = 'round';
        context.strokeStyle = getStrokeStyle();
        ctx = context;

        return context;
    }

    function polarToCartesian(x = 0, y = 0, radius = 0, theta = 0) {
        return [
            x + radius * Math.cos(theta),
            y + radius * Math.sin(theta)
        ];
    }

    function stopDrawing() {
        if (rafId !== undefined) {
            window.cancelAnimationFrame(rafId);
            rafId = undefined;
        }

        pendingSteps = [];
    }

    // Adapted from lin-stephanie/astro-antfustyle-theme's Plum.astro, MIT.
    function drawStep(x: number, y: number, rad: number, counter: { value: number } = { value: 0 }) {
        if (!ctx) return;

        const length = Math.random() * LEN;
        const [nx, ny] = polarToCartesian(x, y, length, rad);

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(nx, ny);
        ctx.stroke();
        counter.value += 1;

        if (nx < -100 || nx > width + 100 || ny < -100 || ny > height + 100) return;

        const rad1 = rad + Math.random() * R15;
        const rad2 = rad - Math.random() * R15;
        const rate = counter.value <= THRESHOLD ? 0.8 : 0.5;

        if (Math.random() < rate) pendingSteps.push(() => drawStep(nx, ny, rad1, counter));
        if (Math.random() < rate) pendingSteps.push(() => drawStep(nx, ny, rad2, counter));
    }

    function seedDrawing() {
        const randomMiddle = () => Math.random() * 0.6 + 0.2;

        pendingSteps = [
            () => drawStep(randomMiddle() * width, -5, R90),
            () => drawStep(randomMiddle() * width, height + 5, -R90),
            () => drawStep(-5, randomMiddle() * height, 0),
            () => drawStep(width + 5, randomMiddle() * height, R180)
        ];

        if (width < 640) pendingSteps = pendingSteps.slice(0, 2);
    }

    function drawFrame() {
        const now = performance.now();
        if (now - lastTime < INTERVAL) return;

        lastTime = now;

        const steps: DrawStep[] = [];
        pendingSteps = pendingSteps.filter((step) => {
            if (Math.random() > 0.5) {
                steps.push(step);
                return false;
            }

            return true;
        });
        steps.forEach((step) => step());
    }

    function startFrameLoop() {
        rafId = window.requestAnimationFrame(() => {
            if (!pendingSteps.length) {
                stopDrawing();
                return;
            }

            drawFrame();
            startFrameLoop();
        });
    }

    function drawInstantly() {
        let guard = 0;

        while (pendingSteps.length && guard < 12000) {
            const steps = pendingSteps.splice(0, pendingSteps.length);
            guard += steps.length;
            steps.forEach((step) => step());
        }

        pendingSteps = [];
    }

    function redraw(options: { instant?: boolean } = {}) {
        stopDrawing();
        const context = initCanvas();
        if (!context) return;

        context.clearRect(0, 0, width, height);
        seedDrawing();
        lastTime = performance.now();

        if (options.instant || reducedMotion.matches) {
            drawInstantly();
            return;
        }

        startFrameLoop();
    }

    function scheduleRedraw() {
        window.requestAnimationFrame(() => redraw({ instant: reducedMotion.matches }));
    }

    window.addEventListener('resize', () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(scheduleRedraw, 160);
    });

    window.addEventListener('onColorSchemeChange', scheduleRedraw);
    addMediaQueryChangeListener(reducedMotion, scheduleRedraw);

    redraw({ instant: reducedMotion.matches });
}

function initSiteMenu() {
    const menuToggle = document.querySelector<HTMLButtonElement>('.site-menu-toggle');
    const nav = document.getElementById('primary-navigation');
    if (!menuToggle || !nav) return;

    function setMenuOpen(open: boolean) {
        menuToggle?.classList.toggle('is-open', open);
        nav?.classList.toggle('is-open', open);
        document.body.classList.toggle('site-nav-open', open);
        menuToggle?.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    menuToggle.addEventListener('click', (event) => {
        event.stopPropagation();
        setMenuOpen(!nav.classList.contains('is-open'));
    });

    nav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => setMenuOpen(false));
    });

    document.addEventListener('click', (event) => {
        const target = event.target;
        if (!document.body.classList.contains('site-nav-open') || !(target instanceof Node)) return;
        if (nav.contains(target) || menuToggle.contains(target)) return;
        setMenuOpen(false);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') setMenuOpen(false);
    });

    const desktopQuery = window.matchMedia('(min-width: 921px)');
    const closeOnDesktop = (event: MediaQueryListEvent) => {
        if (event.matches) setMenuOpen(false);
    };
    addMediaQueryChangeListener(desktopQuery, closeOnDesktop);
}

function initBackToTop() {
    const button = document.getElementById('back-to-top') as HTMLButtonElement | null;
    if (!button) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateVisibility = () => {
        button.classList.toggle('is-visible', window.scrollY > 420);
    };

    button.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    });
    window.addEventListener('scroll', updateVisibility, { passive: true });
    updateVisibility();
}

function initArticleTocHover() {
    const toc = document.querySelector<HTMLElement>('[data-article-toc]');
    const articleMain = document.querySelector<HTMLElement>('.article-detail__main');
    if (!toc || !articleMain) return;

    const toggle = toc.querySelector<HTMLButtonElement>('[data-article-toc-toggle]');
    const panel = toc.querySelector<HTMLElement>('[data-article-toc-panel]');
    const nav = toc.querySelector<HTMLElement>('[data-article-toc-nav]');
    const desktopQuery = window.matchMedia('(min-width: 981px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let lockedOpen = false;
    let pointerInside = false;
    let focusInside = false;
    let autoOpen = false;

    function syncVisible() {
        const shouldShow = desktopQuery.matches && (lockedOpen || pointerInside || focusInside || autoOpen);
        document.body.classList.toggle('is-article-toc-visible', shouldShow);
        toc.classList.toggle('is-article-toc-active', shouldShow);
        toc.classList.toggle('is-article-toc-auto-revealing', shouldShow && autoOpen);
        panel?.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
        toggle?.setAttribute('aria-expanded', shouldShow ? 'true' : 'false');
        toggle?.setAttribute('aria-label', shouldShow ? '隐藏文章目录' : '显示文章目录');
    }

    function setAutoReveal(active: boolean) {
        autoOpen = active;
        syncVisible();
    }

    function closeToc() {
        lockedOpen = false;
        pointerInside = false;
        focusInside = false;
        setAutoReveal(false);
    }

    toc.addEventListener('pointerenter', () => {
        pointerInside = true;
        syncVisible();
    });

    toc.addEventListener('pointerleave', () => {
        pointerInside = false;
        syncVisible();
    });

    toc.addEventListener('focusin', () => {
        focusInside = true;
        syncVisible();
    });
    toc.addEventListener('focusout', (event) => {
        const relatedTarget = event.relatedTarget;
        if (relatedTarget instanceof Node && toc.contains(relatedTarget)) return;
        focusInside = false;
        syncVisible();
    });

    toggle?.addEventListener('click', () => {
        if (lockedOpen && document.body.classList.contains('is-article-toc-visible')) {
            closeToc();
            return;
        }
        lockedOpen = true;
        syncVisible();
    });

    document.addEventListener('click', (event) => {
        const target = event.target;
        if (!lockedOpen || !(target instanceof Node)) return;
        if (toc.contains(target) || articleMain.contains(target)) return;
        closeToc();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        closeToc();
    });

    addMediaQueryChangeListener(desktopQuery, (event) => {
        if (event.matches) return;
        closeToc();
    });

    if (!nav) return;

    type TocEntry = {
        heading: HTMLElement;
        item: HTMLLIElement | null;
        link: HTMLAnchorElement;
    };

    function getTocLinkId(link: HTMLAnchorElement) {
        const href = link.getAttribute('href') || '';
        const hashIndex = href.indexOf('#');
        if (hashIndex === -1) return '';

        const rawHash = href.slice(hashIndex + 1);
        try {
            return decodeURIComponent(rawHash);
        } catch {
            return rawHash;
        }
    }

    const headings = Array.from(articleMain.querySelectorAll<HTMLElement>('h1[id], h2[id], h3[id], h4[id]'));
    const headingById = new Map(headings.map((heading) => [heading.id, heading]));
    const tocEntries = Array.from(nav.querySelectorAll<HTMLAnchorElement>('a[href*="#"]')).flatMap((link): TocEntry[] => {
        link.setAttribute('data-article-toc-link', '');
        const heading = headingById.get(getTocLinkId(link));
        if (!heading) return [];

        return [{
            heading,
            item: link.closest<HTMLLIElement>('li'),
            link
        }];
    });

    if (!tocEntries.length) return;

    let currentEntry: TocEntry | null = null;
    let currentUpdateFrame: number | undefined;
    let lastKnownScrollY = window.scrollY;

    function keepCurrentLinkVisible(link: HTMLAnchorElement) {
        if (!toc.classList.contains('is-article-toc-active')) return;

        const navRect = nav.getBoundingClientRect();
        const linkRect = link.getBoundingClientRect();
        const topOverflow = linkRect.top - navRect.top;
        const bottomOverflow = linkRect.bottom - navRect.bottom;
        if (topOverflow >= 0 && bottomOverflow <= 0) return;

        nav.scrollBy({
            top: topOverflow < 0 ? topOverflow - 8 : bottomOverflow + 8,
            behavior: reducedMotion.matches ? 'auto' : 'smooth'
        });
    }

    function setArticleTocCurrent(nextEntry: TocEntry) {
        if (currentEntry === nextEntry) return;
        currentEntry = nextEntry;

        tocEntries.forEach((entry) => {
            entry.link.removeAttribute('aria-current');
            entry.item?.classList.remove(
                'is-article-toc-active',
                'is-article-toc-ancestor',
                'is-article-toc-current',
                'active-class'
            );
        });

        nextEntry.link.setAttribute('aria-current', 'location');
        nextEntry.item?.classList.add('is-article-toc-active', 'is-article-toc-current', 'active-class');

        let ancestor = nextEntry.item?.parentElement?.closest<HTMLLIElement>('li') || null;
        while (ancestor && toc.contains(ancestor)) {
            ancestor.classList.add('is-article-toc-active', 'is-article-toc-ancestor');
            ancestor = ancestor.parentElement?.closest<HTMLLIElement>('li') || null;
        }

        keepCurrentLinkVisible(nextEntry.link);
    }

    function updateCurrentTocEntry() {
        currentUpdateFrame = undefined;
        const scrolledSinceLastUpdate = window.scrollY !== lastKnownScrollY;
        lastKnownScrollY = window.scrollY;

        const targetLine = Math.max(120, window.innerHeight * 0.32);
        const nextEntry = tocEntries.reduce((activeEntry, entry) => {
            const top = entry.heading.getBoundingClientRect().top;
            return top <= targetLine ? entry : activeEntry;
        }, tocEntries[0]);

        const entryChanged = currentEntry !== null && currentEntry !== nextEntry;
        setArticleTocCurrent(nextEntry);
        if (scrolledSinceLastUpdate && entryChanged && !lockedOpen) setAutoReveal(true);
    }

    function scheduleCurrentTocUpdate() {
        if (currentUpdateFrame !== undefined) return;
        currentUpdateFrame = window.requestAnimationFrame(updateCurrentTocEntry);
    }

    tocEntries.forEach((entry) => {
        entry.link.addEventListener('click', () => {
            setArticleTocCurrent(entry);
            window.setTimeout(scheduleCurrentTocUpdate, 80);
        });
    });

    window.addEventListener('scroll', scheduleCurrentTocUpdate, { passive: true });
    window.addEventListener('resize', scheduleCurrentTocUpdate);
    window.addEventListener('hashchange', scheduleCurrentTocUpdate);
    updateCurrentTocEntry();
}

function initRevealOnScroll() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches || !('IntersectionObserver' in window)) return;

    const selectors = [
        '.article-detail__content > blockquote',
        '.article-detail__content > .highlight',
        '.article-detail__content > pre',
        '.article-detail__content > .mermaid-diagram',
        '.article-detail__content > .table-wrapper',
        '.article-detail__content > figure',
        '.article-detail__content > details',
        '.article-detail__content > hr',
        '.article-detail__footer'
    ];

    const targets = selectors.flatMap((selector) =>
        Array.from(document.querySelectorAll<HTMLElement>(selector))
    );
    const imageBlocks = Array.from(
        document.querySelectorAll<HTMLElement>('.article-detail__content > p')
    ).filter((block) => {
        const children = Array.from(block.children).filter((child) => child.tagName !== 'BR');
        const onlyChild = children[0];
        return children.length === 1 && Boolean(onlyChild) && (
            onlyChild.tagName === 'IMG'
            || onlyChild.classList.contains('gallery')
            || (onlyChild.tagName === 'A' && Boolean(onlyChild.querySelector('img')))
        );
    });
    imageBlocks.forEach((block) => {
        if (!targets.includes(block)) targets.push(block);
    });

    const filteredTargets = targets.filter((target, index) => {
        if (target.tagName === 'PRE' && target.closest('.highlight')) return false;
        return targets.indexOf(target) === index;
    });
    if (!filteredTargets.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, {
        rootMargin: '0px 0px -6% 0px',
        threshold: 0.1
    });

    filteredTargets.forEach((target, index) => {
        target.classList.add('reveal-on-scroll');
        target.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 32}ms`);
        observer.observe(target);
    });
}

function initImageLightbox() {
    const images = Array.from(document.querySelectorAll<HTMLImageElement>('.gallery-image'));
    if (!images.length) return;

    const lightbox = document.createElement('div');
    lightbox.className = 'image-lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', '图片预览');
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.innerHTML = [
        '<button class="image-lightbox__close" type="button" aria-label="关闭图片预览">&times;</button>',
        '<figure class="image-lightbox__figure">',
        '<img class="image-lightbox__image" alt="">',
        '<figcaption class="image-lightbox__caption"></figcaption>',
        '</figure>'
    ].join('');

    const preview = lightbox.querySelector<HTMLImageElement>('.image-lightbox__image');
    const caption = lightbox.querySelector<HTMLElement>('.image-lightbox__caption');
    const closeButton = lightbox.querySelector<HTMLButtonElement>('.image-lightbox__close');
    if (!preview || !caption || !closeButton) return;

    let trigger: HTMLImageElement | null = null;

    function close() {
        if (!lightbox.classList.contains('is-open')) return;
        lightbox.classList.remove('is-open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('image-lightbox-open');
        preview.removeAttribute('src');
        trigger?.focus({ preventScroll: true });
        trigger = null;
    }

    function open(image: HTMLImageElement) {
        trigger = image;
        if (!image.hasAttribute('tabindex')) image.tabIndex = 0;
        preview.src = image.currentSrc || image.src;
        preview.alt = image.alt;
        caption.textContent = image.alt;
        caption.hidden = !image.alt;
        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('image-lightbox-open');
        closeButton.focus({ preventScroll: true });
    }

    images.forEach((image) => {
        if (!image.hasAttribute('tabindex')) image.tabIndex = 0;
        image.setAttribute('role', 'button');
        image.setAttribute('aria-label', image.alt ? `查看大图：${image.alt}` : '查看大图');

        image.addEventListener('click', (event) => {
            event.preventDefault();
            open(image);
        });
        image.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            open(image);
        });
    });

    closeButton.addEventListener('click', close);
    lightbox.addEventListener('click', (event) => {
        if (event.target === lightbox) close();
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') close();
    });
    document.body.appendChild(lightbox);
}

function initRouteTransitionDemo() {
    const mask = document.getElementById('route-transition-mask') as HTMLElement | null;
    if (!mask || document.documentElement.dataset.routeTransitionReady === 'true') return;

    document.documentElement.dataset.routeTransitionReady = 'true';

    const storageKey = 'RouteTransitionPreviewState';
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coverDuration = () => reducedMotion.matches ? 80 : 620;
    const revealDuration = () => reducedMotion.matches ? 80 : 300;
    let isTransitioning = false;
    let loadingTimer: ReturnType<typeof window.setTimeout> | null = null;

    function clearLoadingTimer() {
        if (!loadingTimer) return;
        window.clearTimeout(loadingTimer);
        loadingTimer = null;
    }

    function clearMaskState() {
        clearLoadingTimer();
        mask.classList.remove('is-starting', 'is-covering', 'is-loading', 'is-revealing');
        delete document.documentElement.dataset.routeTransitioning;
        isTransitioning = false;
    }

    function setMaskGeometry(x: number, y: number) {
        const radius = Math.ceil(Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        ));

        mask.style.setProperty('--route-transition-x', `${x}px`);
        mask.style.setProperty('--route-transition-y', `${y}px`);
        mask.style.setProperty('--route-transition-radius', `${radius}px`);
    }

    function storeTransitionOrigin(x: number, y: number) {
        try {
            window.sessionStorage.setItem(storageKey, JSON.stringify({
                x,
                y,
                timestamp: Date.now()
            }));
        } catch {
            // The animation still works when session storage is unavailable.
        }
    }

    function readTransitionOrigin() {
        try {
            const raw = window.sessionStorage.getItem(storageKey);
            if (!raw) return null;
            window.sessionStorage.removeItem(storageKey);
            const parsed = JSON.parse(raw) as { x?: unknown; y?: unknown; timestamp?: unknown };
            if (typeof parsed.x !== 'number' || typeof parsed.y !== 'number') return null;
            if (typeof parsed.timestamp !== 'number' || Date.now() - parsed.timestamp > 8000) return null;
            return { x: parsed.x, y: parsed.y };
        } catch {
            return null;
        }
    }

    function getTransitionUrl(event: MouseEvent) {
        if (
            event.defaultPrevented
            || event.button !== 0
            || event.metaKey
            || event.ctrlKey
            || event.shiftKey
            || event.altKey
        ) {
            return null;
        }

        const target = event.target;
        if (!(target instanceof Element)) return null;

        const anchor = target.closest<HTMLAnchorElement>('a[href]');
        if (!anchor) return null;
        if (anchor.target && anchor.target !== '_self') return null;
        if (anchor.hasAttribute('download')) return null;
        if (anchor.dataset.routeTransition === 'skip') return null;

        const href = anchor.getAttribute('href');
        if (!href || href.startsWith('#')) return null;

        let url: URL;
        try {
            url = new URL(anchor.href, window.location.href);
        } catch {
            return null;
        }

        if (url.origin !== window.location.origin) return null;
        if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
        if (url.pathname === window.location.pathname && url.search === window.location.search) return null;

        return url;
    }

    function revealPreviousTransition() {
        const origin = readTransitionOrigin();
        if (!origin) return;

        setMaskGeometry(origin.x, origin.y);
        mask.style.transition = 'none';
        mask.classList.add('is-covering');
        mask.getBoundingClientRect();
        mask.style.removeProperty('transition');

        window.requestAnimationFrame(() => {
            mask.classList.add('is-revealing');
            window.setTimeout(clearMaskState, revealDuration());
        });
    }

    document.addEventListener('click', (event) => {
        const url = getTransitionUrl(event);
        if (!url) return;

        event.preventDefault();
        if (isTransitioning) return;

        const x = event.clientX || window.innerWidth / 2;
        const y = event.clientY || window.innerHeight / 2;
        isTransitioning = true;
        document.documentElement.dataset.routeTransitioning = 'true';
        setMaskGeometry(x, y);
        storeTransitionOrigin(x, y);
        mask.classList.add('is-starting');
        mask.getBoundingClientRect();

        window.requestAnimationFrame(() => {
            mask.classList.remove('is-starting');
            mask.classList.add('is-covering');
            loadingTimer = window.setTimeout(() => {
                if (isTransitioning) mask.classList.add('is-loading');
            }, 180);
        });

        window.setTimeout(() => {
            window.location.assign(url.href);
        }, coverDuration());
    }, true);

    window.addEventListener('pageshow', (event) => {
        if (event.persisted) clearMaskState();
    });

    revealPreviousTransition();
}

function initCustomScripts() {
    [
        initRouteTransitionDemo,
        initSiteMenu,
        initBackToTop,
        initArticleTocHover,
        initRevealOnScroll,
        initThemeToggle,
        initCodeCopyButtons,
        initMusicGallery,
        initPlumBackground,
        initImageLightbox
    ].forEach((init) => {
        try {
            init();
        } catch (error) {
            console.error('Site initializer failed', error);
        }
    });

    window.requestAnimationFrame(() => document.body.classList.add('is-loaded'));
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCustomScripts);
} else {
    initCustomScripts();
}
