const FrameMixin = {
    get frameExt() {
        return '.jpg';
    },

    get frameMaskFolder() {
        return this.resolveAssetPath('mask/frame');
    },

    get frameSubfolder() {
        if (this.card.isFrontDFC?.() && this.card.isTransform?.())
            return 'notched';
        if (this.card.isBackDFC?.())
            return 'back';
        if (this.card.hasFaceSymbol() || this.card.isFrontDFC?.())
            return 'front';
        return 'standard';
    },

    get frameFolder() {
        return this.resolveAssetPath(`frame/${this.frameSubfolder}`);
    },

    get frameMaskFilename() {
        if (this.card.isStation?.() && this.card.artSize === 'borderless')
            return 'spacecraft.png';
        return 'standard.png';
    },

    get frameHasLandTemplates() {
        return true;
    },

    get frameBlendMaskFolder() {
        return this.resolveAssetPath('mask/standard');
    },

    maskFrame(image) {
        const maskUrl = `${this.frameMaskFolder}/${this.frameMaskFilename}`;
        return this.ctx.maskImage(image, maskUrl);
    },

    get frameId() {
        if (this.card.artSize === 'borderless') return 'borderless';
        return 'standard';
    },

    async resolveFrame(card) {
        const image = this.coloredBlend(this.frameFolder, card, {
            ext: this.frameExt,
            blendMaskFolder: this.frameBlendMaskFolder,
            hasLandTemplates: this.frameHasLandTemplates
        });
        const maskedImg = this.maskFrame(image);
        return this.background(this.frameId, maskedImg);
    },
};

export default {
    group: 'frame',
    resolve: 'resolveFrame',
    mixin: FrameMixin
};
