import { loadImage } from '../../../shared/imageUtils.js';

function extractBackgroundUrl(css) {
    const match = css.match(/url\(([^)]+)\)/i);
    const url = match?.[1];
    const quoteMatch = url && url.match(/^['"](.+)['"]$/);
    return quoteMatch ? quoteMatch[1] : url;
}

function parseBackgroundPart(str, parentDimension) {
    if (str.endsWith('px')) return parseFloat(str);
    if (!str.endsWith('%'))
        throw new Error(`unrecognized expression ${str}`);
    return parseFloat(str) * parentDimension / 100;
}

function getBackgroundSize(img, rect, style) {
    if (/^auto( auto)?$/.test(style.backgroundSize))
        return { width: img.width, height: img.height };

    const [width, height] = style.backgroundSize.split(' ');
    return {
        width: parseBackgroundPart(width, rect.width),
        height: parseBackgroundPart(height, rect.height)
    };
}

const borderWidthKeys = [
    'borderLeftWidth', 'borderRightWidth',
    'borderTopWidth', 'borderBottomWidth'
];

const paddingKeys = [
    'paddingLeft', 'paddingRight',
    'paddingTop', 'paddingBottom'
];

function parseStylesToFloat(style, keys) {
    return keys.reduce((obj, key) => {
        obj[key] = parseFloat(style[key]);
        return obj;
    }, {});
}

function getOriginRect(rect, style) {
    if (style.backgroundOrigin === 'border-box') return rect;
    const border = parseStylesToFloat(style, borderWidthKeys);
    if (style.backgroundOrigin === 'padding-box') {
        return new DOMRect(
            rect.x + border.borderLeftWidth,
            rect.y + border.borderTopWidth,
            rect.width - border.borderRightWidth,
            rect.height - border.borderBottomWidth
        );
    }
    const padding = parseStylesToFloat(style, paddingKeys);
    return new DOMRect(
        rect.x + padding.paddingLeft + border.borderLeftWidth,
        rect.y + padding.paddingTop + border.borderTopWidth,
        rect.width - padding.paddingRight - border.borderRightWidth,
        rect.height - padding.paddingBottom - border.borderBottomWidth
    );
}

function parseBackgroundPosition(rootRect, style) {
    const [x, y] = style.backgroundPosition.split(' ');
    if (x.includes('%')) return [0, 0];
    return [
        parseBackgroundPart(x, rootRect.width),
        parseBackgroundPart(y, rootRect.height)
    ];
}

function getBackgroundPosition(rootRect, originRect, style) {
    const [xOffset, yOffset] = parseBackgroundPosition(rootRect, style);
    const x = originRect.left - rootRect.left + xOffset;
    const y = originRect.top - rootRect.top + yOffset;
    return { x, y };
}

export async function drawBackground(ctx, element, style, rootRect) {
    const url = extractBackgroundUrl(style.backgroundImage);
    if (!url) return;

    const img = await loadImage(url);
    const elementRect = element.getBoundingClientRect();
    const originRect = getOriginRect(elementRect, style);
    const { width, height } = getBackgroundSize(img, originRect, style);
    const { x, y } = getBackgroundPosition(rootRect, originRect, style);

    ctx.drawImage(img, x, y, width, height);
}
