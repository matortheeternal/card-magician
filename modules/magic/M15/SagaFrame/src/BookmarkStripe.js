const BookmarkStripeMixin = {
    async resolveBookmarkStripe() {
        const image = this.resolveSagaAssetPath('bookmark/stripe.png');
        return this.background('bookmark-stripe', image);
    },
};

export default {
    group: 'frame',
    resolve: 'resolveBookmarkStripe',
    mixin: BookmarkStripeMixin
};
