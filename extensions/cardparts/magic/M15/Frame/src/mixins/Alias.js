const AliasMixin = {
    get aliasSubfolder() {
        return this.card.frame === 'planeshifted'
            ? 'shifted'
            : 'standard';
    },

    get aliasFolder() {
        return this.resolveAssetPath(`element/alias/${this.aliasSubfolder}`);
    },

    get aliasBlendMaskFolder() {
        return this.resolveAssetPath('mask/alias');
    },

    async resolveAlias(card) {
        if (!card.alias) return;
        const image = this.coloredBlend(this.aliasFolder, card, {
            ext: '.png',
            blendMaskFolder: this.aliasBlendMaskFolder
        });
        return this.background('alias', image);
    },
};

export default {
    group: 'frame',
    resolve: 'resolveAlias',
    mixin: AliasMixin
};
