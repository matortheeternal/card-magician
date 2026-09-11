const RightPageMixin = {
    get showRightPage() {
        const isOmen = this.card.pageStyle?.includes?.('omen');
        const isSpellPage = this.card.frame === 'reversed';
        return !isOmen || !isSpellPage;
    },

    get rightPageUrl() {
        return this.resolveAdventureAssetPath('page/blank');
    },

    async resolveRightPage(card) {
        if (!this.showRightPage) return null;
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
