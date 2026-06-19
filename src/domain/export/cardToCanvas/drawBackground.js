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
        width: parseBackgroundPart(width || `${rect.width}px`, rect.width),
        height: parseBackgroundPart(height || `${rect.height}px`, rect.height)
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

function normalizePositionToken(token) {
    token = token.trim();
    if (token === 'left' || token === 'top') return '0%';
    if (token === 'center') return '50%';
    if (token === 'right' || token === 'bottom') return '100%';
    return token;
}

function parsePositionValue(token, areaSize, imageSize) {
    token = normalizePositionToken(token);
    if (token.endsWith('%')) {
        const pct = parseFloat(token) / 100;
        return (areaSize - imageSize) * pct;
    }

    return token.endsWith('px') ? parseFloat(token) : 0;
}

function getBackgroundPosition(rootRect, originRect, imgSize, style) {
    const [xToken = '0%', yToken = '0%'] = style.backgroundPosition.split(' ');
    const offsetX = parsePositionValue(xToken, originRect.width, imgSize.width);
    const offsetY = parsePositionValue(yToken, originRect.height, imgSize.height);

    const x = originRect.left - rootRect.left + offsetX;
    const y = originRect.top - rootRect.top + offsetY;

    return { x, y };
}

function drawBackgroundColor(ctx, style) {
    ctx.fillStyle = style.backgroundColor;
    ctx.fill();
}

// TODO: add support for multiple backgrounds
async function drawBackgroundImage(ctx, elementRect, rootRect, style) {
    const url = extractBackgroundUrl(style.backgroundImage);
    if (!url) return;

    const img = await loadImage(url);
    const originRect = getOriginRect(elementRect, style);
    const imgSize = getBackgroundSize(img, originRect, style);
    const { x, y } = getBackgroundPosition(rootRect, originRect, imgSize, style);
    ctx.drawImage(img, x, y, imgSize.width, imgSize.height);
}

export async function drawBackground(ctx, element, style, rootRect) {
    const elementRect = element.getBoundingClientRect();

    ctx.save();
    ctx.beginPath();
    ctx.rect(
        elementRect.left - rootRect.left,
        elementRect.top - rootRect.top,
        elementRect.width,
        elementRect.height
    );
    ctx.clip();
    drawBackgroundColor(ctx, style);
    await drawBackgroundImage(ctx, elementRect, rootRect, style);
    ctx.restore();
}
