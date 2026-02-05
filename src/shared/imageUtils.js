export function imageToCanvas(img) {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    return { canvas, ctx, imageData };
}

export function newCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
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


function hasPngMagic(bytes) {
    return bytes.length >= 8
        && bytes[0] === 0x89
        && bytes[1] === 0x50
        && bytes[2] === 0x4E
        && bytes[3] === 0x47
        && bytes[4] === 0x0D
        && bytes[5] === 0x0A
        && bytes[6] === 0x1A
        && bytes[7] === 0x0A;
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
