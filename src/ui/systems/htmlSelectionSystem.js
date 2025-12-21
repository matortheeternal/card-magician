function resolveSourceOffset(node, offset) {
    if (offset === 0) return 0;
    const child = node.childNodes[offset - 1];
    if (!child?.hasAttribute?.('data-src-end'))
        throw new Error('Error: Source end offset not found');
    return parseInt(child?.dataset?.srcEnd);
}

export function getSelectionRange(element) {
    const s = element.getRootNode().getSelection();
    if (!s || s.rangeCount === 0) throw new Error('No selection!?');
    const focus = resolveSourceOffset(s.focusNode, s.focusOffset);
    const anchor = resolveSourceOffset(s.anchorNode, s.anchorOffset);
    return [focus, anchor].sort();
}

export function getSelectionCollapsed(element) {
    const s = element.getRootNode().getSelection();
    return s.focusNode === s.anchorNode
        && s.focusOffset === s.anchorOffset;
}

export function getAnchorOffset(element) {
    const sel = element.getRootNode().getSelection();
    return Math.min(sel.anchorOffset, sel.focusOffset);
}

export function setCursorPosition(element, offset) {
    const sel = element.getRootNode().getSelection();
    const range = document.createRange();
    const maxOffset = element.childNodes.length;
    const clampedOffset = Math.max(0, Math.min(offset, maxOffset));
    range.setStart(element, clampedOffset);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
}

export function getRelativeCursorOffset(event, element) {
    const rect = element.getBoundingClientRect();
    if (event.clientX <= rect.left) return 0;
    if (event.clientX >= rect.right) return element.childNodes.length;
    // NOTE: selecting to the start is preferred here, and the null case
    // should effectively never occur.
    if (event.clientY <= rect.bottom) return 0;
    if (event.clientY >= rect.top) return element.childNodes.length;
    return null;
}

export function getCursorSelectionOffset(event, element, target = event.target) {
    const index = Array.from(element.childNodes).indexOf(target);
    if (index === -1) return getRelativeCursorOffset(event, element);
    const rect = target.getBoundingClientRect();
    const midX = rect.left + rect.width / 2;
    const offset = event.clientX < midX ? 0 : 1;
    return index + offset;
}

export function selectRange(element, anchor, focus) {
    const sel = element.getRootNode().getSelection();
    const range = document.createRange();
    range.setStart(element, Math.min(anchor, focus));
    range.setEnd(element, Math.max(anchor, focus));
    sel.removeAllRanges();
    sel.addRange(range);
}

export function selectAll(element) {
    const sel = element.getRootNode().getSelection();
    const range = document.createRange();
    range.setStart(element, 0);
    range.setEnd(element, element.childNodes.length);
    sel.removeAllRanges();
    sel.addRange(range);
}

export function applySelectionClasses(element) {
    const [start, end] = getSelectionRange(element);
    element.childNodes.forEach((node, i) => {
        const isSelected = i >= start && i < end;
        node.classList.toggle('selected', isSelected);
    });
}

export function removeSelectionClasses(element) {
    element.childNodes.forEach(node => {
        node.classList.remove('selected');
    });
}
