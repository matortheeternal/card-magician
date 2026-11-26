const TopTextureMixin = {
    async resolveTopTexture(card) {
        const textureFolder = this.resolveSplitAssetPath(`texture`);
        const image = this.coloredBlend(textureFolder, card.top, {
            ext: '.png'
        });
        const maskUrl = this.resolveSplitAssetPath('mask/half/top.png');
        return this.background('top-texture', this.ctx.maskImage(image, maskUrl));
    }
};

export default {
    group: 'top',
    resolve: 'resolveTopTexture',
    mixin: TopTextureMixin
};
