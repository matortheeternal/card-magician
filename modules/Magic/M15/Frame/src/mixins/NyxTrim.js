const NyxTrimMixin = {
    get showNyxTrim() {
        return this.card.nyxStyle !== 'disabled';
    },

    get nyxSubfolder() {
        return this.card.nyxStyle;
    },

    get nyxFolder() {
        return this.resolveAssetPath(`element/nyx/${this.nyxSubfolder}`);
    },

    get nyxBlendMaskSubfolder() {
        if (this.nyxSubfolder === 'star') return 'star';
        return 'standard';
    },

    get nyxBlendMaskFolder() {
        return this.resolveAssetPath(`mask/nyx/${this.nyxBlendMaskSubfolder}`);
    },

    async resolveNyxTrim(card) {
        if (!this.showNyxTrim) return null;
        const image = this.coloredBlend(this.nyxFolder, card, {
            ext: '.png',
            blendMaskFolder: this.nyxBlendMaskFolder
        });
        const maskedImg = this.maskTrim(image);
        return this.background('nyx-trim', maskedImg);
    },
};

export default {
    group: 'frame',
    resolve: 'resolveNyxTrim',
    mixin: NyxTrimMixin
};
