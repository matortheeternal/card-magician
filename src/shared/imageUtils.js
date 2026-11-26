export function imageToCanvas(img) {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    return { canvas, ctx, imageData };
}

export function newCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    return { canvas, ctx };
}

export function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = e => reject(
            new Error(`Failed to load image ${url}, ${e.message}`)
        );
        img.src = url;
    });
}

export function getImageSize(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve({
                width: img.naturalWidth,
                height: img.naturalHeight
            });
        };
        img.onerror = e => reject(
            new Error(`Failed to load image ${url}, ${e.message}`)
        );
        img.src = url;
    });
}


const PNG_SIGNATURE = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];

function hasPngMagic(bytes) {
    return bytes.length >= PNG_SIGNATURE.length
        && PNG_SIGNATURE.every((value, index) => bytes[index] === value);
}

function hasJpegMagic(bytes) {
    return bytes.length >= 3
        && bytes[0] === 0xFF
        && bytes[1] === 0xD8
        && bytes[2] === 0xFF;
}

/**
 * Returns the image mime type for a given buffer of data.
 *
 * @param {ArrayBuffer} data - image bytes loaded from disk.
 * @returns {'image/jpeg'|'image/png'}
 */
export function determineImageType(data) {
    const bytes = new Uint8Array(data);
    if (hasPngMagic(bytes)) return 'image/png';
    if (hasJpegMagic(bytes)) return 'image/jpeg';
    throw new Error('Unknown image type');
}
