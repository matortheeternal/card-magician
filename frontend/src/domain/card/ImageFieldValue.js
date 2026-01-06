import { getImageSize } from '../../shared/imageUtils.js';

export class CropValue {
    constructor(width = 0, height = 0, xOffset = 0, yOffset = 0) {
        this.width = width;
        this.height = height;
        this.xOffset = xOffset;
        this.yOffset = yOffset;
    }

    static load(data) {
        return new CropValue(
            data.cropWidth || data.width || 1,
            data.cropHeight || data.height || 1,
            data.xOffset || 0,
            data.yOffset || 0
        );
    }

    clamp(sourceWidth, sourceHeight, isMove) {
        const maxOffsetX = sourceWidth - (isMove ? this.width : 1);
        const maxOffsetY = sourceHeight - (isMove ? this.height : 1);
        this.xOffset = Math.max(0, Math.min(this.xOffset, maxOffsetX));
        this.yOffset = Math.max(0, Math.min(this.yOffset, maxOffsetY));
        const maxWidth = sourceWidth - this.xOffset;
        const maxHeight = sourceHeight - this.yOffset;
        this.width = Math.min(Math.max(this.width, 1), maxWidth);
        this.height = Math.min(Math.max(this.height, 1), maxHeight);
    }

    save() {
        return {
            cropWidth: this.width,
            cropHeight: this.height,
            xOffset: this.xOffset,
            yOffset: this.yOffset
        };
    }

    clone() {
        return new this.constructor(
            this.width,
            this.height,
            this.xOffset,
            this.yOffset
        );
    }
}

export default class ImageFieldValue {
    constructor(imageUrl = null, filename = '', width = 0, height = 0, crop) {
        this.imageUrl = imageUrl;
        this.filename = filename;
        this.width = width;
        this.height = height;
        this.crop = crop || new CropValue();
    }

    static async fromFile(file) {
        const imageUrl = URL.createObjectURL(file);
        const { width, height } = await getImageSize(imageUrl);
        const crop = new CropValue(width, height);
        return new this(imageUrl, file.name, width, height, crop);
    }

    static async load(data) {
        return new this(
            data.imageUrl,
            data.filename || '',
            data.width || 0,
            data.height || 0,
            CropValue.load(data)
        );
    }

    async save() {
        return {
            imageUrl: this.imageUrl,
            filename: this.filename,
            width: this.width,
            height: this.height,
            ...this.crop.save()
        };
    }

    clone() {
        const clone = new this.constructor(
            this.imageUrl,
            this.filename,
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
