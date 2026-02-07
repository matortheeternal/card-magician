const ScrollsMixin = {
    get showScrolls() {
        return (this.card.scrollsStyle !== 'disabled')
            && (this.card.scrollsStyle !== 'auto' || this.card.isConspiracy?.());
    },

    get scrollsFilename() {
        if (this.card.isMiracle?.()) return 'miracle.png';
        return 'normal.png';
    },

    get scrollsUrl() {
        return this.resolveAssetPath(`element/scrolls/${this.scrollsFilename}`);
    },

    async resolveScrolls() {
        if (!this.showScrolls) return null;
        return this.background('conspiracy-scrolls', this.scrollsUrl);
    },
};

export default {
    group: 'frame',
    resolve: 'resolveScrolls',
    mixin: ScrollsMixin
};
