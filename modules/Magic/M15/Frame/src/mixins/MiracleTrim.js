const MiracleTrimMixin = {
    get showMiracleTrim() {
        return (this.card.miracleStyle !== 'disabled')
            && (this.card.miracleStyle !== 'auto' || this.card.isMiracle?.());
    },

    get miracleSubfolder() {
        return this.card.isSnow?.() ? 'snow' : 'normal';
    },

    get miracleFolder() {
        return this.resolveAssetPath(`element/miracle/${this.miracleSubfolder}`);
    },

    get miracleBlendMaskFolder() {
        return this.resolveAssetPath('mask/miracle');
    },

    async resolveMiracleTrim(card) {
        if (!this.showMiracleTrim) return null;
        const image = this.coloredBlend(this.miracleFolder, card, {
            ext: '.png',
            blendMaskFolder: this.miracleBlendMaskFolder
        });
        return this.background('miracle-trim', image);
    },
};

export default {
    group: 'frame',
    resolve: 'resolveMiracleTrim',
    mixin: MiracleTrimMixin
};
