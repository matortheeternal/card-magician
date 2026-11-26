const TopFrameMixin = {
    async resolveTopFrame(card) {
        return this.resolveHalfFrame('top', card.top);
    }
};

export default {
    group: 'top',
    resolve: 'resolveTopFrame',
    mixin: TopFrameMixin,
};
