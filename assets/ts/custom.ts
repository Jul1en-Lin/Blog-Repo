function initPostFilters() {
    const tools = document.querySelector('[data-post-tools]');
    if (!tools) return;

    const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-blog-filter]'));
    const search = document.querySelector<HTMLInputElement>('[data-blog-search]');
    const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-blog-card]'));
    const yearGroups = Array.from(document.querySelectorAll<HTMLElement>('[data-blog-year-group]'));
    const empty = document.querySelector<HTMLElement>('[data-blog-empty]');
    const count = document.querySelector<HTMLElement>('[data-blog-count]');

    let activeCategory = 'all';

    function normalize(value: string) {
        return value.trim().toLowerCase();
    }

    function applyFilters() {
        const query = normalize(search?.value || '');
        let visible = 0;

        cards.forEach((card) => {
            const categories = normalize(card.dataset.categories || '');
            const title = normalize(card.dataset.title || '');
            const summary = normalize(card.dataset.summary || '');
            const matchesCategory = activeCategory === 'all' || categories.split(/\s+/).includes(activeCategory);
            const matchesQuery = !query || title.includes(query) || summary.includes(query);
            const shouldShow = matchesCategory && matchesQuery;

            card.hidden = !shouldShow;
            if (shouldShow) visible += 1;
        });

        yearGroups.forEach((group) => {
            const groupCards = Array.from(group.querySelectorAll<HTMLElement>('[data-blog-card]'));
            group.hidden = groupCards.length > 0 && groupCards.every((card) => card.hidden);
        });

        if (empty) empty.hidden = visible !== 0;
        if (count) count.textContent = String(visible);
    }

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            activeCategory = normalize(button.dataset.blogFilter || 'all');
            buttons.forEach((item) => {
                const isActive = item === button;
                item.classList.toggle('is-active', isActive);
                item.setAttribute('aria-pressed', isActive ? 'true' : 'false');
            });
            applyFilters();
        });

        button.addEventListener('keydown', (event) => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;

            event.preventDefault();
            const currentIndex = buttons.indexOf(button);
            let nextIndex = currentIndex;

            if (event.key === 'ArrowLeft') nextIndex = currentIndex <= 0 ? buttons.length - 1 : currentIndex - 1;
            if (event.key === 'ArrowRight') nextIndex = currentIndex >= buttons.length - 1 ? 0 : currentIndex + 1;
            if (event.key === 'Home') nextIndex = 0;
            if (event.key === 'End') nextIndex = buttons.length - 1;

            buttons[nextIndex]?.focus();
        });
    });

    search?.addEventListener('input', applyFilters);
    applyFilters();
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
            window.localStorage.setItem('StackColorScheme', scheme === getSystemScheme() ? 'auto' : scheme);
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
    reducedMotion.addEventListener('change', scheduleRedraw);

    redraw({ instant: reducedMotion.matches });
}

function initCustomScripts() {
    initThemeToggle();
    initPostFilters();
    initCodeCopyButtons();
    initPlumBackground();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCustomScripts);
} else {
    initCustomScripts();
}
