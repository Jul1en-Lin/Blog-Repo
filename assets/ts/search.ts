interface SearchIndexItem {
    title: string;
    permalink: string;
    content: string;
}

interface SearchResult extends SearchIndexItem {
    matchCount: number;
}

const form = document.querySelector<HTMLFormElement>('[data-search-form]');
const input = form?.querySelector<HTMLInputElement>('input[name="keyword"]');
const resultTitle = document.querySelector<HTMLElement>('[data-search-title]');
const resultList = document.querySelector<HTMLElement>('[data-search-results]');
const resultTemplate = document.querySelector<HTMLTemplateElement>('#search-result-template');
const markTemplate = document.querySelector<HTMLTemplateElement>('#search-mark-template');

let indexPromise: Promise<SearchIndexItem[]> | null = null;
let composing = false;

function normalize(value: string): string {
    return value.toLocaleLowerCase().replace(/\s+/g, ' ').trim();
}

function getKeywords(value: string): string[] {
    return Array.from(new Set(normalize(value).split(' ').filter(Boolean)));
}

function countMatches(value: string, keyword: string): number {
    let count = 0;
    let offset = 0;

    while (offset < value.length) {
        const matchIndex = value.indexOf(keyword, offset);
        if (matchIndex === -1) break;
        count += 1;
        offset = matchIndex + Math.max(keyword.length, 1);
    }

    return count;
}

function getMatchRanges(value: string, keywords: string[]): Array<[number, number]> {
    const normalizedValue = value.toLocaleLowerCase();
    const ranges: Array<[number, number]> = [];

    for (const keyword of keywords) {
        let offset = 0;
        while (offset < normalizedValue.length) {
            const start = normalizedValue.indexOf(keyword, offset);
            if (start === -1) break;
            ranges.push([start, start + keyword.length]);
            offset = start + Math.max(keyword.length, 1);
        }
    }

    ranges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);

    return ranges.reduce<Array<[number, number]>>((merged, range) => {
        const previous = merged[merged.length - 1];
        if (!previous || range[0] > previous[1]) {
            merged.push([...range]);
        } else {
            previous[1] = Math.max(previous[1], range[1]);
        }
        return merged;
    }, []);
}

function appendHighlightedText(
    target: HTMLElement,
    value: string,
    keywords: string[],
    preview = false
): void {
    const ranges = getMatchRanges(value, keywords);
    let start = 0;
    let end = value.length;

    if (preview) {
        const firstMatch = ranges[0]?.[0] ?? 0;
        start = Math.max(0, firstMatch - 36);
        end = Math.min(value.length, start + 180);
    }

    const visibleRanges = ranges
        .map(([rangeStart, rangeEnd]) => [Math.max(start, rangeStart), Math.min(end, rangeEnd)] as [number, number])
        .filter(([rangeStart, rangeEnd]) => rangeStart < rangeEnd);

    if (start > 0) target.append(document.createTextNode('…'));

    let cursor = start;
    for (const [rangeStart, rangeEnd] of visibleRanges) {
        if (rangeStart > cursor) {
            target.append(document.createTextNode(value.slice(cursor, rangeStart)));
        }

        const mark = markTemplate?.content.firstElementChild?.cloneNode(true) as HTMLElement | undefined;
        if (!mark) {
            target.append(document.createTextNode(value.slice(rangeStart, rangeEnd)));
            cursor = rangeEnd;
            continue;
        }
        mark.textContent = value.slice(rangeStart, rangeEnd);
        target.append(mark);
        cursor = rangeEnd;
    }

    if (cursor < end) target.append(document.createTextNode(value.slice(cursor, end)));
    if (end < value.length) target.append(document.createTextNode('…'));
}

function renderResult(item: SearchResult, keywords: string[]): HTMLElement | null {
    const source = resultTemplate?.content.firstElementChild;
    if (!source) return null;

    const article = source.cloneNode(true) as HTMLElement;
    const link = article.querySelector<HTMLAnchorElement>('a');
    const title = article.querySelector<HTMLElement>('[data-result-title]');
    const preview = article.querySelector<HTMLElement>('[data-result-preview]');

    if (!link || !title || !preview) return null;

    link.href = item.permalink;
    appendHighlightedText(title, item.title, keywords);
    appendHighlightedText(preview, item.content.replace(/\s+/g, ' ').trim(), keywords, true);
    return article;
}

async function loadIndex(): Promise<SearchIndexItem[]> {
    if (!form?.dataset.json) return [];

    if (!indexPromise) {
        indexPromise = fetch(form.dataset.json, { credentials: 'same-origin' }).then(async (response) => {
            if (!response.ok) throw new Error(`Search index request failed: ${response.status}`);
            return response.json() as Promise<SearchIndexItem[]>;
        });
    }

    return indexPromise;
}

function clearResults(): void {
    resultList?.replaceChildren();
    if (resultTitle) resultTitle.textContent = '';
}

async function search(value: string): Promise<void> {
    if (!resultList || !resultTitle) return;

    const keywords = getKeywords(value);
    if (keywords.length === 0) {
        clearResults();
        return;
    }

    try {
        const index = await loadIndex();
        const results = index
            .map<SearchResult>((item) => {
                const title = normalize(item.title);
                const content = normalize(item.content);
                const matchCount = keywords.reduce(
                    (count, keyword) => count + countMatches(title, keyword) + countMatches(content, keyword),
                    0
                );
                return { ...item, matchCount };
            })
            .filter((item) => item.matchCount > 0)
            .sort((a, b) => b.matchCount - a.matchCount || a.title.localeCompare(b.title));

        const fragment = document.createDocumentFragment();
        for (const item of results) {
            const rendered = renderResult(item, keywords);
            if (rendered) fragment.append(rendered);
        }

        resultList.replaceChildren(fragment);
        resultTitle.textContent = results.length > 0
            ? `找到 ${results.length} 篇文章`
            : '没有找到相关文章';
    } catch (error) {
        clearResults();
        resultTitle.textContent = '搜索暂时不可用';
        console.error(error);
    }
}

function updateURL(value: string): void {
    const url = new URL(window.location.href);
    if (value.trim()) {
        url.searchParams.set('keyword', value.trim());
    } else {
        url.searchParams.delete('keyword');
    }
    window.history.replaceState(null, '', url);
}

function keywordFromPath(pathname: string): string {
    try {
        return decodeURIComponent(pathname)
            .replace(/\.[a-z0-9]+$/i, '')
            .split(/[/_-]+/)
            .filter(Boolean)
            .join(' ')
            .trim();
    } catch {
        return '';
    }
}

function runSearch(): void {
    if (!input) return;
    updateURL(input.value);
    void search(input.value);
}

if (form && input) {
    const query = new URL(window.location.href).searchParams.get('keyword');
    input.value = query ?? (form.hasAttribute('data-prefill-path') ? keywordFromPath(window.location.pathname) : '');

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        runSearch();
    });
    input.addEventListener('compositionstart', () => {
        composing = true;
    });
    input.addEventListener('compositionend', () => {
        composing = false;
        runSearch();
    });
    input.addEventListener('input', () => {
        if (!composing) runSearch();
    });
    window.addEventListener('popstate', () => {
        input.value = new URL(window.location.href).searchParams.get('keyword') ?? '';
        void search(input.value);
    });

    if (input.value) void search(input.value);
}
