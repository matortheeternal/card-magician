function hasText(node) {
    return Boolean(node.nodeValue && node.nodeValue.trim());
}

function getFirstTextShadow(textShadow) {
    let depth = 0;
    for (let i = 0; i < textShadow.length; i++) {
        if (textShadow[i] === '(') depth++;
        if (textShadow[i] === ')') depth--;
        if (textShadow[i] === ',' && depth === 0)
            return textShadow.slice(0, i);
    }
    return textShadow;
}

function applyTextShadow(ctx, style) {
    ctx.shadowColor = 'transparent';
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;

    if (!style.textShadow || style.textShadow === 'none') return;
    const number = '(-?(?:\\d+(?:\\.\\d*)?|\\.\\d+))';
    const shadow = getFirstTextShadow(style.textShadow).trim();
    const match = shadow.match(new RegExp(
        `^(.+?)\\s+${number}px\\s+${number}px(?:\\s+${number}px)?$`
    ));
    if (!match) return;

    ctx.shadowColor = match[1];
    ctx.shadowOffsetX = parseFloat(match[2]);
    ctx.shadowOffsetY = parseFloat(match[3]);
    ctx.shadowBlur = parseFloat(match[4] || '0');
}

function applyFontStyle(ctx, style) {
    ctx.fillStyle = style.color;
    ctx.fontKerning = style.fontKerning;
    ctx.font = [
        style.fontStyle,
        style.fontWeight,
        style.fontSize,
        style.fontFamily
    ].filter(Boolean).join(' ');
    applyTextShadow(ctx, style);
}

function segmentGraphemes(text) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    const segmentData = segmenter.segment(text);
    return Array.from(segmentData, ({ index, segment }) => ({
        start: index,
        end: index + segment.length
    }));
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
    for (const grapheme of segmentGraphemes(textNode.data))
        textUnits.push(newTextUnit(textNode, grapheme, range));
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
        let text = textNode.nodeValue.substring(start, end);
        if (style.textTransform === 'uppercase')
            text = text.toUpperCase();
        if (style.textTransform === 'lowercase')
            text = text.toLowerCase();
        const { x, y } = getMinimumOffset(rects);
        ctx.fillText(text, x - rootRect.left, y - rootRect.top + baseline);
    }
}
