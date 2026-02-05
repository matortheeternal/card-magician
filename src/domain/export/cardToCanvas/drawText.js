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

function binarySubdivision(startIndex, endIndex, getPart, shouldDivide) {
    const part = getPart(startIndex, endIndex);
    if (!shouldDivide(part) || endIndex - startIndex === 1)
        return [part];

    const mid = Math.floor((startIndex + endIndex) / 2);
    return Array.prototype.concat(
        binarySubdivision(startIndex, mid, getPart, shouldDivide),
        binarySubdivision(mid, endIndex, getPart, shouldDivide)
    );
}

/**
 * @typedef TextUnit
 * @property {Array<DOMRect>} rects
 * @property {number} start
 * @property {number} end
 */

function makeGetGraphemePart(textNode, graphemes, range) {
    return function getGraphemePart(startIndex, endIndex) {
        const start = graphemes[startIndex].start;
        const end = graphemes[endIndex - 1].end;
        range.setStart(textNode, start);
        range.setEnd(textNode, end);
        const rects = Array.from(range.getClientRects());
        return { rects, start, end };
    };
}

function getNextUnit(range, textNode, unit, mergedUnits) {
    const previousUnit = mergedUnits[mergedUnits.length - 1];
    if (!previousUnit || unit.rects[0].top !== previousUnit.rects[0].top)
        return unit;
    mergedUnits.pop();
    range.setStart(textNode, previousUnit.start);
    range.setEnd(textNode, unit.end);
    const rects = Array.from(range.getClientRects());
    return { rects, start: previousUnit.start, end: unit.end };
}

function mergeTextUnits(range, textNode, units) {
    const mergedUnits = [];
    for (const unit of units) {
        const nextUnit = getNextUnit(range, textNode, unit, mergedUnits);
        mergedUnits.push(nextUnit);
    }
    return mergedUnits;
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
    const graphemes = segmentGraphemes(textNode.data);
    const range = document.createRange();
    const textUnits = binarySubdivision(
        0,
        graphemes.length,
        makeGetGraphemePart(textNode, graphemes, range),
        ({ rects }) => {
            const firstTop = rects[0]?.top;
            return rects.some(rect => rect.top !== firstTop);
        }
    );

    return mergeTextUnits(range, textNode, textUnits);
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
