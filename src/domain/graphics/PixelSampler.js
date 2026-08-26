import { imageToCanvas } from '../../shared/imageUtils.js';

export default class PixelSampler {
    constructor(src, target) {
        const canvas = imageToCanvas(target);
        this.imageData = canvas.imageData;
        this.width = src.width;
        this.height = src.height;
        this.scaleX = target.width / this.width;
        this.scaleY = target.height / this.height;
        this.targetWidth = target.width;
    }

    sample(index) {
        const pixelIndex = index / 4;
        const x = pixelIndex % this.width;
        const y = Math.floor(pixelIndex / this.width);

        const targetX = Math.floor(x * this.scaleX);
        const targetY = Math.floor(y * this.scaleY);
        const targetIndex = (targetY * this.targetWidth + targetX) * 4;

        return this.imageData.data.subarray(targetIndex, targetIndex + 4);
    }
}
