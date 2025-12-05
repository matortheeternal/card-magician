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
            label: 'Rarity',
            group: 'footer',
            options: [
                { id: 'common', name: 'Common' },
                { id: 'uncommon', name: 'Uncommon' },
                { id: 'rare', name: 'Rare' },
                { id: 'mythic', name: 'Mythic Rare' }
            ]
        }];
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
