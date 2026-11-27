const TopFrameMixin = {
    async resolveTopFrame(card) {
        const half = this.forSubcard(card.top);
        const image = half.coloredBlend(this.frameFolder, half.card, {
            ext: this.frameExt,
            blendMaskFolder: this.frameBlendMaskFolder,
            hasLandTemplates: this.frameHasLandTemplates
        });
        // const maskUrl = `${this.frameMaskFolder}/bottom.png`;
        // const maskedImg = this.ctx.maskImage(image, maskUrl);
        return this.background(this.frameId, image, 1);
    }
};

export default {
    group: 'top',
    resolve: 'resolveTopFrame',
    mixin: TopFrameMixin,
};
