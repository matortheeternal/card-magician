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

export async function loadImport(filePath) {
    try {
        const exists = await checkFileExists(filePath);
        if (!exists) {
            console.error(`Module not found: ${filePath}`);
            return;
        }

        const sourceCode = await Neutralino.filesystem.readFile(filePath);
        const blob = new Blob([sourceCode], { type: 'application/javascript' });
        const blobUrl = URL.createObjectURL(blob);
        return await import(blobUrl);
    } catch (error) {
        console.error(`Failed to import ${filePath}:`, error);
    }
}

export async function loadModule(modulePath, card, utils) {
    try {
        const mainPath = `./modules/${modulePath}/main.js`;
        const module = await loadImport(mainPath);
        console.log('Loading module', mainPath);
        // console.log(Alpine.raw(card), utils);
        await module.default(card, utils);
    } catch (error) {
        console.error('Failed to load module:', error);
    }
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
        if (fontCache.hasOwnProperty(fontName)) {
            console.info(`Font ${fontName} already loaded.`);
            return;
        }
        if (!checkFileExists(fontPath)) {
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
