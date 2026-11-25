const HalfFrameMixin = {
    resolveAssetPath(path) {
        return new URL(`../../assets/${path}`, import.meta.url).pathname;
    },

    get frameFolder() {
        return this.resolveAssetPath(`frame/${this.frameId}`);
    },

    get frameBlendMaskFolder() {
        return this.resolveAssetPath(`mask/${this.frameId}`);
    },

    async resolveHalfFrame(card) {
        const image = this.coloredBlend(this.frameFolder, card, {
            ext: '.jpg',
            blendMaskFolder: this.frameBlendMaskFolder,
            hasLandTemplates: true
        });
        return this.background(this.frameId, image);
    },
};

export default {
    group: 'frame',
    resolve: 'resolveHalfFrame',
    mixin: HalfFrameMixin
};
