const BottomTextureMixin = {
    async resolveBottomTexture(card) {
        const textureFolder = this.resolveSplitAssetPath(`texture`);
        const image = this.coloredBlend(textureFolder, card.bottom, {
            ext: '.png'
        });
        return this.background('bottom-texture', image);
    }
};

export default {
    group: 'bottom',
    resolve: 'resolveBottomTexture',
    mixin: BottomTextureMixin
};
