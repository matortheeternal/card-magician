const LeftPageMixin = {
    get leftPageUrl() {
        const leftPagePath = `page/${this.card.pageStyle || 'name_and_type'}`;
        return this.resolveAdvAssetPath(leftPagePath);
    },

    async resolveLeftPage(card) {
        const adventure = card.subcards.find(s => s.id === 'adventure');
        const image = this.coloredBlend(this.leftPageUrl, adventure, {
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
