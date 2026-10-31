const BorderMixin = {
    get borderMaskFilename() {
        return this.showCrown ? 'crown.png' : 'base.png';
    },

    get borderMaskFolder() {
        return 'mask/border';
    },

    get borderMaskUrl() {
        const borderMaskPath = `${this.borderMaskFolder}/${this.borderMaskFilename}`;
        return this.resolveAssetPath(borderMaskPath);
    },

    async resolveBorder(card) {
        const borderColor = card.borderColor || '#000000';
        const maskedImg = this.ctx.maskColor(this.borderMaskUrl, borderColor);
        return this.background('border', maskedImg);
    },
};

export default {
    group: 'frame',
    resolve: 'resolveBorder',
    mixin: BorderMixin
};
