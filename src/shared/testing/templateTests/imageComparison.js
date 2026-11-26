const DIFFERENT_COLOR = [255, 0, 255, 255];
const UNCHANGED_FADE = 0.25;

async function decodeImage(blob) {
    const bitmap = await createImageBitmap(blob);
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const context = canvas.getContext('2d');
    context.drawImage(bitmap, 0, 0);
    bitmap.close();
    return context.getImageData(0, 0, canvas.width, canvas.height);
}

function pixelDelta(actual, expected, offset) {
    let delta = 0;
    for (let channel = 0; channel < 4; channel++) {
        const index = offset + channel;
        delta = Math.max(delta, Math.abs(actual[index] - expected[index]));
    }
    return delta;
}

function paintFaded(diff, actual, offset) {
    for (let channel = 0; channel < 3; channel++)
        diff[offset + channel] = 255 - (255 - actual[offset + channel]) * UNCHANGED_FADE;
    diff[offset + 3] = 255;
}

function paintDifferent(diff, offset) {
    diff.set(DIFFERENT_COLOR, offset);
}

function sizeOf(image) {
    return `${image.width}x${image.height}`;
}

function compareSizedImages(actual, expected) {
    const diff = new ImageData(actual.width, actual.height);
    let differentPixels = 0;
    let maxDelta = 0;
    for (let offset = 0; offset < actual.data.length; offset += 4) {
        const delta = pixelDelta(actual.data, expected.data, offset);
        maxDelta = Math.max(maxDelta, delta);
        paintFaded(diff.data, actual.data, offset);
        if (delta === 0) continue;
        differentPixels++;
        paintDifferent(diff.data, offset);
    }
    return { matches: differentPixels === 0, differentPixels, maxDelta, diff };
}

export async function compareImages(actualBlob, expectedBlob) {
    const [actual, expected] = await Promise.all([
        decodeImage(actualBlob),
        decodeImage(expectedBlob)
    ]);
    if (sizeOf(actual) !== sizeOf(expected))
        return { matches: false, sizes: [sizeOf(actual), sizeOf(expected)] };
    return compareSizedImages(actual, expected);
}

export async function imageDataToPng(imageData) {
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    canvas.getContext('2d').putImageData(imageData, 0, 0);
    return canvas.convertToBlob({ type: 'image/png' });
}

export function canvasToLosslessWebp(canvas) {
    return new Promise(resolve => { canvas.toBlob(resolve, 'image/webp', 1); });
}
