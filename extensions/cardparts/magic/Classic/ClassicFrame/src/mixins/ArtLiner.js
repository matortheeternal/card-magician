const ArtLinerMixin = {
    get artLinerUrl() {
        return `${this.frameFolder}/liner.png`;
    },

    async resolveArtLiner() {
        return this.background('art-liner', this.artLinerUrl);
    },
};

export default {
    group: 'frame',
    resolve: 'resolveArtLiner',
    mixin: ArtLinerMixin
};
