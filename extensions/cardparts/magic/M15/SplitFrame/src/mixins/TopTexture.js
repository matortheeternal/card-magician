const TopTextureMixin = {
    async resolveTopTexture(card) {
        const textureFolder = this.resolveSplitAssetPath(`texture`);
        const image = this.coloredBlend(textureFolder, card.top, {
            ext: '.png'
        });
        return this.background('top-texture', image);
    }
};

export default {
    group: 'top',
    resolve: 'resolveTopTexture',
    mixin: TopTextureMixin
};
