const supportedColorKeys = ['b', 'c', 'g', 'r', 'u', 'w'];

const LandSymbolMixin = {
    get landSymbolFolder() {
        return this.resolveLandAssetPath(`symbols`);
    },

    async resolveLandSymbol(card) {
        const colorKey = card.getCardColorKey();
        if (!supportedColorKeys.includes(colorKey)) return null;
        const image = `${this.landSymbolFolder}/${colorKey}.png`;
        return this.background('land-symbol', image);
    },
};

export default {
    group: 'frame',
    resolve: 'resolveLandSymbol',
    mixin: LandSymbolMixin
};
