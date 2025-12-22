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

export function esc(str) {
    return String(str ?? '').replace(/"/g, '&quot;');
}

export function escapeHTML(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
