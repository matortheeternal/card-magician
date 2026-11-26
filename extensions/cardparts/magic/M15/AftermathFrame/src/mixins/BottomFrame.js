const BottomFrameMixin = {
    async resolveBottomFrame(card) {
        return this.resolveHalfFrame('bottom', card.bottom);
    }
};

export default {
    group: 'bottom',
    resolve: 'resolveBottomFrame',
    mixin: BottomFrameMixin,
};
