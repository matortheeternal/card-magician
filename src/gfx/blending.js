import { imageToCanvas, newCanvas, createCachedImageWrapper } from './imageProcessing';
import { blendFuncs } from './blendFuncs.js';
import Color from './Color.js';

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

export function combineBlend(imgA, imgB, mode) {
    const { width, height } = imgA;
    if (imgB.width !== width || imgB.height !== height)
        throw new Error("Images must have the same size");

    const { canvas, ctx } = newCanvas(width, height);
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(imgA, 0, 0);

    const base = ctx.getImageData(0, 0, width, height);
    const { imageData: top } = imageToCanvas(imgB);

    const blended = blendImageData(base, top, mode);
    ctx.putImageData(blended, 0, 0);
    return canvas;
}

export function linearBlend(img1, img2, x1, y1, x2, y2) {
    if (img1.width !== img2.width || img1.height !== img2.height)
        throw new Error("Images must have the same size");

    const { width, height } = img1;
    const { canvas, ctx } = newCanvas(width, height);

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

export function maskBlend(img1, img2, mask) {
    const { width, height } = img1;
    if (img2.width !== width || img2.height !== height || mask.width !== width || mask.height !== height)
        throw new Error("Images must have the same size");

    const { imageData: data1 } = imageToCanvas(img1);
    const { imageData: data2 } = imageToCanvas(img2);
    const { imageData: maskData } = imageToCanvas(mask);

    const d1 = data1.data;
    const d2 = data2.data;
    const m = maskData.data;

    for (let i = 0; i < d1.length; i += 4) {
        const maskVal = m[i]; // red channel
        const inv = 255 - maskVal;
        d1[i]   = (d1[i]   * maskVal + d2[i]   * inv) / 255;
        d1[i+1] = (d1[i+1] * maskVal + d2[i+1] * inv) / 255;
        d1[i+2] = (d1[i+2] * maskVal + d2[i+2] * inv) / 255;
    }

    const { canvas, ctx } = newCanvas(width, height);
    ctx.putImageData(data1, 0, 0);
    return canvas;
}

export function maskImage(sourceImg, maskImg) {
    const { width, height } = sourceImg;
    if (maskImg.width !== width || maskImg.height !== height)
        throw new Error("Images must have the same size");

    const { canvas, ctx, imageData: srcImageData } = imageToCanvas(sourceImg);
    const { imageData: maskImageData } = imageToCanvas(maskImg);

    const srcData = srcImageData.data;
    const maskData = maskImageData.data;
    for (let i = 0; i < srcData.length; i += 4) {
        const srcAlpha = srcData[i + 3];
        srcData[i + 3] = Math.round(srcAlpha * (maskData[i] / 255));
    }

    ctx.putImageData(srcImageData, 0, 0);
    return canvas;
}

export function maskColor(maskImg, hexColor) {
    const color = Color.fromHex(hexColor);
    const { width, height } = maskImg;
    const { canvas, ctx } = newCanvas(width, height);
    const { imageData: maskImageData } = imageToCanvas(maskImg);
    const maskData = maskImageData.data;

    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        data[i] = color.r;
        data[i + 1] = color.g;
        data[i + 2] = color.b;
        data[i + 3] = Math.round(color.a * (maskData[i] / 255));
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

export const combineBlendUrl = createCachedImageWrapper(combineBlend, 2, true);
export const linearBlendUrl = createCachedImageWrapper(linearBlend, 2, true);
export const maskBlendUrl = createCachedImageWrapper(maskBlend, 3);
export const maskImageUrl = createCachedImageWrapper(maskImage, 2);
export const maskColorUrl = createCachedImageWrapper(maskColor, 1);
