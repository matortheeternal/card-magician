const SnowTrimMixin = {
    get showSnowTrim() {
        return (this.card.snowStyle !== 'disabled')
            && (this.card.snowStyle !== 'auto' || this.card.isSnow?.());
    },

    get snowFolder() {
        return this.resolveAssetPath('element/snow');
    },

    get snowBlendMaskFolder() {
        return this.resolveAssetPath('mask/snow');
    },

    async resolveSnowTrim(card) {
        if (!this.showSnowTrim) return null;
        const image = this.coloredBlend(this.snowFolder, card, {
            ext: '.png',
            blendMaskFolder: this.snowBlendMaskFolder,
            hasLandTemplates: true
        });
        const maskedImg = this.maskTrim(image);
        return this.background('snow-trim', maskedImg);
    },
};

export default {
    group: 'frame',
    resolve: 'resolveSnowTrim',
    mixin: SnowTrimMixin
};
