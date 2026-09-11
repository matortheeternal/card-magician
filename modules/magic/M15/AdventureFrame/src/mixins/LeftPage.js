const LeftPageMixin = {
    get showLeftPage() {
        const isOmen = this.card.pageStyle?.includes?.('omen');
        const isSpellPage = this.card.frame !== 'reversed';
        return !isOmen || !isSpellPage;
    },

    get leftPageUrl() {
        const leftPagePath = `page/${this.card.pageStyle || 'name_and_type'}`;
        return this.resolveAdventureAssetPath(leftPagePath);
    },

    async resolveLeftPage(card) {
        if (!this.showLeftPage) return null;
        const image = this.coloredBlend(this.leftPageUrl, card.adventure, {
            hybridMode: 'first',
            ext: '.png'
        });
        return this.background('left-page', image, 2);
    },
};

export default {
    group: 'pages',
    resolve: 'resolveLeftPage',
    mixin: LeftPageMixin
};
