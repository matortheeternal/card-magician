const UpperFrameMixin = {
    async resolveUpperFrame() {
        const image = this.resolveEmblemAssetPath('frame.png');
        const mask = this.resolveEmblemAssetPath('mask.png');
        const maskedImage = this.ctx.maskImage(image, mask);
        return this.background('upper', maskedImage);
    },
};

export default {
    group: 'frame',
    resolve: 'resolveUpperFrame',
    mixin: UpperFrameMixin
};
