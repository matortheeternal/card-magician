const TrimMasksMixin = {
    async buildBackgrounds(key, card) {
        this.numTrims = 0;
        return super.buildBackgrounds(key, card);
    },

    get trimMaskFilename() {
        return 'normal.png';
    },

    get trimMaskFolder() {
        const folder = this.numTrims > 0 ? 'doubletrim' : 'trim';
        this.numTrims += 1;
        return folder;
    },

    get trimMaskUrl() {
        const trimMaskPath = `mask/${this.trimMaskFolder}/${this.trimMaskFilename}`;
        return this.resolveAssetPath(trimMaskPath);
    },

    maskTrim(image) {
        return this.ctx.maskImage(image, this.trimMaskUrl);
    },
};

export default { mixin: TrimMasksMixin };
