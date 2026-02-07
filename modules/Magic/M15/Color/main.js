const L = localize('module-M15-color');

export default class ColorModule extends CardMagicianModule {
    async init(card) {
        const game = this.getActiveGame();
        card.colorIdentity = new game.ColorIdentity();

        card.getCardColorKey = function() {
            const colors = card.colorIdentity.colors;
            if (card.colorIdentity.isMulticolor())
                return 'm';
            if (card.colorIdentity.isArtifact())
                return 'a';
            if (colors.length === 1)
                return colors[0].char;
            return card.isArtifact?.() ? 'a' : 'c';
        };
    }

    updateCardColors(card) {
        card.colors = card.colorIdentity.colors;
    }

    async updateColorIdentity(card) {
        const overrideColors = (card.colorOverride || []);
        card.colorIdentity.setOverride(overrideColors.join(''));
        changed(card, 'colorIdentity');
    }

    bind(card, watch) {
        watch(card, 'colorOverride', () => this.updateColorIdentity(card));
        watch(card, 'colorIdentity', () => this.updateCardColors(card));
    }

    get fields() {
        return [
            { id: 'colors', type: 'computed' },
            {
                id: 'colorOverride',
                label: L`Color Override`,
                type: 'multiselect',
                options: [
                    { id: 'w', name: L`White` },
                    { id: 'u', name: L`Blue` },
                    { id: 'b', name: L`Black` },
                    { id: 'r', name: L`Red` },
                    { id: 'g', name: L`Green` },
                    { id: 'c', name: L`Colorless` },
                    { id: 'a', name: L`Artifact` },
                    { id: 'l', name: L`Land` },
                    { id: 'h', name: L`Hybrid` },
                    { id: 'm', name: L`Multicolor` },
                ]
            }
        ];
    }
}
