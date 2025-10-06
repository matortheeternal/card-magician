import { canvasToObjectURL, loadImage } from './imageProcessing';

function top(x)  { return Math.min(255, x); }
function bot(x)  { return Math.max(0, x); }
function col(x)  { return Math.min(255, Math.max(0, x)); }

function overlay(a, b) {
    return (a < 128)
        ? (a * b) >> 7
        : 255 - (((255 - a) * (255 - b)) >> 7);
}

const blendFuncs = {
    add:           (a, b) => top(a + b),
    subtract:      (a, b) => bot(a - b),
    stamp:         (a, b) => col(a - 2 * b + 256),
    difference:    (a, b) => Math.abs(a - b),
    negation:      (a, b) => 255 - Math.abs(255 - a - b),
    multiply:      (a, b) => (a * b) / 255,
    darken:        (a, b) => Math.min(a, b),
    lighten:       (a, b) => Math.max(a, b),
    colorDodge:    (a, b) => (b === 255 ? 255 : top(a * 255 / (255 - b))),
    colorBurn:     (a, b) => (b === 0 ? 0 : bot(255 - (255 - a) * 255 / b)),
    screen:        (a, b) => 255 - (((255 - a) * (255 - b)) / 255),
    overlay:       (a, b) => overlay(a, b),
    hardLight:     (a, b) => (b < 128)
        ? (a * b) >> 7
        : 255 - (((255 - a) * (255 - b)) >> 7),
    softLight:     (a, b) => b,
    reflect:       (a, b) => (b === 255 ? 255 : top((a * a) / (255 - b))),
    glow:          (a, b) => (a === 255 ? 255 : top((b * b) / (255 - a))),
    freeze:        (a, b) => (b === 0 ? 0 : bot(255 - ((255 - a) * (255 - a)) / b)),
    heat:          (a, b) => (a === 0 ? 0 : bot(255 - ((255 - b) * (255 - b)) / a)),
    and:           (a, b) => a & b,
    or:            (a, b) => a | b,
    xor:           (a, b) => a ^ b,
    shadow:        (a, b) => (b * a * a) / (255 * 255),
    symmetricOverlay: (a, b) => (overlay(a, b) + overlay(b, a)) >> 1,
};

function blendImageData(baseData, topData, mode) {
    const func = blendFuncs[mode];
    if (!func) throw new Error(`Blend mode not supported: ${mode}`);

    const out = new ImageData(baseData.width, baseData.height);
    const a = baseData.data;
    const b = topData.data;
    const o = out.data;

    for (let i = 0; i < a.length; i += 4) {
        o[i]   = func(a[i],   b[i]);
        o[i+1] = func(a[i+1], b[i+1]);
        o[i+2] = func(a[i+2], b[i+2]);
        o[i+3] = Math.max(a[i+3], b[i+3]);
    }

    return out;
}

const canvasBlendMap = {
    normal: "source-over",
    add: "lighter",
    difference: "difference",
    multiply: "multiply",
    darken: "darken",
    lighten: "lighten",
    colorDodge: "color-dodge",
    colorBurn: "color-burn",
    screen: "screen",
    overlay: "overlay",
    hardLight: "hard-light",
    softLight: "soft-light",
    xor: "xor",
    exclusion: "exclusion"
};

export function combineBlend(imgA, imgB, mode) {
    const w = imgA.width;
    const h = imgA.height;

    const outCanvas = document.createElement("canvas");
    outCanvas.width = w;
    outCanvas.height = h;
    const ctx = outCanvas.getContext("2d");

    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(imgA, 0, 0);

    if (canvasBlendMap[mode]) {
        ctx.globalCompositeOperation = canvasBlendMap[mode];
        ctx.drawImage(imgB, 0, 0);
    } else {
        const baseData = ctx.getImageData(0, 0, w, h);
        const tmpCanvas = document.createElement("canvas");
        tmpCanvas.width = w;
        tmpCanvas.height = h;
        tmpCanvas.getContext("2d").drawImage(imgB, 0, 0);
        const topData = tmpCanvas.getContext("2d").getImageData(0, 0, w, h);

        const outData = blendImageData(baseData, topData, mode);
        ctx.putImageData(outData, 0, 0);
    }

    return outCanvas;
}

const combineBlendCache = new Map();
export async function combineBlendUrl(imgUrlA, imgUrlB, mode) {
    if (!imgUrlB) return imgUrlA;
    const key = `${imgUrlA}|${imgUrlB}|${mode}`;
    if (combineBlendCache.has(key))
        return combineBlendCache.get(key);

    const imgA = await loadImage(imgUrlA);
    const imgB = await loadImage(imgUrlB);
    const canvas = combineBlend(imgA, imgB, mode);
    const url = await canvasToObjectURL(canvas);

    combineBlendCache.set(key, url);
    return url;
}

export function linearBlend(img1, img2, x1, y1, x2, y2) {
    if (img1.width !== img2.width || img1.height !== img2.height)
        throw new Error("Images used for blending must have the same size");

    const { width, height } = img1;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(img1, 0, 0);
    ctx.save();

    const gradient = ctx.createLinearGradient(
        x1 * width, y1 * height,
        x2 * width, y2 * height
    );
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.globalCompositeOperation = 'destination-in';
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'destination-over';
    ctx.drawImage(img2, 0, 0);
    ctx.restore();

    return canvas;
}

const linearBlendCache = new Map();
export async function linearBlendUrl(imgUrlA, imgUrlB, x1, y1, x2, y2) {
    if (!imgUrlB) return imgUrlA;
    const key = `${imgUrlA}|${imgUrlB}|${x1}|${y1}|${x2}|${y2}`;
    if (linearBlendCache.has(key))
        return linearBlendCache.get(key);

    const imgA = await loadImage(imgUrlA);
    const imgB = await loadImage(imgUrlB);
    const canvas = linearBlend(imgA, imgB, x1, y1, x2, y2);
    const url = await canvasToObjectURL(canvas);

    linearBlendCache.set(key, url);
    return url;
}
