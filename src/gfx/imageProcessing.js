import html2canvas from 'html2canvas';

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

export function canvasToObjectURL(canvas, type = 'image/png', quality = 0.92) {
    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
            if (!blob) return reject(new Error('Failed to create blob from canvas'));
            const url = URL.createObjectURL(blob);
            resolve(url);
        }, type, quality);
    });
}

export function createCachedImageWrapper(coreFunction, numImageArgs, shortcut = false) {
    const cache = new Map();

    return async function (...args) {
        if (shortcut && !args[1]) return args[0];

        const key = args.join('|');
        if (cache.has(key)) return cache.get(key);

        const imageArgs = args.slice(0, numImageArgs);
        const otherArgs = args.slice(numImageArgs);
        const images = await Promise.all(imageArgs.map(url => loadImage(url)));
        const canvas = coreFunction(...images, ...otherArgs);
        const url = await canvasToObjectURL(canvas);
        cache.set(key, url);

        return url;
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
