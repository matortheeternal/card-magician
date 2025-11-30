import { checkFileExists } from '../services/fsHelpers.js';

export function imageToCanvas(img) {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    return { canvas, ctx, imageData };
}

export function newCanvas(width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    return { canvas, ctx };
}

export function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
}

const objectUrlMap = new Map();
const CANVAS_TYPE = 'image/png';
const CANVAS_QUALITY = 0.92;
export function writeCanvasToDisk(canvas, fullPath, cache, localPath) {
    return new Promise((resolve, reject) => {
        canvas.toBlob(async blob => {
            if (!blob) return reject(new Error('Failed to create blob from canvas'));
            blob.arrayBuffer().then(async arrayBuffer => {
                const uint8 = new Uint8Array(arrayBuffer);
                await Neutralino.filesystem.writeBinaryFile(fullPath, uint8);
                const objectUrl = cache.get(fullPath);
                cache.set(fullPath, localPath);
                setTimeout(() => URL.revokeObjectURL(objectUrl), 500);
            });
            const objectUrl = URL.createObjectURL(blob);
            objectUrlMap.set(objectUrl, localPath);
            cache.set(fullPath, objectUrl);
            resolve(objectUrl);
        }, CANVAS_TYPE, CANVAS_QUALITY);
    });
}

export function cacheImages(coreFunction, numImageArgs, shortcut = false) {
    const cache = new Map();
    const cachePath = NL_DATAPATH + '/cache/images';

    return async function (...args) {
        if (shortcut && !args[1]) return args[0];

        const key = args.map(arg => {
            return objectUrlMap.has(arg) ? objectUrlMap.get(arg) : arg;
        }).join('|');
        const filename = `${coreFunction.name}_${fnv1a(key)}.png`;
        const localPath = `cache/images/${filename}`;
        const fullPath = `${cachePath}/${filename}`;
        if (cache.has(fullPath))
            return cache.get(fullPath);
        console.debug('%cCache miss %s', 'color:grey', fullPath, key);
        if (await checkFileExists(fullPath)) {
            cache.set(fullPath, localPath);
            return localPath;
        }

        const imageArgs = args.slice(0, numImageArgs);
        const otherArgs = args.slice(numImageArgs);
        const images = await Promise.all(imageArgs.map(url => loadImage(url)));
        const canvas = coreFunction(...images, ...otherArgs);
        return await writeCanvasToDisk(canvas, fullPath, cache, localPath);
    };
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
        img.onerror = reject;
        img.src = url;
    });
}
