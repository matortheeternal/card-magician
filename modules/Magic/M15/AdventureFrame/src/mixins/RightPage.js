const RightPageMixin = {
    get rightPageUrl() {
        return this.resolveAdvAssetPath('page/blank');
    },

    async resolveRightPage(card) {
        const image = this.coloredBlend(this.rightPageUrl, card, {
            hybridMode: 'first',
            ext: '.png'
        });
        return this.background('right-page', image, 2);
    }
};

export default {
    group: 'pages',
    resolve: 'resolveRightPage',
    mixin: RightPageMixin
};
