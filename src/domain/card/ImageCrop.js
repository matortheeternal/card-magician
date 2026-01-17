export default class ImageCrop {
    constructor(width = 0, height = 0, xOffset = 0, yOffset = 0) {
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
