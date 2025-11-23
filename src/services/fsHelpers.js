export async function saveJson(filePath, data, minify = true) {
    const text = JSON.stringify(data, null, minify ? 0 : 2);
    await Neutralino.filesystem.writeFile(filePath, text);
}

export async function loadJson(filePath) {
    const text = await Neutralino.filesystem.readFile(filePath);
    return JSON.parse(text);
}

export async function checkFileExists(filePath) {
    try {
        const stats = await Neutralino.filesystem.getStats(filePath);
        return stats.isFile;
    } catch (error) {
        if (error.code === 'NE_FS_NOPATHE') return false;
        throw error;
    }
}

const fileCache = new Map();
export async function loadTextFile(filePath) {
    if (fileCache.has(filePath)) return fileCache.get(filePath);
    const response = await fetch(filePath);
    if (!response.ok)
        throw new Error(`Failed to load file ${filePath}, ${response.status}`);
    const text = await response.text();
    fileCache.set(filePath, text);
    return text;
}

const imageUrlCache = new Map();
export async function getImageUrl(filePath) {
    if (imageUrlCache.has(filePath))
        return imageUrlCache.get(filePath);

    try {
        const exists = await checkFileExists(filePath);
        if (!exists) {
            console.error(`Image not found: ${filePath}`);
            return;
        }

        const rawData = await Neutralino.filesystem.readBinaryFile(filePath);
        const blob = new Blob([rawData], { type: 'image/png' });
        const url = URL.createObjectURL(blob);

        imageUrlCache.set(filePath, url);
        return url;
    } catch (error) {
        console.error('Failed to load image:', error);
    }
}

function getFontFormat(fontPath) {
    if (fontPath.endsWith('.woff2')) return 'woff2';
    if (fontPath.endsWith('.woff')) return 'woff';
    return 'truetype';
}

const fontCache = {};

function createFontStyle(fontName, fontFormat, base64data) {
    const style = document.createElement('style');
    const fontUrl = `data:font/${fontFormat};base64,${base64data}`;
    style.textContent = `
        @font-face {
            font-family: "${fontName}";
            src: url("${fontUrl}") format("${fontFormat}");
        }
    `;
    document.head.appendChild(style);
    fontCache[fontName] = style;
}

function convertToBase64(rawData) {
    const bytes = rawData instanceof Uint8Array ? rawData : new Uint8Array(rawData);
    const chunkSize = 8192;
    let binaryString = '';
    for (let offset = 0; offset < bytes.byteLength; offset += chunkSize) {
        const chunk = bytes.subarray(offset, offset + chunkSize);
        binaryString += String.fromCharCode(...chunk);
    }
    return btoa(binaryString);
}

export async function loadFont(fontName, fontPath) {
    try {
        if (fontCache.hasOwnProperty(fontName)) return;
        if (!await checkFileExists(fontPath)) {
            console.error('Font file not found at ', fontPath);
            return;
        }
        const rawData = await Neutralino.filesystem.readBinaryFile(fontPath);
        const fontFormat = getFontFormat(fontPath);
        const base64data = convertToBase64(rawData);
        createFontStyle(fontName, fontFormat, base64data);
    } catch (error) {
        console.error('Failed to load font: ', error);
    }
}
