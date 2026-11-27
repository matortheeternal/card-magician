const BottomTextureMixin = {
    async resolveBottomTexture(card) {
        return this.resolveHalfTexture('bottom', card.bottom);
    }
};

export default {
    group: 'bottom',
    resolve: 'resolveBottomTexture',
    mixin: BottomTextureMixin
};
