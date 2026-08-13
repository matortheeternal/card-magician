const L = localize('module-M15-rarity');

export default class RarityModule extends CardMagicianModule {
    getRarityCharacter(card) {
        if (card.isToken?.()) return 'T';
        if (card.isEmblem?.()) return 'E';
        if (card.isPromo?.()) return 'P';
        return card.rarity.slice(0, 1).toUpperCase();
    }

    updateRarity(card) {
        card.rarityCharacter = this.getRarityCharacter(card);
        changed(card, 'rarityCharacter');
        this.requestRender();
    }

    bind(card, watch) {
        watch(card, 'rarity', () => this.updateRarity(card));
    }

    render(card) {
        const set = this.getActiveSet();
        const rarityClass = `rarity-${card.rarity.toLowerCase()}`;
        return set.symbol.replaceAll('"set-icon"', `"set-icon ${rarityClass}"`);
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
                { id: 'mythic',     name: L`Mythic Rare` },
                { id: 'special',     name: L`Special` }
            ]
        }];
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
