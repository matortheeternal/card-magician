const EmblemElementsMixin = {
    async resolveEmblemElements() {
        const image = this.resolveEmblemAssetPath('elements.png');
        return this.background('elements', image);
    },
};

export default {
    group: 'frame',
    resolve: 'resolveEmblemElements',
    mixin: EmblemElementsMixin
};
