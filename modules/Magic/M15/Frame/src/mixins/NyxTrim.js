const NyxTrimMixin = {
    get showNyxTrim() {
        return (this.card.nyxStyle !== 'disabled')
            && (this.card.nyxStyle !== 'auto' || this.card.isEnchantment?.());
    },

    get autoNyxSubfolder() {
        if (this.card.isCompanion?.()) return 'companion';
        if (this.card.isShifted?.()) return 'shifted';
        return 'normal';
    },

    get nyxSubfolder() {
        return this.card.nyxStyle === 'auto'
            ? this.autoNyxSubfolder
            : this.card.nyxStyle;
    },

    get nyxFolder() {
        return this.resolveAssetPath(`element/nyx/${this.nyxSubfolder}`);
    },

    get nyxBlendMaskSubfolder() {
        if (this.nyxSubfolder === 'star') return 'star';
        return 'normal';
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
