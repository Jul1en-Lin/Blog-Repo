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

    toggle.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();

        const x = event.clientX;
        const y = event.clientY;
        const willBeDark = getCurrentScheme() !== 'dark';
        const nextScheme: ColorScheme = willBeDark ? 'dark' : 'light';
        const endRadius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        );

        if (!('startViewTransition' in document)) {
            applyScheme(nextScheme);
            return;
        }

        const transition = (document as Document & {
            startViewTransition: (callback: () => void) => {
                ready: Promise<void>;
            };
        }).startViewTransition(() => {
            applyScheme(nextScheme);
        });

        transition.ready.then(() => {
            const clipPath = willBeDark
                ? [`circle(${endRadius}px at ${x}px ${y}px)`, `circle(0px at ${x}px ${y}px)`]
                : [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`];

            document.documentElement.animate(
                { clipPath },
                {
                    duration: 500,
                    easing: 'ease-in-out',
                    fill: 'forwards',
                    pseudoElement: willBeDark
                        ? '::view-transition-old(root)'
                        : '::view-transition-new(root)'
                }
            );
        });
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

function initMusicAlbumFlips() {
    const gallery = document.querySelector<HTMLElement>('.music-album-gallery');
    if (!gallery || gallery.dataset.albumFlipsReady === 'true') return;

    gallery.dataset.albumFlipsReady = 'true';

    const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-album-card]'));
    if (!cards.length) return;

    const entries = cards.flatMap((card) => {
        const toggle = card.querySelector<HTMLButtonElement>('[data-album-toggle]');
        const front = card.querySelector<HTMLElement>('[data-album-front]');
        const back = card.querySelector<HTMLElement>('[data-album-back]');

        if (!toggle || !front || !back) return [];

        return [{
            card,
            toggle,
            front,
            back,
            title: toggle.dataset.albumTitle || ''
        }];
    });

    function setFlipped(entry: typeof entries[number], flipped: boolean) {
        entry.card.classList.toggle('is-flipped', flipped);
        entry.toggle.setAttribute('aria-pressed', flipped ? 'true' : 'false');
        entry.toggle.setAttribute('aria-label', `${flipped ? 'Hide' : 'Show'} details for ${entry.title}`);
        entry.front.setAttribute('aria-hidden', flipped ? 'true' : 'false');
        entry.back.setAttribute('aria-hidden', flipped ? 'false' : 'true');
    }

    function closeAll() {
        entries.forEach((entry) => setFlipped(entry, false));
    }

    entries.forEach((entry) => {
        entry.toggle.addEventListener('click', () => {
            const willFlip = !entry.card.classList.contains('is-flipped');
            closeAll();
            if (willFlip) setFlipped(entry, true);
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeAll();
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
    let lockedOpen = false;

    function setVisible(visible: boolean) {
        document.body.classList.toggle('is-article-toc-visible', visible);
        toggle?.setAttribute('aria-expanded', visible ? 'true' : 'false');
        toggle?.setAttribute('aria-label', visible ? '隐藏文章目录' : '显示文章目录');
    }

    function isInsideReadingColumn(x: number, y: number) {
        const rect = articleMain?.getBoundingClientRect();
        if (!rect) return false;

        const top = Math.min(rect.top, 0) - 48;
        const bottom = Math.max(rect.bottom, window.innerHeight) + 48;
        return x >= rect.left - 72 && x <= rect.right + 32 && y >= top && y <= bottom;
    }

    document.addEventListener('pointermove', (event) => {
        if (lockedOpen) return;
        const revealZone = Math.min(380, Math.max(280, window.innerWidth * 0.22));
        setVisible(event.clientX <= revealZone || isInsideReadingColumn(event.clientX, event.clientY));
    }, { passive: true });

    document.addEventListener('pointerleave', () => {
        if (!lockedOpen) setVisible(false);
    });

    toc.addEventListener('focusin', () => setVisible(true));
    toc.addEventListener('focusout', (event) => {
        const relatedTarget = event.relatedTarget;
        if (lockedOpen || (relatedTarget instanceof Node && toc.contains(relatedTarget))) return;
        setVisible(false);
    });

    toggle?.addEventListener('click', () => {
        if (lockedOpen && document.body.classList.contains('is-article-toc-visible')) {
            lockedOpen = false;
            setVisible(false);
            return;
        }
        lockedOpen = true;
        setVisible(true);
    });

    document.addEventListener('click', (event) => {
        const target = event.target;
        if (!lockedOpen || !(target instanceof Node)) return;
        if (toc.contains(target) || articleMain.contains(target)) return;
        lockedOpen = false;
        setVisible(false);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        lockedOpen = false;
        setVisible(false);
    });
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
        '.article-detail__footer',
        '.music-album-card'
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
        initMusicAlbumFlips,
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
