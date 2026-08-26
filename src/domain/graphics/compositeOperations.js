import { imageToCanvas, newCanvas } from '../../shared/imageUtils.js';
import { blendAlgorithms } from './blendAlgorithms.js';
import Color from './Color.js';
import ImageOp from './ImageOp.js';
import PixelSampler from './PixelSampler.js';

function blendImageData(baseData, topData, mode) {
    const func = blendAlgorithms[mode];
    if (!func) throw new Error(`Blend mode not supported: ${mode}`);

    const out = new ImageData(baseData.width, baseData.height);
    const a = baseData.data;
    const b = topData.data;
    const o = out.data;

    for (let i = 0; i < a.length; i += 4) {
        o[i]   = func(a[i],   b[i]);
        o[i+1] = func(a[i+1], b[i+1]);
        o[i+2] = func(a[i+2], b[i+2]);
        o[i+3] = Math.min(a[i+3], b[i+3]);
    }

    return out;
}

export function combineBlend(imgA, imgB, mode) {
    const { width, height } = imgA;
    if (imgB.width !== width || imgB.height !== height)
        throw new Error('Images must have the same size');

    const { canvas, ctx } = newCanvas(width, height);
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(imgA, 0, 0);

    const base = ctx.getImageData(0, 0, width, height);
    const { imageData: top } = imageToCanvas(imgB);

    const blended = blendImageData(base, top, mode);
    ctx.putImageData(blended, 0, 0);
    return canvas;
}

export function linearBlend(img1, img2, x1, y1, x2, y2) {
    if (img1.width !== img2.width || img1.height !== img2.height)
        throw new Error('Images must have the same size');

    const { width, height } = img1;
    const { canvas, ctx } = newCanvas(width, height);

    ctx.drawImage(img1, 0, 0);
    ctx.save();

    const gradient = ctx.createLinearGradient(
        x1 * width, y1 * height,
        x2 * width, y2 * height
    );
    gradient.addColorStop(0, 'rgba(0,0,0,1)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalCompositeOperation = 'destination-in';
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'destination-over';
    ctx.drawImage(img2, 0, 0);
    ctx.restore();

    return canvas;
}

export function maskBlend(img1, img2, mask) {
    const { canvas, ctx, imageData } = imageToCanvas(img1);
    const d = imageData.data;

    const img2Sampler = new PixelSampler(img1, img2);
    const maskSampler = new PixelSampler(img1, mask);

    for (let i = 0; i < d.length; i += 4) {
        const d2 = img2Sampler.sample(i);
        const m = maskSampler.sample(i);
        const inv = 255 - m[0];

        d[i]     = (d[i]     * m[0] + d2[0] * inv) / 255;
        d[i + 1] = (d[i + 1] * m[0] + d2[1] * inv) / 255;
        d[i + 2] = (d[i + 2] * m[0] + d2[2] * inv) / 255;
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

export function maskImage(sourceImg, maskImg) {
    const { canvas, ctx, imageData } = imageToCanvas(sourceImg);
    const data = imageData.data;
    const maskSampler = new PixelSampler(sourceImg, maskImg);

    for (let i = 0; i < data.length; i += 4) {
        const m = maskSampler.sample(i);
        data[i + 3] = Math.round(data[i + 3] * m[0] / 255);
    }

    ctx.putImageData(imageData, 0, 0);
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

export function makeTransparent(image, opacityValue) {
    const { width, height } = image;
    const { canvas, ctx } = newCanvas(width, height);
    ctx.globalAlpha = opacityValue;
    ctx.drawImage(image, 0, 0);
    return canvas;
}

export const combineBlendOp = ImageOp.register(combineBlend, 2);
export const linearBlendOp = ImageOp.register(linearBlend, 2);
export const maskBlendOp = ImageOp.register(maskBlend, 3);
export const maskImageOp = ImageOp.register(maskImage, 2);
export const maskColorOp = ImageOp.register(maskColor, 1);
export const makeTransparentOp = ImageOp.register(makeTransparent, 1);
