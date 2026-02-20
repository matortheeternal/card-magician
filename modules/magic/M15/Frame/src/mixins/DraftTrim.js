const DraftTrimMixin = {
    get showDraftTrim() {
        return this.card.draftStyle !== 'disabled';
    },

    get draftFolder() {
        return this.resolveAssetPath('element/draft');
    },

    get draftBlendMaskFolder() {
        return this.resolveAssetPath('mask/draft');
    },

    async resolveDraftTrim(card) {
        if (!this.showDraftTrim) return null;
        const image = this.coloredBlend(this.draftFolder, card, {
            ext: '.png',
            blendMaskFolder: this.draftBlendMaskFolder
        });
        const maskedImg = this.maskTrim(image);
        return this.background('draft-trim', maskedImg);
    },
};

export default {
    group: 'frame',
    resolve: 'resolveDraftTrim',
    mixin: DraftTrimMixin
};
