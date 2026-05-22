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

function initCustomScripts() {
    initThemeToggle();
    initPostFilters();
    initCodeCopyButtons();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCustomScripts);
} else {
    initCustomScripts();
}
