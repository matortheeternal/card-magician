import Alpine from 'alpinejs';

function preloadImages(urls) {
    return Promise.all(urls.map(url => {
        const img = new Image();
        const p = new Promise(res => { img.onload = res; img.onerror = res; });
        img.src = url;
        return p;
    }));
}

function collectBackgroundUrls(root) {
    const urls = [];
    root.querySelectorAll('[style]').forEach(node => {
        const bg = node.style.backgroundImage;
        if (bg && bg.startsWith('url(')) {
            const match = bg.match(/url\(["']?(.*?)["']?\)/);
            if (match) urls.push(match[1]);
        }
    });
    return urls;
}

function unmount() {
    if (!currentNode) return;
    currentNode.remove();
    return [null, undefined];
}

async function mount(el, val, currentNode, localKey) {
    if (!val) return unmount();

    const frag = el.content.cloneNode(true);
    let newNode = frag.firstElementChild;
    if (!newNode) return;

    Alpine.addScopeToNode(newNode, { [localKey]: val });
    Alpine.initTree(newNode);

    const urls = collectBackgroundUrls(newNode);
    await preloadImages(urls);

    if (currentNode) {
        el._swapTarget.replaceChild(newNode, currentNode);
    } else {
        el._swapTarget.appendChild(newNode);
    }

    return [newNode, val];
}

function parseSwapConfig(el, evaluate, expression) {
    if (el.tagName !== 'TEMPLATE')
        throw new Error('x-swap must be used on a <template> element');

    let mapping = evaluate(expression);
    if (!mapping || typeof mapping !== 'object')
        throw new Error('x-swap expects an object like { "expr": "localKey" }');

    const entries = Object.entries(mapping);
    if (entries.length !== 1)
        throw new Error('x-swap mapping must contain exactly one entry');

    return entries[0];
}

function bindSwapTarget(el) {
    if (el._swapTarget) return;
    const host = document.createElement('div');
    el.after(host);
    el._swapTarget = host;
}

Alpine.directive('swap', (el, { expression }, { evaluate, evaluateLater, effect, cleanup }) => {
    const [watchExpr, localKey] = parseSwapConfig(el, evaluate, expression);
    const getValue = evaluateLater(watchExpr);
    bindSwapTarget(el)

    let currentNode = null;
    let prevRef;

    effect(() => {
        getValue(async (val) => {
            if (val === prevRef) return;
            [currentNode, prevRef] = await mount(el, val, currentNode, localKey);
        });
    });

    cleanup(() => {
        if (currentNode) currentNode.remove();
        currentNode = null;
        prevRef = undefined;
    });
});
