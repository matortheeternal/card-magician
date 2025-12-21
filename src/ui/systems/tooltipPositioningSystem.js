function rectsIntersect(rect1, rect2) {
    return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
    );
}

function intersectsWithSome(rect, avoidRects) {
    return avoidRects.filter(Boolean).some(a => rectsIntersect(a, rect));
}

function test(tooltip, avoidRects) {
    if (tooltip.element.style.left < 0) return false;
    return !intersectsWithSome(tooltip.currentRect, avoidRects);
}

function resetStyle(tooltip) {
    tooltip.element.style.cssText = '';
}

function tryBottomMiddle(tooltip, editableRect, avoidRects) {
    tooltip.element.style.left = editableRect.left
        + (editableRect.width / 2)
        - (tooltip.width / 2) + 'px';
    return test(tooltip, avoidRects);
}

function tryBottomLeft(tooltip, editableRect, avoidRects) {
    resetStyle(tooltip);
    tooltip.element.style.left = editableRect.right - tooltip.width + 'px';
    tooltip.element.style.top = editableRect.bottom + 2 + 'px';
    return test(tooltip, avoidRects);
}

function tryTopLeft(tooltip, editableRect, avoidRects) {
    resetStyle(tooltip);
    tooltip.element.style.left = editableRect.right - tooltip.width + 'px';
    tooltip.element.style.top = editableRect.top - 19 + 'px';
    return test(tooltip, avoidRects);
}

function tryTopRight(tooltip, editableRect, avoidRects) {
    resetStyle(tooltip);
    tooltip.element.style.left = editableRect.left + 'px';
    tooltip.element.style.top = editableRect.top - 19 + 'px';
    return test(tooltip, avoidRects);
}

function positionTooltip(tooltip, editableRect, avoidRects) {
    if (!editableRect) return;
    return tryBottomMiddle(tooltip, editableRect, avoidRects)
        || tryBottomLeft(tooltip, editableRect, avoidRects)
        || tryTopRight(tooltip, editableRect, avoidRects)
        || tryTopLeft(tooltip, editableRect, avoidRects);
}

export function positionTooltips(tooltips) {
    const avoid = tooltips.map(tooltip => {
        tooltip.cacheRect();
        return tooltip.positionInsideEditable
            ? null
            : tooltip.editable.getBoundingClientRect();
    });
    tooltips.forEach((tooltip, i) => {
        const editableRect = tooltip.editable.getBoundingClientRect();
        positionTooltip(tooltip, editableRect, avoid.toSpliced(i, 1));
        avoid.push(tooltip.currentRect);
    });
}
