export const rarity = (name, id) => ({
    id: id || name.toLowerCase(),
    name
});

export default class RarityModule extends CardMagicianModule {
    updateRarity(card) {
        card.rarityCharacter = card.rarity.slice(0, 1).toUpperCase();
        this.requestRender();
    }

    bind(card, watch) {
        watch(
            () => card.rarity,
            () => this.updateRarity(card)
        );
    }

    renderExpansionSymbol(card) {
        const set = this.getActiveSet();
        const rarityClass = `rarity-${card.rarity.toLowerCase()}`;
        return (`<span class="${rarityClass}">${set.info.symbol || ''}</span>`);
    }

    get fields() {
        return [{
            id: 'rarity',
            type: 'select',
            displayName: 'Rarity',
            group: 'footer',
            options: [
                rarity('Common'),
                rarity('Uncommon'),
                rarity('Rare'),
                rarity('Mythic Rare', 'mythic'),
            ],
            default: 'common',
        }];
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
