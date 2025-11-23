import html2canvas from 'html2canvas';
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

function fnv1a(str) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = (hash * 0x01000193) >>> 0;
    }
    return (hash >>> 0).toString(16);
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

export async function saveHTMLAsImage(node, filename) {
  try {
    const canvas = await html2canvas(node);
    const dataUrl = canvas.toDataURL('image/png');
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    await Neutralino.filesystem.writeBinaryFile(filename, binaryData);

    console.log(`Saved image to ${filename}`);
  } catch (err) {
    console.error('Failed to save image:', err);
  }
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
