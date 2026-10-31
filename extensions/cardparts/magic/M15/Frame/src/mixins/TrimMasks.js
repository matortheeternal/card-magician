const TrimMasksMixin = {
    beforeBuild() {
        this.numTrims = 0;
        this.zIndex = 0;
    },

    get trimMaskFilename() {
        return 'standard.png';
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
