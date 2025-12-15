const L = localize('module-M15-rarity');

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

    render(card) {
        const set = this.getActiveSet();
        const rarityClass = `rarity-${card.rarity.toLowerCase()}`;
        return (`<span class="${rarityClass}">${set.info.symbol || ''}</span>`);
    }

    get fields() {
        return [{
            id: 'rarity',
            type: 'select',
            label: L`Rarity`,
            group: 'footer',
            options: [
                { id: 'common',     name: L`Common` },
                { id: 'uncommon',   name: L`Uncommon` },
                { id: 'rare',       name: L`Rare` },
                { id: 'mythic',     name: L`Mythic Rare` }
            ]
        }];
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
