const fontCache = new Map();
let fontStyleTag = null;

function getFontStyleTag() {
    if (fontStyleTag) return fontStyleTag;
    fontStyleTag = document.createElement('style');
    document.head.appendChild(fontStyleTag);
    return fontStyleTag;
}

function updateFontStyle() {
    const style = getFontStyleTag();
    style.textContent = [...fontCache.values()].map(font => {
        return `@font-face {
            font-family: "${font.name}";
            src: url("${font.path}") format("${font.format}");
            font-display: swap;
        }`;
    }).join('\n');
}

function getFontFormat(fontPath) {
    if (fontPath.endsWith('.woff2')) return 'woff2';
    if (fontPath.endsWith('.woff')) return 'woff';
    return 'truetype';
}

export function loadFont(fontName, fontPath) {
    if (fontCache.has(fontName)) return;
    const fontFormat = getFontFormat(fontPath);
    fontCache.set(fontName, {
        name: fontName,
        path: fontPath,
        format: fontFormat
    });
    updateFontStyle();
}
