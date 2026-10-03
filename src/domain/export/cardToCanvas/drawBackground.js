import { loadImage } from '../../../shared/imageUtils.js';

function splitCssValue(css, isSeparator) {
    const parts = [];
    let start = 0;
    let depth = 0;
    let quote = null;

    for (let i = 0; i < css.length; i++) {
        const char = css[i];
        if (quote) {
            if (char === '\\') i++;
            else if (char === quote) quote = null;
            continue;
        }

        if (char === '"' || char === '\'') {
            quote = char;
        } else if (char === '(') {
            depth++;
        } else if (char === ')') {
            depth--;
        } else if (depth === 0 && isSeparator(char)) {
            const part = css.slice(start, i).trim();
            if (part) parts.push(part);
            start = i + 1;
        }
    }

    const part = css.slice(start).trim();
    if (part) parts.push(part);
    return parts;
}

function splitCssList(css) {
    return splitCssValue(css || '', char => char === ',');
}

function splitCssTokens(css) {
    return splitCssValue(css || '', char => /\s/.test(char));
}

function extractBackgroundUrl(css) {
    css = css.trim();
    const match = css.match(/^url\(/i);
    if (!match || !css.endsWith(')')) return;

    let url = css.slice(match[0].length, -1).trim();
    if (url[0] === '"' || url[0] === '\'') {
        if (!url.endsWith(url[0])) return;
        url = url.slice(1, -1);
    }
    return url;
}

function parseBackgroundPart(str, parentDimension) {
    str = str.trim();
    if (/^[+-]?0(?:\.0+)?$/.test(str)) return 0;
    if (str.endsWith('px')) return parseFloat(str);
    if (str.endsWith('%'))
        return parseFloat(str) * parentDimension / 100;

    const number = '([+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+))';
    const calc = str.match(new RegExp(
        `^calc\\(\\s*${number}(px|%)\\s*([+-])\\s*${number}(px|%)\\s*\\)$`,
        'i'
    ));
    if (!calc) throw new Error(`unrecognized expression ${str}`);

    const first = parseBackgroundPart(calc[1] + calc[2], parentDimension);
    const second = parseBackgroundPart(calc[4] + calc[5], parentDimension);
    return calc[3] === '+' ? first + second : first - second;
}

function getBackgroundSize(img, rect, backgroundSize) {
    const [width = 'auto', height = 'auto'] = splitCssTokens(backgroundSize);
    if (width === 'auto' && height === 'auto')
        return { width: img.width, height: img.height };

    const resolvedWidth = width === 'auto'
        ? null
        : parseBackgroundPart(width, rect.width);
    const resolvedHeight = height === 'auto'
        ? null
        : parseBackgroundPart(height, rect.height);

    return {
        width: resolvedWidth ?? resolvedHeight * img.width / img.height,
        height: resolvedHeight ?? resolvedWidth * img.height / img.width
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

const borderRadiusKeys = [
    'borderTopLeftRadius', 'borderTopRightRadius',
    'borderBottomRightRadius', 'borderBottomLeftRadius'
];

function parseStylesToFloat(style, keys) {
    return keys.reduce((obj, key) => {
        obj[key] = parseFloat(style[key]);
        return obj;
    }, {});
}

function getOriginRect(rect, style, backgroundOrigin) {
    if (backgroundOrigin === 'border-box') return rect;
    const border = parseStylesToFloat(style, borderWidthKeys);
    if (backgroundOrigin === 'padding-box') {
        return new DOMRect(
            rect.x + border.borderLeftWidth,
            rect.y + border.borderTopWidth,
            rect.width - border.borderLeftWidth - border.borderRightWidth,
            rect.height - border.borderTopWidth - border.borderBottomWidth
        );
    }
    const padding = parseStylesToFloat(style, paddingKeys);
    return new DOMRect(
        rect.x + padding.paddingLeft + border.borderLeftWidth,
        rect.y + padding.paddingTop + border.borderTopWidth,
        rect.width - padding.paddingLeft - padding.paddingRight
            - border.borderLeftWidth - border.borderRightWidth,
        rect.height - padding.paddingTop - padding.paddingBottom
            - border.borderTopWidth - border.borderBottomWidth
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
    return parseBackgroundPart(token, areaSize - imageSize);
}

function getBackgroundPosition(rootRect, originRect, imgSize, backgroundPosition) {
    const [xToken = '0%', yToken = '0%'] = splitCssTokens(backgroundPosition);
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

async function drawBackgroundImage(ctx, elementRect, rootRect, style, layer) {
    const { url, size, position, repeat, origin } = layer;
    const img = await loadImage(url);
    const originRect = getOriginRect(elementRect, style, origin);
    const imgSize = getBackgroundSize(img, originRect, size);
    const { x, y } = getBackgroundPosition(
        rootRect, originRect, imgSize, position
    );

    if (repeat === 'no-repeat') {
        ctx.drawImage(img, x, y, imgSize.width, imgSize.height);
        return;
    }

    const pattern = ctx.createPattern(img, repeat);
    if (!pattern) {
        ctx.drawImage(img, x, y, imgSize.width, imgSize.height);
        return;
    }

    const matrix = new DOMMatrix();
    // The pattern origin is (0,0) in the current user coordinate space.
    // background-position defines the offset of the first tile.
    // We also need to account for background-size if it's different from the image size.
    matrix.translateSelf(x, y);
    if (imgSize.width !== img.width || imgSize.height !== img.height)
        matrix.scaleSelf(imgSize.width / img.width, imgSize.height / img.height);
    pattern.setTransform(matrix);

    ctx.fillStyle = pattern;
    ctx.fillRect(
        originRect.left - rootRect.left,
        originRect.top - rootRect.top,
        originRect.width,
        originRect.height
    );
}

function getLayerValue(values, index, defaultValue) {
    return values.length ? values[index % values.length] : defaultValue;
}

async function drawBackgroundImages(ctx, elementRect, rootRect, style) {
    const images = splitCssList(style.backgroundImage);
    const positions = splitCssList(style.backgroundPosition);
    const sizes = splitCssList(style.backgroundSize);
    const repeats = splitCssList(style.backgroundRepeat);
    const origins = splitCssList(style.backgroundOrigin);

    // CSS paints the first listed image on top, so canvas draws in reverse.
    for (let i = images.length - 1; i >= 0; i--) {
        const url = extractBackgroundUrl(images[i]);
        if (!url) continue;
        await drawBackgroundImage(ctx, elementRect, rootRect, style, {
            url,
            position: getLayerValue(positions, i, '0% 0%'),
            size: getLayerValue(sizes, i, 'auto'),
            repeat: getLayerValue(repeats, i, 'repeat'),
            origin: getLayerValue(origins, i, 'padding-box')
        });
    }
}

export async function drawBackground(ctx, element, style, rootRect) {
    const elementRect = element.getBoundingClientRect();
    const radius = parseStylesToFloat(style, borderRadiusKeys);

    ctx.save();
    try {
        ctx.beginPath();
        const radii = [
            radius.borderTopLeftRadius,
            radius.borderTopRightRadius,
            radius.borderBottomRightRadius,
            radius.borderBottomLeftRadius
        ];
        ctx.roundRect(
            elementRect.left - rootRect.left,
            elementRect.top - rootRect.top,
            elementRect.width,
            elementRect.height,
            radii
        );
        ctx.clip();
        drawBackgroundColor(ctx, style);
        await drawBackgroundImages(ctx, elementRect, rootRect, style);
    } finally {
        ctx.restore();
    }
}
