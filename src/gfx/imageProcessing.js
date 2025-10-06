const maskCache = new Map();
export async function maskImage(sourceUrl, maskUrl, width = 375, height = 523) {
    const key = `${sourceUrl}|${maskUrl}|${width}|${height}`;
    if (maskCache.has(key))
        return maskCache.get(key);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const sourceImg = new Image();
    sourceImg.crossOrigin = 'Anonymous';
    await new Promise(resolve => {
        sourceImg.onload = resolve;
        sourceImg.src = sourceUrl;
    });

    const maskImg = new Image();
    maskImg.crossOrigin = 'Anonymous';
    await new Promise(resolve => {
        maskImg.onload = resolve;
        maskImg.src = maskUrl;
    });

    ctx.drawImage(maskImg, 0, 0, width, height);
    ctx.globalCompositeOperation = 'source-in';
    ctx.drawImage(sourceImg, 0, 0, width, height);
    const url = canvas.toDataURL('image/png');

    maskCache.set(key, url);
    return url;
}

export function parseBlob(text) {
    const [prefix, base64] = text.split(',');
    const match = prefix.match(/data:([^;]+);base64/);
    if (!match) throw new Error('Malformed data, could not load image blob.');
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++)
        bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: match[0] });
}

export function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
}

export function canvasToObjectURL(canvas, type = 'image/png', quality = 0.92) {
    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
            if (!blob) return reject(new Error('Failed to create blob from canvas'));
            const url = URL.createObjectURL(blob);
            resolve(url);
        }, type, quality);
    });
}
