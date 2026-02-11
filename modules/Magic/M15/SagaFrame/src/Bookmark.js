const BookmarkMixin = {
    get bookmarkFolder() {
        return this.resolveSagaAssetPath('bookmark');
    },

    async resolveBookmark(card) {
        const colorKey = card.getCardColorKey();
        const image = `${this.bookmarkFolder}/${colorKey}.png`;
        return this.background('bookmark', image, 2);
    }
};

export default {
    group: 'frame',
    resolve: 'resolveBookmark',
    mixin: BookmarkMixin
};
