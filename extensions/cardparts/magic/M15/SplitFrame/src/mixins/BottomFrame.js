const BottomFrameMixin = {
    async resolveBottomFrame(card) {
        const image = this.coloredBlend(this.frameFolder, card.bottom, {
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
    group: 'bottom',
    resolve: 'resolveBottomFrame',
    mixin: BottomFrameMixin,
};
