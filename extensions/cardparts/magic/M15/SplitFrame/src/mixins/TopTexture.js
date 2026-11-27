const TopTextureMixin = {
    async resolveTopTexture(card) {
        return this.resolveHalfTexture('top', card.top);
    }
};

export default {
    group: 'top',
    resolve: 'resolveTopTexture',
    mixin: TopTextureMixin
};
