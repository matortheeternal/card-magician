export const show = el => (el.style.display = '');
export const hide = el => (el.style.display = 'none');

export function toggleDisplay(show, element, otherElement = null) {
    element.style.display = show ? '' : 'none';
    if (!otherElement) return;
    otherElement.style.display = show ? 'none' : '';
}

export function emit(element, name, detail = {}) {
    const event = new CustomEvent(name, {
        detail,
        bubbles: true,
        composed: true,
        cancelable: false
    });
    return element.dispatchEvent(event);
}

export function esc(str) {
    return String(str ?? '').replace(/"/g, '&quot;');
}

/**
 * Escapes HTML markup in a string.
 * @param {string} str
 * @returns {string}
 */
export function escapeHTML(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function imageLoadedOrError(img) {
    return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
    });
}

export async function waitForImages(node) {
    const images = [...node.querySelectorAll('img')];

    await Promise.all(images.map(img => {
        return img.complete
            ? img.decode().catch(() => {})
            : imageLoadedOrError(img);
    }));
}

export async function layoutSettled(root, {
    settleFrames = 4,
    maxWaitMs = 2000,
} = {}) {
    let lastMutation = performance.now();

    const observer = new MutationObserver(() => {
        lastMutation = performance.now();
    });

    observer.observe(root, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
    });

    try {
        const start = performance.now();
        while (true) {
            if (performance.now() - start > maxWaitMs) break;

            let stable = true;
            for (let i = 0; i < settleFrames; i++) {
                await new Promise(requestAnimationFrame);
                const mutatedRecently = performance.now() - lastMutation < 50;
                if (!mutatedRecently) continue;
                stable = false;
                break;
            }

            if (stable) break;
        }
    } finally {
        observer.disconnect();
    }
}

export async function waitForStableLayout(node) {
    await document.fonts.ready;
    await waitForImages(node);
    await layoutSettled(node);
}

export function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Failed to load Jasmine script: ${src}`));
        document.head.appendChild(script);
    });
}

export function loadStyle(href) {
    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = resolve;
        link.onerror = () => reject(new Error('Failed to load Jasmine CSS'));
        document.head.appendChild(link);
    });
}
