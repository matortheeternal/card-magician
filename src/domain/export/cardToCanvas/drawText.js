function hasText(node) {
    return Boolean(node.nodeValue && node.nodeValue.trim());
}

function applyFontStyle(ctx, style) {
    ctx.fillStyle = style.color;
    ctx.font = [
        style.fontStyle,
        style.fontWeight,
        style.fontSize,
        style.fontFamily
    ].filter(Boolean).join(' ');
}

function segmentGraphemes(text) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    const segmentData = segmenter.segment(text);
    return Array.from(segmentData, ({ index, segment }) => ({
        start: index,
        end: index + segment.length
    }));
}

/**
 * @typedef TextUnit
 * @property {Array<DOMRect>} rects
 * @property {number} start
 * @property {number} end
 */

function merge(currentUnit, textNode, grapheme, range) {
    if (!currentUnit) return;
    range.setStart(textNode, currentUnit.start);
    range.setEnd(textNode, grapheme.end);
    const rects = Array.from(range.getClientRects());
    const firstTop = rects[0]?.top;
    if (rects.some(rect => rect.top !== firstTop)) return;
    currentUnit.end = grapheme.end;
    return true;
}

function newTextUnit(textNode, grapheme, range) {
    const { start, end } = grapheme;
    range.setStart(textNode, start);
    range.setEnd(textNode, end);
    const rects = Array.from(range.getClientRects());
    return { rects, start, end };
}

/**
 * @method
 * @name getTextUnits
 * @description This renderer does not support BiDi text currently. Multiple rects
 *              on the same line and in the same text node are treated as a single
 *              drawable unit.
 * @param {Node} textNode
 * @returns {Array<TextUnit>}
 */
function getTextUnits(textNode) {
    const range = document.createRange();
    const textUnits = [];
    let currentUnit = null;
    for (const grapheme of segmentGraphemes(textNode.data)) {
        if (merge(currentUnit, textNode, grapheme, range)) continue;
        currentUnit = newTextUnit(textNode, grapheme, range);
        textUnits.push(currentUnit);
    }
    return textUnits;
}

function getMinimumOffset(rects) {
    return rects.reduce((min, rect) => {
        min.x = Math.min(rect.left, min.x);
        min.y = Math.min(rect.top, min.y);
        return min;
    }, { x: Number.MAX_VALUE, y: Number.MAX_VALUE });
}

const baselines = new Map();
function computeBaseline(ctx) {
    if (baselines.has(ctx.font))
        return baselines.get(ctx.font);
    const baseline = ctx.measureText('Hg').fontBoundingBoxAscent;
    baselines.set(ctx.font, baseline);
    return baseline;
}

export function drawText(ctx, textNode, style, rootRect) {
    if (!hasText(textNode)) return;
    applyFontStyle(ctx, style);
    const baseline = computeBaseline(ctx);
    ctx.textBaseline = 'alphabetic';

    const segments = getTextUnits(textNode);
    for (const { rects, start, end } of segments) {
        const text = textNode.nodeValue.substring(start, end);
        const { x, y } = getMinimumOffset(rects);
        ctx.fillText(text, x - rootRect.left, y - rootRect.top + baseline);
    }
}
