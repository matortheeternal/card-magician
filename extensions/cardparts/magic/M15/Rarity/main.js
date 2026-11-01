const L = localize('module-M15-rarity');

export default class RarityModule extends CardMagicianModule {
    static createFields() {
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
                { id: 'land',       name: L`Basic Land` },
                { id: 'special',    name: L`Special` },
                { id: 'token',      name: L`Token` },
                { id: 'emblem',     name: L`Emblem` },
                { id: 'ad',         name: L`Ad` },
                { id: 'helper',     name: L`Helper` },
                { id: 'xcard',      name: L`Punch-Out` },
                { id: 'voucher',    name: L`Voucher` },
            ],
        }];
    }

    async init(parent, template) {
        if (template?.rarity !== undefined)
            this.fields[0].override = template.rarity;
    }

    getRarityCharacter(card) {
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
        return activeGame.renderSetSymbol(
            activeProject.symbol, card.rarity.toLowerCase()
        );
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
