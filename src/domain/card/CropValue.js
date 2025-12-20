export class CropValue {
    constructor(width = 1, height = 1, xOffset = 0, yOffset = 0) {
        this.width = width;
        this.height = height;
        this.xOffset = xOffset;
        this.yOffset = yOffset;
    }

    static load(data) {
        return new this(
            data.cropWidth || data.width || 1,
            data.cropHeight || data.height || 1,
            data.xOffset || 0,
            data.yOffset || 0
        );
    }

    static fromElement(element) {
        return new this(
            parseInt(element.getAttribute('crop-width')) || 1,
            parseInt(element.getAttribute('crop-height')) || 1,
            parseInt(element.getAttribute('offset-x')) || 0,
            parseInt(element.getAttribute('offset-y')) || 0
        )
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
