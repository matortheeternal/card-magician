import ColorIdentity from './src/ColorIdentity.js';

export default class ColorModule extends CardMagicianModule {
    async init(card) {
        card.colorIdentity = new ColorIdentity();

        card.getCardColorKey = function() {
            const colors = card.colorIdentity.colors;
            if (colors.length === 0)
                return card.isArtifact?.() ? 'a' : 'c';
            if (colors.length === 1)
                return colors[0].char;
            return 'm';
        };
    }

    updateCardColors(card) {
        card.colors = card.colorIdentity.colors;
    }

    bind(card, watch) {
        watch(() => card.colorIdentity, () => this.updateCardColors(card));
    }

    get fields() {
        return [{ id: 'colors', type: 'computed' }];
    }
}
