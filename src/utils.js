export function toCamelCase(str, sep = ' ') {
    return str.split(sep).map((word, n) => {
        return n > 0
            ? word[0].toUpperCase() + word.slice(1).toLowerCase()
            : word.toLowerCase();
    }).join('');
}

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
