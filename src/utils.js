export const show = el => (el.style.display = '');
export const hide = el => (el.style.display = 'none');

export function emit(element, name, detail = {}) {
    const event = new CustomEvent(name, {
        detail,
        bubbles: true,
        composed: true,
        cancelable: false
    });
    return element.dispatchEvent(event);
}

export function bindCustomDragEvents(element, callbacks) {
    element.addEventListener('dragover', e => {
        e.preventDefault();
        element.classList.add('dragover');
    });

    element.addEventListener('dragleave', () => {
        element.classList.remove('dragover');
    });

    element.addEventListener('drop', e => {
        e.preventDefault();
        element.classList.remove('dragover');
        callbacks.onDrop && callbacks.onDrop();
    })
}

export function binarySearch(min, max, check, maxIt) {
    if (check(max)) return max;
    if (!check(min)) return min;

    let low = min;
    let high = max;
    let best = low;

    for (let i = 0; i < maxIt; i++) {
        const mid = (low + high) / 2;
        const fits = check(mid);

        if (fits) {
            best = mid;
            low = mid;
        } else {
            high = mid;
        }
    }

    return best;
}

export function fnv1a(str) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = (hash * 0x01000193) >>> 0;
    }
    return (hash >>> 0).toString(16);
}

export function esc(str) {
    return String(str ?? '').replace(/"/g, "&quot;");
}
