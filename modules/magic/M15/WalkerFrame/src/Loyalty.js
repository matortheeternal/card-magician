const LoyaltyMixin = {
    get loyaltyFolder() {
        return this.resolveWalkerAssetPath('loyalty');
    },

    async resolveLoyalty(card) {
        const colorKey = card.getCardColorKey();
        const image = `${this.loyaltyFolder}/${colorKey}.png`;
        return this.background('loyalty', image, 1);
    }
};

export default {
    group: 'frame',
    resolve: 'resolveLoyalty',
    mixin: LoyaltyMixin
};
