const BookmarkMixin = {
    get bookmarkFolder() {
        return this.resolveSagaAssetPath('bookmark');
    },

    get bookmarkBlendMaskFolder() {
        return this.resolveSagaAssetPath('mask/bookmark');
    },

    get blendCoords() {
        return [0.49, 0, 0.51, 0];
    },

    async resolveBookmark(card) {
        const image = this.resolveColored(this.bookmarkFolder, card, {
            ext: '.png',
            blendCoords: this.blendCoords,
        });
        return this.background('bookmark', image);
    },
};

export default {
    group: 'frame',
    resolve: 'resolveBookmark',
    mixin: BookmarkMixin
};
