const FOCUSABLE_TAGS = new Set([
    'CM-EDITABLE-TEXT',
    'CM-EDITABLE-HTML',
    'CM-EDITABLE-IMAGE',
    'CM-EDITABLE-OPTIONS'
]);

function isFocusable(element) {
    return element instanceof HTMLElement
        && FOCUSABLE_TAGS.has(element.tagName)
        && !element.hasAttribute('disabled')
        && !element.hidden;
}

function nextNode(node) {
    if (node.firstElementChild)
        return node.firstElementChild;

    while (node) {
        if (node.nextElementSibling)
            return node.nextElementSibling;
        node = node.parentElement;
    }

    return null;
}

function prevNode(node) {
    if (!node.previousElementSibling)
        return node.parentElement;

    node = node.previousElementSibling;
    while (node.lastElementChild)
        node = node.lastElementChild;

    return node;
}

function focusNextEditable(start) {
    let node = start;
    while ((node = nextNode(node))) {
        if (!isFocusable(node)) continue;
        node.focus();
        return true;
    }
    return false;
}

function focusPreviousEditable(start) {
    let node = start;
    while ((node = prevNode(node))) {
        if (!isFocusable(node)) continue;
        node.focus();
        return true;
    }
    return false;
}

export function makeNavigationHandler(element) {
    function getKeys(attr) {
        return (element.getAttribute(attr) || '').split(',').filter(Boolean);
    }

    function eventMatchesNext(event) {
        const customNextKeys = getKeys('next-keys');
        return event.key === 'Enter'
            || (event.key === 'Tab' && !event.shiftKey)
            || (customNextKeys.includes(event.key) && element.caretAtEnd);
    }

    function eventMatchesPrevious(event) {
        const customPrevKeys = getKeys('prev-keys');
        return (event.key === 'Tab' && event.shiftKey)
            || (customPrevKeys.includes(event.key) && element.caretAtStart)
    }

    function goNext(event) {
        if (!eventMatchesNext(event)) return false;
        if (focusNextEditable(element))
            event.preventDefault();
    }

    function goPrevious(event) {
        if (!eventMatchesPrevious(event)) return false;
        if (focusPreviousEditable(element))
            event.preventDefault();
    }

    return function onKeyDown(event) {
        if (event.isComposing) return;
        return goNext(event) || goPrevious(event);
    };
}
