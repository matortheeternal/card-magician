const LeftPageMixin = {
    get leftPageUrl() {
        const leftPagePath = `page/${this.card.pageStyle || 'name_and_type'}`;
        return this.resolveAdventureAssetPath(leftPagePath);
    },

    async resolveLeftPage(card) {
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
