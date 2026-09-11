const BookmarkStripeMixin = {
    get showBookmarkStripe() {
        const colors = this.card.colorIdentity.colors;
        return colors.length === 2;
    },

    async resolveBookmarkStripe() {
        if (!this.showBookmarkStripe) return null;
        const image = this.resolveSagaAssetPath('bookmark/stripe.png');
        return this.background('bookmark-stripe', image);
    },
};

export default {
    group: 'frame',
    resolve: 'resolveBookmarkStripe',
    mixin: BookmarkStripeMixin
};
