import {getImageSize, loadImage} from '../../shared/imageUtils.js';
import ImageCrop from './ImageCrop.js';

export default class ImageFieldValue {
    constructor(imageUrl = null, width = 0, height = 0, crop) {
        this.imageUrl = imageUrl;
        this.width = width;
        this.height = height;
        this.crop = crop || new ImageCrop();
    }

    static async fromFile(file) {
        const imageUrl = URL.createObjectURL(file);
        const { width, height } = await getImageSize(imageUrl);
        const crop = new ImageCrop(width, height);
        return new this(imageUrl, width, height, crop);
    }

    static async load(data) {
        return new this(
            null,
            data.width || 0,
            data.height || 0,
            ImageCrop.load(data)
        );
    }

    async loadImageData() {
        if (!this.imageUrl) return null;
        return (await fetch(this.imageUrl)).arrayBuffer();

    }

    async save() {
        return {
            width: this.width,
            height: this.height,
            ...this.crop.save()
        };
    }

    clone() {
        const clone = new this.constructor(
            this.imageUrl,
            this.width,
            this.height,
            this.crop.clone()
        );
        clone.scale = this.scale;
        return clone;
    }

    applyCoordinateSpace(targetWidth, targetHeight) {
        if (targetWidth < this.width)
            this.scale = this.width / targetWidth;
        if (targetHeight < this.height)
            this.scale = Math.max(this.scale, this.height / targetHeight);
        this.width = Math.round(this.width * 10 / this.scale) / 10;
        this.height = Math.round(this.height * 10 / this.scale) / 10;
        this.crop.width = Math.round(this.crop.width * 10 / this.scale) / 10;
        this.crop.height = Math.round(this.crop.height * 10 / this.scale) / 10;
        this.crop.xOffset = Math.round(this.crop.xOffset * 10 / this.scale) / 10;
        this.crop.yOffset = Math.round(this.crop.yOffset * 10 / this.scale) / 10;
    }

    removeCoordinateSpace() {
        if (!this.scale) return;
        this.width = Math.round(this.width * this.scale);
        this.height = Math.round(this.height * this.scale);
        this.crop.width = Math.round(this.crop.width * this.scale);
        this.crop.height = Math.round(this.crop.height * this.scale);
        this.crop.xOffset = Math.round(this.crop.xOffset * this.scale);
        this.crop.yOffset = Math.round(this.crop.yOffset * this.scale);
        delete this.scale;
    }
}
